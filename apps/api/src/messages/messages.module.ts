import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../common/prisma.service';
import { MessagesController } from './messages.controller';
import { MessagesGateway } from './messages.gateway';
import { MessagesService } from './messages.service';

@Module({
  imports: [AuthModule],
  controllers: [MessagesController],
  providers: [PrismaService, MessagesService, MessagesGateway],
})
export class MessagesModule {}
