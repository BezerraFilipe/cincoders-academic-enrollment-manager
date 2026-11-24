import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { PaginationQueryDto } from '../common/pagination/pagination-query.dto';
import { CreateProfessorDto } from './dto/create-professor.dto';
import { ProfessorDto, ProfessorsPageDto } from './dto/professor.dto';
import { UpdateProfessorDto } from './dto/update-professor.dto';
import { ProfessorsService } from './professors.service';

@ApiTags('registrar')
@ApiBearerAuth()
@Roles('REGISTRAR')
@Controller('professors')
export class ProfessorsController {
  constructor(private readonly professorsService: ProfessorsService) {}

  @Get()
  @ApiOkResponse({ type: ProfessorsPageDto })
  list(@Query() query: PaginationQueryDto): Promise<ProfessorsPageDto> {
    return this.professorsService.list(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: ProfessorDto })
  @ApiNotFoundResponse({ description: 'PROFESSOR_NOT_FOUND' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ProfessorDto> {
    return this.professorsService.findOne(id);
  }

  @Post()
  @ApiCreatedResponse({ type: ProfessorDto })
  @ApiConflictResponse({ description: 'PROFESSOR_EMAIL_TAKEN' })
  create(@Body() body: CreateProfessorDto): Promise<ProfessorDto> {
    return this.professorsService.create(body);
  }

  @Patch(':id')
  @ApiOkResponse({ type: ProfessorDto })
  @ApiNotFoundResponse({ description: 'PROFESSOR_NOT_FOUND' })
  @ApiConflictResponse({ description: 'PROFESSOR_EMAIL_TAKEN' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProfessorDto,
  ): Promise<ProfessorDto> {
    return this.professorsService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'PROFESSOR_NOT_FOUND' })
  @ApiConflictResponse({ description: 'RESOURCE_IN_USE' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.professorsService.remove(id);
  }
}
