import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isUniqueViolation } from '../common/errors/prisma-errors';
import { ResourceInUseException } from '../common/errors/resource-in-use.exception';
import { toPage, toSkip } from '../common/pagination/page';
import { PaginationQueryDto } from '../common/pagination/pagination-query.dto';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { SectionDto, SectionsPageDto } from './dto/section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { assertSectionChange } from './section-rules';

const SECTION_INCLUDE = {
  subject: { select: { id: true, code: true, name: true } },
  professor: { select: { id: true, name: true } },
  _count: { select: { enrollments: { where: { status: 'ACTIVE' as const } } } },
} as const;

type SectionWithRelations = Prisma.SectionGetPayload<{
  include: typeof SECTION_INCLUDE;
}>;

@Injectable()
export class SectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async list({
    page,
    pageSize,
    search,
  }: PaginationQueryDto): Promise<SectionsPageDto> {
    const where: Prisma.SectionWhereInput = search
      ? {
          OR: [
            { subject: { code: { contains: search, mode: 'insensitive' } } },
            { subject: { name: { contains: search, mode: 'insensitive' } } },
            { professor: { name: { contains: search, mode: 'insensitive' } } },
          ],
        }
      : {};

    const [total, sections] = await this.prisma.$transaction([
      this.prisma.section.count({ where }),
      this.prisma.section.findMany({
        where,
        include: SECTION_INCLUDE,
        orderBy: [{ subject: { code: 'asc' } }, { code: 'asc' }],
        skip: toSkip(page, pageSize),
        take: pageSize,
      }),
    ]);

    return toPage(sections.map(toSectionDto), total, page, pageSize);
  }

  async findOne(id: number): Promise<SectionDto> {
    const section = await this.prisma.section.findUnique({
      where: { id },
      include: SECTION_INCLUDE,
    });
    if (!section) throw sectionNotFound();
    return toSectionDto(section);
  }

  async create(data: CreateSectionDto): Promise<SectionDto> {
    await this.assertReferencesExist(data.subjectId, data.professorId);
    try {
      const section = await this.prisma.section.create({
        data,
        include: SECTION_INCLUDE,
      });
      return toSectionDto(section);
    } catch (error) {
      throw translateUniqueViolation(error, data.code);
    }
  }

  async update(id: number, data: UpdateSectionDto): Promise<SectionDto> {
    await this.assertReferencesExist(data.subjectId, data.professorId);

    try {
      const section = await this.prisma.$transaction(async (tx) => {
        const [current] = await tx.$queryRaw<{ subject_id: number }[]>`
          SELECT subject_id FROM "section" WHERE id = ${id} FOR UPDATE`;
        if (!current) throw sectionNotFound();

        const activeEnrollments = await tx.enrollment.count({
          where: { sectionId: id, status: 'ACTIVE' },
        });
        assertSectionChange({
          activeEnrollments,
          newCapacity: data.capacity,
          subjectChanged:
            data.subjectId !== undefined &&
            data.subjectId !== current.subject_id,
        });

        return tx.section.update({
          where: { id },
          data,
          include: SECTION_INCLUDE,
        });
      });
      return toSectionDto(section);
    } catch (error) {
      throw translateUniqueViolation(error, data.code);
    }
  }

  async remove(id: number): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const [current] = await tx.$queryRaw<{ id: number }[]>`
        SELECT id FROM "section" WHERE id = ${id} FOR UPDATE`;
      if (!current) throw sectionNotFound();

      const activeEnrollments = await tx.enrollment.count({
        where: { sectionId: id, status: 'ACTIVE' },
      });
      if (activeEnrollments > 0) {
        throw new ResourceInUseException(
          `Não é possível excluir a turma: ela tem ${activeEnrollments} ${
            activeEnrollments === 1
              ? 'aluno matriculado'
              : 'alunos matriculados'
          }.`,
        );
      }

      await tx.section.delete({ where: { id } });
    });
  }

  private async assertReferencesExist(
    subjectId?: number,
    professorId?: number,
  ) {
    const [subject, professor] = await Promise.all([
      subjectId === undefined
        ? 1
        : this.prisma.subject.count({ where: { id: subjectId } }),
      professorId === undefined
        ? 1
        : this.prisma.professor.count({ where: { id: professorId } }),
    ]);

    if (!subject) {
      throw new NotFoundException({
        code: 'SUBJECT_NOT_FOUND',
        message: 'Disciplina não encontrada.',
      });
    }
    if (!professor) {
      throw new NotFoundException({
        code: 'PROFESSOR_NOT_FOUND',
        message: 'Professor não encontrado.',
      });
    }
  }
}

function toSectionDto(section: SectionWithRelations): SectionDto {
  return {
    id: section.id,
    code: section.code,
    subject: section.subject,
    professor: section.professor,
    capacity: section.capacity,
    occupiedSeats: section._count.enrollments,
  };
}

function sectionNotFound(): NotFoundException {
  return new NotFoundException({
    code: 'SECTION_NOT_FOUND',
    message: 'Turma não encontrada.',
  });
}

function translateUniqueViolation(error: unknown, code?: string): unknown {
  if (!isUniqueViolation(error)) return error;
  return new ConflictException({
    code: 'SECTION_CODE_TAKEN',
    message: `Já existe uma turma ${code} para esta disciplina.`,
  });
}
