import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../generated/prisma/client.js';

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

export class LoginResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty({ type: AuthUserDto })
  user!: AuthUserDto;
}
