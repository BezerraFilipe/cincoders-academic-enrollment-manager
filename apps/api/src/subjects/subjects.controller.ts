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
import { CreateSubjectDto } from './dto/create-subject.dto';
import { SubjectDto, SubjectsPageDto } from './dto/subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { SubjectsService } from './subjects.service';

@ApiTags('registrar')
@ApiBearerAuth()
@Roles('REGISTRAR')
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Get()
  @ApiOkResponse({ type: SubjectsPageDto })
  list(@Query() query: PaginationQueryDto): Promise<SubjectsPageDto> {
    return this.subjectsService.list(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: SubjectDto })
  @ApiNotFoundResponse({ description: 'SUBJECT_NOT_FOUND' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<SubjectDto> {
    return this.subjectsService.findOne(id);
  }

  @Post()
  @ApiCreatedResponse({ type: SubjectDto })
  @ApiConflictResponse({ description: 'SUBJECT_CODE_TAKEN' })
  create(@Body() body: CreateSubjectDto): Promise<SubjectDto> {
    return this.subjectsService.create(body);
  }

  @Patch(':id')
  @ApiOkResponse({ type: SubjectDto })
  @ApiNotFoundResponse({ description: 'SUBJECT_NOT_FOUND' })
  @ApiConflictResponse({ description: 'SUBJECT_CODE_TAKEN' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateSubjectDto,
  ): Promise<SubjectDto> {
    return this.subjectsService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'SUBJECT_NOT_FOUND' })
  @ApiConflictResponse({ description: 'RESOURCE_IN_USE' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.subjectsService.remove(id);
  }
}
