import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedUser } from '../auth/authenticated-user';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { PaginationQueryDto } from '../common/pagination/pagination-query.dto';
import { OfferingsPageDto } from './dto/offering.dto';
import { OfferingsService } from './offerings.service';

@ApiTags('student')
@ApiBearerAuth()
@Roles('STUDENT')
@Controller('me/offerings')
export class OfferingsController {
  constructor(private readonly offeringsService: OfferingsService) {}

  @Get()
  @ApiOkResponse({ type: OfferingsPageDto })
  @ApiForbiddenResponse({ description: 'Disponível apenas para alunos.' })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: PaginationQueryDto,
  ): Promise<OfferingsPageDto> {
    return this.offeringsService.listForStudent(user.id, query);
  }
}
