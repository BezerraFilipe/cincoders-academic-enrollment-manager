import { ApiProperty } from '@nestjs/swagger';

class SectionSubjectDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'IF669' })
  code!: string;

  @ApiProperty({ example: 'Introdução à Programação' })
  name!: string;
}

class SectionProfessorDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Paulo Borba' })
  name!: string;
}

export class SectionDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'A' })
  code!: string;

  @ApiProperty({ type: SectionSubjectDto })
  subject!: SectionSubjectDto;

  @ApiProperty({ type: SectionProfessorDto })
  professor!: SectionProfessorDto;

  @ApiProperty({ example: 40 })
  capacity!: number;

  @ApiProperty({ example: 12 })
  occupiedSeats!: number;
}

export class SectionsPageDto {
  @ApiProperty({ type: [SectionDto] })
  items!: SectionDto[];

  @ApiProperty({ example: 14 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  pageSize!: number;

  @ApiProperty({ example: 2 })
  totalPages!: number;
}
