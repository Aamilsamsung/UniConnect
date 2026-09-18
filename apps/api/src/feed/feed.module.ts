import { Module } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';

@Module({
  imports: [AuthModule],
  controllers: [FeedController],
  providers: [PrismaService, FeedService, TenantAuthGuard],
})
export class FeedModule {}
