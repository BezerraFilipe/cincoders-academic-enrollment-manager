import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { AuthenticatedUser } from '../auth/authenticated-user';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ProgressDto } from './dto/progress.dto';
import { ProgressService } from './progress.service';

@ApiTags('student')
@ApiBearerAuth()
@Roles('STUDENT')
@Controller('me/progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  @ApiOkResponse({ type: ProgressDto })
  get(@CurrentUser() user: AuthenticatedUser): Promise<ProgressDto> {
    return this.progressService.getForStudent(user.id);
  }
}
