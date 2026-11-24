import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsDivisibleBy,
  IsOptional,
  IsPositive,
  IsInt,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateSubjectDto {
  @ApiProperty({ example: 'IF668', description: 'Letras e números, único.' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @Matches(/^[A-Z0-9]{3,10}$/, {
    message: 'O código deve ter de 3 a 10 letras ou números, sem espaços.',
  })
  code!: string;

  @ApiProperty({ example: 'Introdução à Computação' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(3, { message: 'O nome deve ter pelo menos 3 caracteres.' })
  @MaxLength(150, { message: 'O nome deve ter no máximo 150 caracteres.' })
  name!: string;

  @ApiProperty({ example: 60, minimum: 15, maximum: 120, multipleOf: 15 })
  @IsInt({ message: 'A carga horária deve ser um número inteiro.' })
  @Min(15, { message: 'A carga horária mínima é 15h.' })
  @Max(120, { message: 'A carga horária máxima é 120h.' })
  @IsDivisibleBy(15, { message: 'A carga horária deve ser múltipla de 15.' })
  workloadHours!: number;

  @ApiProperty({
    example: [1, 2],
    required: false,
    description: 'Ids das disciplinas exigidas como pré-requisito.',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(20)
  @IsInt({ each: true })
  @IsPositive({ each: true })
  prerequisiteIds?: number[];
}
