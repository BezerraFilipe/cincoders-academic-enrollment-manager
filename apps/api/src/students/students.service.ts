import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface StudentContext {
  id: number;
  courseId: number;
}

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getByUserId(userId: number): Promise<StudentContext> {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      select: { id: true, courseId: true },
    });

    if (!student) {
      throw new ForbiddenException({
        code: 'STUDENT_PROFILE_NOT_FOUND',
        message: 'Usuário sem cadastro de aluno.',
      });
    }

    return student;
  }
}
