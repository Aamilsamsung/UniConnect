import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthUser } from './auth.types';

type Req = Request & { user?: AuthUser };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Req>();
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw new UnauthorizedException('Authentication required.');
    try {
      const p = this.jwt.verify<{ sub: string; universityId: string; role: AuthUser['role'] }>(header.slice(7));
      req.user = { id: p.sub, universityId: p.universityId, role: p.role };
      return true;
    } catch { throw new UnauthorizedException('Invalid or expired token.'); }
  }
}
