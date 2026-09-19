import { Module } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
@Module({controllers:[MessagesController],providers:[PrismaService,MessagesService]})
export class MessagesModule {}
