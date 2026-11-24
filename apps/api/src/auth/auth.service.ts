import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from './authenticated-user';
import { CurrentUserDto, LoginResponseDto } from './dto/auth-user.dto';

const DUMMY_PASSWORD_HASH =
  '$2b$10$6a34JsBYhj9DL4uCCU946e8f8kntv.ExSwEWr9UGQuNy3JIss9uiC';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<LoginResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    const passwordMatches = await compare(
      password,
      user?.passwordHash ?? DUMMY_PASSWORD_HASH,
    );

    if (!user || !passwordMatches) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'E-mail ou senha inválidos.',
      });
    }

    const payload: JwtPayload = { sub: user.id, role: user.role };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getProfile(userId: number): Promise<CurrentUserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        student: {
          select: {
            registrationNumber: true,
            course: { select: { code: true, name: true } },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException({
        code: 'INVALID_TOKEN',
        message: 'Sessão inválida. Entre novamente.',
      });
    }

    const { student, ...profile } = user;
    return student ? { ...profile, student } : profile;
  }
}
