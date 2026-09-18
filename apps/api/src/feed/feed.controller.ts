import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Request } from 'express';
import { AuthUser } from '../auth/auth.types';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { FeedService } from './feed.service';

type AuthRequest = Request & { user: AuthUser };

class CreatePostDto {
  @IsString() @MinLength(1) @MaxLength(5000) content!: string;
  @IsOptional() @IsString() communityId?: string;
}

@Controller('feed')
@UseGuards(TenantAuthGuard)
export class FeedController {
  constructor(private readonly feed: FeedService) {}

  @Get()
  list(@Req() req: AuthRequest) { return this.feed.list(req.user); }

  @Post()
  create(@Req() req: AuthRequest, @Body() dto: CreatePostDto) { return this.feed.create(req.user, dto); }

  @Delete(':id')
  remove(@Req() req: AuthRequest, @Param('id') id: string) { return this.feed.remove(req.user, id); }
}
