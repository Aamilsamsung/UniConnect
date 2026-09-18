import { Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthUser } from '../auth/auth.types';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { FollowsService } from './follows.service';
type AuthRequest = Request & { user: AuthUser };
@Controller('follows')
@UseGuards(TenantAuthGuard)
export class FollowsController {
  constructor(private readonly follows: FollowsService) {}
  @Get('following') following(@Req() req: AuthRequest) { return this.follows.listFollowing(req.user); }
  @Get('followers') followers(@Req() req: AuthRequest) { return this.follows.listFollowers(req.user); }
  @Post(':username') follow(@Req() req: AuthRequest, @Param('username') username: string) { return this.follows.follow(req.user, username); }
  @Delete(':username') unfollow(@Req() req: AuthRequest, @Param('username') username: string) { return this.follows.unfollow(req.user, username); }
}