import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AuthUser } from '../auth/auth.types';
import { assertUniversityAccess, universityScope } from '../common/tenant';

@Injectable()
export class CommunitiesService {
  constructor(private readonly prisma: PrismaService) {}

  list(user: AuthUser) {
    return this.prisma.community.findMany({
      where: universityScope(user),
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { members: true, posts: true } } },
    });
  }

  async get(user: AuthUser, id: string) {
    const community = await this.prisma.community.findUnique({ where: { id }, include: { _count: { select: { members: true, posts: true } } } });
    if (!community) throw new NotFoundException('Community not found.');
    assertUniversityAccess(user, community.universityId);
    if (community.isPrivate) {
      const member = await this.prisma.communityMember.findUnique({ where: { communityId_userId: { communityId: id, userId: user.id } } });
      if (!member && user.role !== 'SUPER_ADMIN') throw new ForbiddenException('You are not a member of this private community.');
    }
    return community;
  }

  async join(user: AuthUser, id: string) {
    const community = await this.prisma.community.findUnique({ where: { id }, select: { id: true, universityId: true } });
    if (!community) throw new NotFoundException('Community not found.');
    assertUniversityAccess(user, community.universityId);
    return this.prisma.communityMember.upsert({
      where: { communityId_userId: { communityId: id, userId: user.id } },
      update: {},
      create: { communityId: id, userId: user.id },
    });
  }
}
