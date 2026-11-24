import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BusinessRuleException } from '../common/errors/business-rule.exception';
import { isUniqueViolation } from '../common/errors/prisma-errors';
import { ResourceInUseException } from '../common/errors/resource-in-use.exception';
import { toPage, toSkip } from '../common/pagination/page';
import { PaginationQueryDto } from '../common/pagination/pagination-query.dto';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { SubjectDto, SubjectsPageDto } from './dto/subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { createsCycle } from './prerequisite-graph';

const PREREQUISITE_GRAPH_LOCK = 7_401;

const SUBJECT_SELECT = {
  id: true,
  code: true,
  name: true,
  workloadHours: true,
  prerequisites: {
    select: { prerequisite: { select: { id: true, code: true, name: true } } },
    orderBy: { prerequisite: { code: 'asc' } },
  },
} as const;

type SubjectRow = Prisma.SubjectGetPayload<{ select: typeof SUBJECT_SELECT }>;
type Transaction = Prisma.TransactionClient;

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

    return toPage(items.map(toSubjectDto), total, page, pageSize);
  }

  async findOne(id: number): Promise<SubjectDto> {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      select: SUBJECT_SELECT,
    });
    if (!subject) throw subjectNotFound();
    return toSubjectDto(subject);
  }

  async create({
    prerequisiteIds,
    ...data
  }: CreateSubjectDto): Promise<SubjectDto> {
    try {
      const subject = await this.prisma.$transaction(async (tx) => {
        await lockPrerequisiteGraph(tx);
        const created = await tx.subject.create({ data, select: { id: true } });
        if (prerequisiteIds) {
          await replacePrerequisites(tx, created.id, prerequisiteIds);
        }
        return tx.subject.findUniqueOrThrow({
          where: { id: created.id },
          select: SUBJECT_SELECT,
        });
      });
      return toSubjectDto(subject);
    } catch (error) {
      throw translateUniqueViolation(error, data.code);
    }
  }

  async update(
    id: number,
    { prerequisiteIds, ...data }: UpdateSubjectDto,
  ): Promise<SubjectDto> {
    await this.findOne(id);
    try {
      const subject = await this.prisma.$transaction(async (tx) => {
        await lockPrerequisiteGraph(tx);
        await tx.subject.update({ where: { id }, data });
        if (prerequisiteIds) {
          await replacePrerequisites(tx, id, prerequisiteIds);
        }
        return tx.subject.findUniqueOrThrow({
          where: { id },
          select: SUBJECT_SELECT,
        });
      });
      return toSubjectDto(subject);
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

async function lockPrerequisiteGraph(tx: Transaction): Promise<void> {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(${PREREQUISITE_GRAPH_LOCK})`;
}

async function replacePrerequisites(
  tx: Transaction,
  subjectId: number,
  prerequisiteIds: number[],
): Promise<void> {
  if (prerequisiteIds.includes(subjectId)) {
    throw new BusinessRuleException(
      'PREREQUISITE_CYCLE',
      'Uma disciplina não pode ser pré-requisito de si mesma.',
    );
  }

  const existing = await tx.subject.count({
    where: { id: { in: prerequisiteIds } },
  });
  if (existing !== prerequisiteIds.length) {
    throw new BusinessRuleException(
      'PREREQUISITE_NOT_FOUND',
      'Algum dos pré-requisitos informados não existe.',
    );
  }

  const edges = await tx.prerequisite.findMany({
    select: { subjectId: true, prerequisiteId: true },
  });
  if (createsCycle(edges, subjectId, prerequisiteIds)) {
    throw new BusinessRuleException(
      'PREREQUISITE_CYCLE',
      'Esses pré-requisitos criariam um ciclo: uma disciplina passaria a exigir a si mesma indiretamente.',
    );
  }

  await tx.prerequisite.deleteMany({ where: { subjectId } });
  await tx.prerequisite.createMany({
    data: prerequisiteIds.map((prerequisiteId) => ({
      subjectId,
      prerequisiteId,
    })),
  });
}

function toSubjectDto(subject: SubjectRow): SubjectDto {
  return {
    id: subject.id,
    code: subject.code,
    name: subject.name,
    workloadHours: subject.workloadHours,
    prerequisites: subject.prerequisites.map((item) => item.prerequisite),
  };
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
