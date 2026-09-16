import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', service: 'uniconnect-api', timestamp: new Date().toISOString() };
  }
}
