import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../common/prisma.service';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { CommunitiesController } from './communities.controller';
import { CommunitiesService } from './communities.service';

@Module({
  imports: [AuthModule],
  controllers: [CommunitiesController],
  providers: [PrismaService, CommunitiesService, TenantAuthGuard],
})
export class CommunitiesModule {}
