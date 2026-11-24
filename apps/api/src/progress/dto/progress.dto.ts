import { ApiProperty } from '@nestjs/swagger';
import { SubjectCategory } from '../../curriculum/subject-category';

export class GroupProgressDto {
  @ApiProperty({ enum: Object.values(SubjectCategory) })
  group!: SubjectCategory;

  @ApiProperty({ example: 300 })
  requiredHours!: number;

  @ApiProperty({ example: 180 })
  completedHours!: number;

  @ApiProperty({ example: 60 })
  inProgressHours!: number;

  @ApiProperty({ example: 120 })
  remainingHours!: number;

  @ApiProperty({ example: 60, minimum: 0, maximum: 100 })
  completionPercentage!: number;
}

export class ProgressCourseDto {
  @ApiProperty({ example: 'CC' })
  code!: string;

  @ApiProperty({ example: 'Ciência da Computação' })
  name!: string;
}

export class ProgressDto {
  @ApiProperty({ type: ProgressCourseDto })
  course!: ProgressCourseDto;

  @ApiProperty({ type: [GroupProgressDto] })
  groups!: GroupProgressDto[];
}
