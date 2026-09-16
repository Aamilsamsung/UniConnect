import { ForbiddenException } from '@nestjs/common';
import { AuthUser } from '../auth/auth.types';

export function assertUniversityAccess(user: AuthUser, resourceUniversityId: string): void {
  if (user.role !== 'SUPER_ADMIN' && user.universityId !== resourceUniversityId) {
    throw new ForbiddenException('You do not have access to this university resource.');
  }
}

export function universityScope(user: AuthUser) {
  return user.role === 'SUPER_ADMIN' ? {} : { universityId: user.universityId };
}
