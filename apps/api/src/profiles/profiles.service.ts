import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AuthUser } from '../auth/auth.types';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  me(user: AuthUser) {
    return this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true, email: true, username: true, name: true, universityId: true, role: true,
        emailVerifiedAt: true, profileDiscoverability: true, friendRequestPolicy: true,
        messagePolicy: true, onlineStatusPolicy: true, activityVisibility: true,
        university: { select: { id: true, name: true } },
        createdAt: true,
      },
    });
  }

  async get(user: AuthUser, username: string) {
    const target = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true, username: true, name: true, universityId: true, profileDiscoverability: true,
        university: { select: { id: true, name: true } },
        createdAt: true,
      },
    });
    if (!target) throw new NotFoundException('Profile not found.');

    if (target.id === user.id || target.universityId === user.universityId || target.profileDiscoverability === 'ANYONE') {
      return target;
    }

    if (target.profileDiscoverability === 'CONNECTIONS_ONLY') {
      const connection = await this.prisma.connection.findFirst({
        where: {
          status: 'ACCEPTED',
          OR: [
            { fromUserId: user.id, toUserId: target.id },
            { fromUserId: target.id, toUserId: user.id },
          ],
        },
        select: { id: true },
      });
      if (connection) return target;
    }

    throw new NotFoundException('Profile not found.');
  }

  async updatePrivacy(user: AuthUser, input: {
    profileDiscoverability?: 'UNIVERSITY_ONLY' | 'CONNECTIONS_ONLY' | 'ANYONE';
    friendRequestPolicy?: 'EVERYONE' | 'UNIVERSITY_ONLY' | 'CONNECTIONS_ONLY' | 'NOBODY';
    messagePolicy?: 'EVERYONE' | 'UNIVERSITY_ONLY' | 'CONNECTIONS_ONLY' | 'NOBODY';
    onlineStatusPolicy?: 'EVERYONE' | 'UNIVERSITY_ONLY' | 'CONNECTIONS_ONLY' | 'NOBODY';
  }) {
    if (!Object.keys(input).length) throw new BadRequestException('No privacy settings supplied.');
    return this.prisma.user.update({
      where: { id: user.id },
      data: input,
      select: {
        profileDiscoverability: true,
        friendRequestPolicy: true,
        messagePolicy: true,
        onlineStatusPolicy: true,
      },
    });
  }
}
