import { Module } from '@nestjs/common';
import { CurriculumModule } from '../curriculum/curriculum.module';
import { StudentsModule } from '../students/students.module';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';

@Module({
  imports: [StudentsModule, CurriculumModule],
  controllers: [ProgressController],
  providers: [ProgressService],
})
export class ProgressModule {}
