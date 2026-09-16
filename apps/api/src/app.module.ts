import { Module } from '@nestjs/common';
import { PrismaService } from './common/prisma.service';
import { AuthModule } from './auth/auth.module';
import { CommunitiesModule } from './communities/communities.module';

@Module({
  imports: [AuthModule, CommunitiesModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
