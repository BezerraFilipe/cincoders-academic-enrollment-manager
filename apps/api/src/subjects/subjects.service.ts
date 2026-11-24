import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ResourceInUseException } from '../common/errors/resource-in-use.exception';
import { isUniqueViolation } from '../common/errors/prisma-errors';
import { toPage, toSkip } from '../common/pagination/page';
import { PaginationQueryDto } from '../common/pagination/pagination-query.dto';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { SubjectDto, SubjectsPageDto } from './dto/subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

const SUBJECT_SELECT = {
  id: true,
  code: true,
  name: true,
  workloadHours: true,
} as const;

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async list({
    page,
    pageSize,
    search,
  }: PaginationQueryDto): Promise<SubjectsPageDto> {
    const where: Prisma.SubjectWhereInput = search
      ? {
          OR: [
            { code: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [total, items] = await this.prisma.$transaction([
      this.prisma.subject.count({ where }),
      this.prisma.subject.findMany({
        where,
        select: SUBJECT_SELECT,
        orderBy: { code: 'asc' },
        skip: toSkip(page, pageSize),
        take: pageSize,
      }),
    ]);

    return toPage(items, total, page, pageSize);
  }

  async findOne(id: number): Promise<SubjectDto> {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      select: SUBJECT_SELECT,
    });
    if (!subject) throw subjectNotFound();
    return subject;
  }

  async create(data: CreateSubjectDto): Promise<SubjectDto> {
    try {
      return await this.prisma.subject.create({ data, select: SUBJECT_SELECT });
    } catch (error) {
      throw translateUniqueViolation(error, data.code);
    }
  }

  async update(id: number, data: UpdateSubjectDto): Promise<SubjectDto> {
    await this.findOne(id);
    try {
      return await this.prisma.subject.update({
        where: { id },
        data,
        select: SUBJECT_SELECT,
      });
    } catch (error) {
      throw translateUniqueViolation(error, data.code);
    }
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    const [sections, records, curriculum, requiredBy] = await Promise.all([
      this.prisma.section.count({ where: { subjectId: id } }),
      this.prisma.academicRecord.count({ where: { subjectId: id } }),
      this.prisma.curriculumSubject.count({ where: { subjectId: id } }),
      this.prisma.prerequisite.count({ where: { prerequisiteId: id } }),
    ]);

    const reasons = [
      sections && 'possui turmas',
      records && 'consta no histórico de alunos',
      curriculum && 'faz parte de estruturas curriculares',
      requiredBy && 'é pré-requisito de outras disciplinas',
    ].filter(Boolean);

    if (reasons.length) {
      throw new ResourceInUseException(
        `Não é possível excluir a disciplina: ela ${reasons.join(', ')}.`,
      );
    }

    await this.prisma.subject.delete({ where: { id } });
  }
}

function subjectNotFound(): NotFoundException {
  return new NotFoundException({
    code: 'SUBJECT_NOT_FOUND',
    message: 'Disciplina não encontrada.',
  });
}

function translateUniqueViolation(error: unknown, code?: string): unknown {
  if (!isUniqueViolation(error)) return error;
  return new ConflictException({
    code: 'SUBJECT_CODE_TAKEN',
    message: `Já existe uma disciplina com o código ${code}.`,
  });
}
