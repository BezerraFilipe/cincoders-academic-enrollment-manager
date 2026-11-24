import { Module } from '@nestjs/common';
import { CurriculumModule } from '../curriculum/curriculum.module';
import { StudentsModule } from '../students/students.module';
import { OfferingsController } from './offerings.controller';
import { OfferingsService } from './offerings.service';

@Module({
  imports: [StudentsModule, CurriculumModule],
  controllers: [OfferingsController],
  providers: [OfferingsService],
})
export class OfferingsModule {}
