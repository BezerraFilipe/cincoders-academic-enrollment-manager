import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { envValidationSchema } from './config/env.validation';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { HealthModule } from './health/health.module';
import { OfferingsModule } from './offerings/offerings.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProfessorsModule } from './professors/professors.module';
import { ProgressModule } from './progress/progress.module';
import { SubjectsModule } from './subjects/subjects.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    PrismaModule,
    AuthModule,
    HealthModule,
    OfferingsModule,
    EnrollmentsModule,
    ProgressModule,
    SubjectsModule,
    ProfessorsModule,
  ],
})
export class AppModule {}
