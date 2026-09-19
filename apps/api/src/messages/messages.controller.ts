import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import { Request } from 'express';
import { AuthUser } from '../auth/auth.types';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { MessagesService } from './messages.service';

type AuthRequest = Request & { user: AuthUser };
class DirectDto { @IsString() @MinLength(3) username!: string; }
class MessageDto { @IsString() @MinLength(1) content!: string; }

@Controller('messages')
@UseGuards(TenantAuthGuard)
export class MessagesController {
  constructor(private readonly messages: MessagesService) {}
  @Get('conversations') list(@Req() req: AuthRequest){ return this.messages.list(req.user); }
  @Post('direct') direct(@Req() req: AuthRequest,@Body() dto: DirectDto){ return this.messages.createDirect(req.user,dto.username); }
  @Get(':conversationId') history(@Req() req: AuthRequest,@Param('conversationId') id:string){ return this.messages.history(req.user,id); }
  @Post(':conversationId') send(@Req() req: AuthRequest,@Param('conversationId') id:string,@Body() dto:MessageDto){ return this.messages.send(req.user,id,dto.content); }
}
