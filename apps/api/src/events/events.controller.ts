import { Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthUser } from '../auth/auth.types';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { EventsService } from './events.service';

type AuthRequest = Request & { user: AuthUser };

@Controller('events')
@UseGuards(TenantAuthGuard)
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Get()
  list(@Req() req: AuthRequest) { return this.events.list(req.user); }

  @Get(':id')
  get(@Req() req: AuthRequest, @Param('id') id: string) { return this.events.get(req.user, id); }

  @Post(':id/attend')
  attend(@Req() req: AuthRequest, @Param('id') id: string) { return this.events.attend(req.user, id); }

  @Delete(':id/attend')
  leave(@Req() req: AuthRequest, @Param('id') id: string) { return this.events.leave(req.user, id); }
}
