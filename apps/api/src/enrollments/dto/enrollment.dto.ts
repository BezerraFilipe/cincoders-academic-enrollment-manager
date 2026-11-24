import { ApiProperty } from '@nestjs/swagger';

export class EnrollmentSubjectDto {
  @ApiProperty({ example: 'IF669' })
  code!: string;

  @ApiProperty({ example: 'Introdução à Programação' })
  name!: string;

  @ApiProperty({ example: 60 })
  workloadHours!: number;
}

export class EnrollmentDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  sectionId!: number;

  @ApiProperty({ example: 'A' })
  sectionCode!: string;

  @ApiProperty({ type: EnrollmentSubjectDto })
  subject!: EnrollmentSubjectDto;

  @ApiProperty({ example: 'Paulo Borba' })
  professorName!: string;

  @ApiProperty()
  createdAt!: Date;
}
