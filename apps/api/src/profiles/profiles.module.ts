import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../common/prisma.service';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';

@Module({
  imports: [AuthModule],
  controllers: [ProfilesController],
  providers: [PrismaService, ProfilesService, TenantAuthGuard],
})
export class ProfilesModule {}
