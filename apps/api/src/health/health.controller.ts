import { Controller, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiTags,
  ApiServiceUnavailableResponse,
} from '@nestjs/swagger';
import { HealthStatusDto } from './dto/health-status.dto';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOkResponse({ type: HealthStatusDto, description: 'API e banco no ar.' })
  @ApiServiceUnavailableResponse({
    description: 'Banco de dados indisponível.',
  })
  check(): Promise<HealthStatusDto> {
    return this.healthService.check();
  }
}
