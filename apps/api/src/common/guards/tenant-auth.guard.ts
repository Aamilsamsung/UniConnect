import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthUser } from '../../auth/auth.types';

type RequestWithUser = Request & { user?: AuthUser };

@Injectable()
export class TenantAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw new UnauthorizedException('Authentication required.');

    try {
      const payload = this.jwt.verify<{ sub: string; universityId: string; role: AuthUser['role'] }>(header.slice(7));
      if (!payload.sub || !payload.universityId || !payload.role) throw new Error('Invalid token');
      request.user = { id: payload.sub, universityId: payload.universityId, role: payload.role };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired authentication token.');
    }
  }
}
