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
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { PaginationQueryDto } from '../common/pagination/pagination-query.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { SectionDto, SectionsPageDto } from './dto/section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { SectionsService } from './sections.service';

@ApiTags('registrar')
@ApiBearerAuth()
@Roles('REGISTRAR')
@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Get()
  @ApiOkResponse({ type: SectionsPageDto })
  list(@Query() query: PaginationQueryDto): Promise<SectionsPageDto> {
    return this.sectionsService.list(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: SectionDto })
  @ApiNotFoundResponse({ description: 'SECTION_NOT_FOUND' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<SectionDto> {
    return this.sectionsService.findOne(id);
  }

  @Post()
  @ApiCreatedResponse({ type: SectionDto })
  @ApiNotFoundResponse({
    description: 'SUBJECT_NOT_FOUND ou PROFESSOR_NOT_FOUND',
  })
  @ApiConflictResponse({ description: 'SECTION_CODE_TAKEN' })
  create(@Body() body: CreateSectionDto): Promise<SectionDto> {
    return this.sectionsService.create(body);
  }

  @Patch(':id')
  @ApiOkResponse({ type: SectionDto })
  @ApiNotFoundResponse({
    description: 'SECTION_NOT_FOUND, SUBJECT_NOT_FOUND ou PROFESSOR_NOT_FOUND',
  })
  @ApiConflictResponse({ description: 'SECTION_CODE_TAKEN' })
  @ApiUnprocessableEntityResponse({
    description: 'CAPACITY_BELOW_ENROLLED ou SECTION_HAS_ENROLLMENTS',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateSectionDto,
  ): Promise<SectionDto> {
    return this.sectionsService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ description: 'SECTION_NOT_FOUND' })
  @ApiConflictResponse({ description: 'RESOURCE_IN_USE' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.sectionsService.remove(id);
  }
}
