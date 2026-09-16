import { Module } from '@nestjs/common';
import { PrismaService } from './common/prisma.service';
import { AuthModule } from './auth/auth.module';
import { CommunitiesModule } from './communities/communities.module';
import { HealthController } from './health.controller';

@Module({
  imports: [AuthModule, CommunitiesModule],
  controllers: [HealthController],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
