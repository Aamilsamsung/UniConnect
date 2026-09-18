import { Module } from '@nestjs/common';
import { PrismaService } from './common/prisma.service';
import { AuthModule } from './auth/auth.module';
import { CommunitiesModule } from './communities/communities.module';
import { FeedModule } from './feed/feed.module';
import { ProfilesModule } from './profiles/profiles.module';
import { EventsModule } from './events/events.module';
import { ConnectionsModule } from './connections/connections.module';
import { HealthController } from './health.controller';
import { FollowsModule } from './connections/follows.module';

@Module({
  imports: [AuthModule, CommunitiesModule, FeedModule, ProfilesModule, EventsModule, ConnectionsModule, FollowsModule],
  controllers: [HealthController],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
