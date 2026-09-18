import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../common/prisma.service';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  imports: [AuthModule],
  controllers: [EventsController],
  providers: [PrismaService, EventsService, TenantAuthGuard],
})
export class EventsModule {}
