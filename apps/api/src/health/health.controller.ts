import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { HealthStatusDto } from './dto/health-status.dto';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOkResponse({ type: HealthStatusDto, description: 'A API está no ar.' })
  check(): HealthStatusDto {
    return this.healthService.check();
  }
}