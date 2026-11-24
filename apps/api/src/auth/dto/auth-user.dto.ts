import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../generated/prisma/client.js';

export class StudentCourseDto {
  @ApiProperty({ example: 'CC' })
  code!: string;

  @ApiProperty({ example: 'Ciência da Computação' })
  name!: string;
}

export class StudentProfileDto {
  @ApiProperty({ example: '20230001' })
  registrationNumber!: string;

  @ApiProperty({ type: StudentCourseDto })
  course!: StudentCourseDto;
}

export class AuthUserDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Ana Souza' })
  name!: string;

  @ApiProperty({ example: 'ana.souza@cin.ufpe.br' })
  email!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.STUDENT })
  role!: UserRole;
}

export class CurrentUserDto extends AuthUserDto {
  @ApiPropertyOptional({
    type: StudentProfileDto,
    description: 'Presente apenas para usuários com perfil de aluno.',
  })
  student?: StudentProfileDto;
}

export class LoginResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty({ type: AuthUserDto })
  user!: AuthUserDto;
}
