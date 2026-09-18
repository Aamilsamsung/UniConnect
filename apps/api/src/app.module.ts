import { Module } from '@nestjs/common';
import { PrismaService } from './common/prisma.service';
import { AuthModule } from './auth/auth.module';
import { CommunitiesModule } from './communities/communities.module';
import { FeedModule } from './feed/feed.module';
import { ProfilesModule } from './profiles/profiles.module';
import { EventsModule } from './events/events.module';
import { ConnectionsModule } from './connections/connections.module';
import { HealthController } from './health.controller';

@Module({
  imports: [AuthModule, CommunitiesModule, FeedModule, ProfilesModule, EventsModule, ConnectionsModule],
  controllers: [HealthController],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
