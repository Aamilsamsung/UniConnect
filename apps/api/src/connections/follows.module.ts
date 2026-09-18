import { Module } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { FollowsController } from './follows.controller';
import { FollowsService } from './follows.service';
@Module({
  imports: [AuthModule],
  controllers: [FollowsController],
  providers: [PrismaService, FollowsService, TenantAuthGuard],
})
export class FollowsModule {}