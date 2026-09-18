import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { IsBoolean, IsString, MinLength } from 'class-validator';
import { Request } from 'express';
import { AuthUser } from '../auth/auth.types';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { ConnectionsService } from './connections.service';

type AuthRequest = Request & { user: AuthUser };

class RequestConnectionDto {
  @IsString() @MinLength(3) username!: string;
}
class RespondDto {
  @IsBoolean() accept!: boolean;
}

@Controller('connections')
@UseGuards(TenantAuthGuard)
export class ConnectionsController {
  constructor(private readonly connections: ConnectionsService) {}

  @Get()
  list(@Req() req: AuthRequest) { return this.connections.list(req.user); }

  @Get('pending')
  pending(@Req() req: AuthRequest) { return this.connections.pending(req.user); }

  @Post('request')
  request(@Req() req: AuthRequest, @Body() dto: RequestConnectionDto) {
    return this.connections.request(req.user, dto.username);
  }

  @Post(':id/respond')
  respond(@Req() req: AuthRequest, @Param('id') id: string, @Body() dto: RespondDto) {
    return this.connections.respond(req.user, id, dto.accept);
  }

  @Delete(':id')
  remove(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.connections.remove(req.user, id);
  }
}
