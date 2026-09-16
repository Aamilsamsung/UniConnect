import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthUser } from '../auth/auth.types';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { CommunitiesService } from './communities.service';

type AuthenticatedRequest = Request & { user: AuthUser };

@Controller('communities')
@UseGuards(TenantAuthGuard)
export class CommunitiesController {
  constructor(private readonly communities: CommunitiesService) {}

  @Get()
  list(@Req() req: AuthenticatedRequest) { return this.communities.list(req.user); }

  @Get(':id')
  get(@Req() req: AuthenticatedRequest, @Param('id') id: string) { return this.communities.get(req.user, id); }

  @Post(':id/join')
  join(@Req() req: AuthenticatedRequest, @Param('id') id: string) { return this.communities.join(req.user, id); }
}
