import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../common/prisma.service';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { ConnectionsController } from './connections.controller';
import { ConnectionsService } from './connections.service';

@Module({
  imports: [AuthModule],
  controllers: [ConnectionsController],
  providers: [PrismaService, ConnectionsService, TenantAuthGuard],
})
export class ConnectionsModule {}
