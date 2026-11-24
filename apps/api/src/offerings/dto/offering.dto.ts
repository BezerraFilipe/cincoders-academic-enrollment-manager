import { ApiProperty } from '@nestjs/swagger';
import { SubjectCategory } from '../../curriculum/subject-category';

export class OfferingSubjectDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'IF669' })
  code!: string;

  @ApiProperty({ example: 'Introdução à Programação' })
  name!: string;

  @ApiProperty({ example: 60 })
  workloadHours!: number;
}

export class OfferingDto {
  @ApiProperty({ example: 1 })
  sectionId!: number;

  @ApiProperty({ example: 'A' })
  sectionCode!: string;

  @ApiProperty({ type: OfferingSubjectDto })
  subject!: OfferingSubjectDto;

  @ApiProperty({ example: 'Paulo Borba' })
  professorName!: string;

  @ApiProperty({ example: 40 })
  capacity!: number;

  @ApiProperty({ example: 12 })
  occupiedSeats!: number;

  @ApiProperty({ example: 28 })
  availableSeats!: number;

  @ApiProperty({ enum: Object.values(SubjectCategory) })
  category!: SubjectCategory;

  @ApiProperty({ description: 'O aluno tem matrícula ativa nesta turma.' })
  enrolled!: boolean;

  @ApiProperty({
    description:
      'O aluno tem matrícula ativa em alguma turma desta disciplina (nesta ou em outra).',
  })
  enrolledInSubject!: boolean;

  @ApiProperty({ description: 'O aluno já foi aprovado nesta disciplina.' })
  alreadyPassed!: boolean;
}

export class OfferingsPageDto {
  @ApiProperty({ type: [OfferingDto] })
  items!: OfferingDto[];

  @ApiProperty({ example: 14 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  pageSize!: number;

  @ApiProperty({ example: 2 })
  totalPages!: number;
}
