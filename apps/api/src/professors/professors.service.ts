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
import { CreateProfessorDto } from './dto/create-professor.dto';
import { ProfessorDto, ProfessorsPageDto } from './dto/professor.dto';
import { UpdateProfessorDto } from './dto/update-professor.dto';

const PROFESSOR_SELECT = { id: true, name: true, email: true } as const;

@Injectable()
export class ProfessorsService {
  constructor(private readonly prisma: PrismaService) {}

  async list({
    page,
    pageSize,
    search,
  }: PaginationQueryDto): Promise<ProfessorsPageDto> {
    const where: Prisma.ProfessorWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [total, items] = await this.prisma.$transaction([
      this.prisma.professor.count({ where }),
      this.prisma.professor.findMany({
        where,
        select: PROFESSOR_SELECT,
        orderBy: { name: 'asc' },
        skip: toSkip(page, pageSize),
        take: pageSize,
      }),
    ]);

    return toPage(items, total, page, pageSize);
  }

  async findOne(id: number): Promise<ProfessorDto> {
    const professor = await this.prisma.professor.findUnique({
      where: { id },
      select: PROFESSOR_SELECT,
    });
    if (!professor) {
      throw new NotFoundException({
        code: 'PROFESSOR_NOT_FOUND',
        message: 'Professor não encontrado.',
      });
    }
    return professor;
  }

  async create(data: CreateProfessorDto): Promise<ProfessorDto> {
    try {
      return await this.prisma.professor.create({
        data,
        select: PROFESSOR_SELECT,
      });
    } catch (error) {
      throw translateUniqueViolation(error, data.email);
    }
  }

  async update(id: number, data: UpdateProfessorDto): Promise<ProfessorDto> {
    await this.findOne(id);
    try {
      return await this.prisma.professor.update({
        where: { id },
        data,
        select: PROFESSOR_SELECT,
      });
    } catch (error) {
      throw translateUniqueViolation(error, data.email);
    }
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    const sections = await this.prisma.section.count({
      where: { professorId: id },
    });
    if (sections > 0) {
      throw new ResourceInUseException(
        `Não é possível excluir o professor: ele é responsável por ${sections} ${
          sections === 1 ? 'turma' : 'turmas'
        }.`,
      );
    }

    await this.prisma.professor.delete({ where: { id } });
  }
}

function translateUniqueViolation(error: unknown, email?: string): unknown {
  if (!isUniqueViolation(error)) return error;
  return new ConflictException({
    code: 'PROFESSOR_EMAIL_TAKEN',
    message: `Já existe um professor com o e-mail ${email}.`,
  });
}
