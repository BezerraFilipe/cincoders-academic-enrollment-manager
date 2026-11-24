import { ApiProperty } from '@nestjs/swagger';

export class SubjectDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'IF668' })
  code!: string;

  @ApiProperty({ example: 'Introdução à Computação' })
  name!: string;

  @ApiProperty({ example: 60 })
  workloadHours!: number;
}

export class SubjectsPageDto {
  @ApiProperty({ type: [SubjectDto] })
  items!: SubjectDto[];

  @ApiProperty({ example: 14 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  pageSize!: number;

  @ApiProperty({ example: 2 })
  totalPages!: number;
}
