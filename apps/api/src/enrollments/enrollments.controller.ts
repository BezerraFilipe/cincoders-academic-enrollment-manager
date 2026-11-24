import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import type { AuthenticatedUser } from '../auth/authenticated-user';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { EnrollmentDto } from './dto/enrollment.dto';
import { EnrollmentsService } from './enrollments.service';

@ApiTags('student')
@ApiBearerAuth()
@Roles('STUDENT')
@Controller('me/enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get()
  @ApiOkResponse({ type: [EnrollmentDto] })
  list(@CurrentUser() user: AuthenticatedUser): Promise<EnrollmentDto[]> {
    return this.enrollmentsService.listActive(user.id);
  }

  @Post()
  @ApiCreatedResponse({ type: EnrollmentDto })
  @ApiNotFoundResponse({ description: 'Turma não encontrada.' })
  @ApiUnprocessableEntityResponse({
    description:
      'Regra de negócio violada: SECTION_FULL, SUBJECT_ALREADY_PASSED ou DUPLICATE_ACTIVE_ENROLLMENT.',
  })
  enroll(
    @CurrentUser() user: AuthenticatedUser,
    @Body() { sectionId }: CreateEnrollmentDto,
  ): Promise<EnrollmentDto> {
    return this.enrollmentsService.enroll(user.id, sectionId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({
    description: 'Matrícula cancelada; a vaga volta para a turma.',
  })
  @ApiNotFoundResponse({
    description: 'Matrícula inexistente ou de outro aluno.',
  })
  @ApiUnprocessableEntityResponse({ description: 'ENROLLMENT_NOT_ACTIVE' })
  cancel(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.enrollmentsService.cancel(user.id, id);
  }
}
