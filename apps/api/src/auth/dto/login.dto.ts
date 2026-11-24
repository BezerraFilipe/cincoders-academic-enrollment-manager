import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'ana.souza@cin.ufpe.br' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Informe um e-mail válido.' })
  @MaxLength(255)
  email!: string;

  @ApiProperty({ example: 'Senha@123' })
  @IsString()
  @IsNotEmpty({ message: 'Informe a senha.' })
  @MaxLength(128)
  password!: string;
}
