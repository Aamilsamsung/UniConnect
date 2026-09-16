import { Module } from '@nestjs/common';
import { PrismaService } from './common/prisma.service';
import { CommunitiesModule } from './communities/communities.module';

@Module({
  imports: [CommunitiesModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
