import { ApiProperty } from '@nestjs/swagger';

export class ProfessorDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Paulo Borba' })
  name!: string;

  @ApiProperty({ example: 'paulo.borba@cin.ufpe.br' })
  email!: string;
}

export class ProfessorsPageDto {
  @ApiProperty({ type: [ProfessorDto] })
  items!: ProfessorDto[];

  @ApiProperty({ example: 4 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  pageSize!: number;

  @ApiProperty({ example: 1 })
  totalPages!: number;
}
