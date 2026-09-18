import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AuthUser } from '../auth/auth.types';

@Injectable()
export class FollowsService {
  constructor(private readonly prisma: PrismaService) {}
  listFollowing(user: AuthUser) {
    return this.prisma.follow.findMany({ where: { followerId: user.id }, orderBy: { createdAt: 'desc' },
      include: { following: { select: { id: true, username: true, name: true, universityId: true, university: { select: { name: true } } } } } });
  }
  listFollowers(user: AuthUser) {
    return this.prisma.follow.findMany({ where: { followingId: user.id }, orderBy: { createdAt: 'desc' },
      include: { follower: { select: { id: true, username: true, name: true, universityId: true, university: { select: { name: true } } } } } });
  }
  async follow(user: AuthUser, username: string) {
    const target = await this.prisma.user.findUnique({ where: { username }, select: { id: true, profileDiscoverability: true } });
    if (!target) throw new NotFoundException('User not found.');
    if (target.id === user.id) throw new BadRequestException('You cannot follow yourself.');
    if (target.profileDiscoverability === 'CONNECTIONS_ONLY') {
      const connection = await this.prisma.connection.findFirst({ where: { status: 'ACCEPTED', OR: [{ fromUserId: user.id, toUserId: target.id }, { fromUserId: target.id, toUserId: user.id }] }, select: { id: true } });
      if (!connection) throw new ForbiddenException('This profile is limited to connections.');
    }
    return this.prisma.follow.upsert({ where: { followerId_followingId: { followerId: user.id, followingId: target.id } }, update: {}, create: { followerId: user.id, followingId: target.id } });
  }
  async unfollow(user: AuthUser, username: string) {
    const target = await this.prisma.user.findUnique({ where: { username }, select: { id: true } });
    if (!target) throw new NotFoundException('User not found.');
    await this.prisma.follow.deleteMany({ where: { followerId: user.id, followingId: target.id } });
    return { following: false };
  }
}