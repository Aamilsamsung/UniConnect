import { Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { IsEnum, IsOptional } from 'class-validator';
import { Request } from 'express';
import { AuthUser } from '../auth/auth.types';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { ProfilesService } from './profiles.service';

type AuthRequest = Request & { user: AuthUser };
const DISCOVERABILITY = ['UNIVERSITY_ONLY', 'CONNECTIONS_ONLY', 'ANYONE'] as const;
const PERMISSIONS = ['EVERYONE', 'UNIVERSITY_ONLY', 'CONNECTIONS_ONLY', 'NOBODY'] as const;

class PrivacyDto {
  @IsOptional() @IsEnum(DISCOVERABILITY) profileDiscoverability?: typeof DISCOVERABILITY[number];
  @IsOptional() @IsEnum(PERMISSIONS) friendRequestPolicy?: typeof PERMISSIONS[number];
  @IsOptional() @IsEnum(PERMISSIONS) messagePolicy?: typeof PERMISSIONS[number];
  @IsOptional() @IsEnum(PERMISSIONS) onlineStatusPolicy?: typeof PERMISSIONS[number];
}

@Controller('profiles')
@UseGuards(TenantAuthGuard)
export class ProfilesController {
  constructor(private readonly profiles: ProfilesService) {}

  @Get('me')
  me(@Req() req: AuthRequest) { return this.profiles.me(req.user); }

  @Patch('me/privacy')
  privacy(@Req() req: AuthRequest, @Body() dto: PrivacyDto) { return this.profiles.updatePrivacy(req.user, dto); }

  @Get(':username')
  get(@Req() req: AuthRequest, @Param('username') username: string) { return this.profiles.get(req.user, username); }
}
