import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsPositive,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CreateSectionDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  subjectId!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  professorId!: number;

  @ApiProperty({ example: 'A', description: 'Até 5 letras ou números.' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @Matches(/^[A-Z0-9]{1,5}$/, {
    message: 'O código da turma deve ter de 1 a 5 letras ou números.',
  })
  code!: string;

  @ApiProperty({ example: 40, minimum: 1 })
  @IsInt({ message: 'O número de vagas deve ser um número inteiro.' })
  @Min(1, { message: 'A turma deve ter pelo menos 1 vaga.' })
  @Max(1000, { message: 'A turma pode ter no máximo 1000 vagas.' })
  capacity!: number;
}
