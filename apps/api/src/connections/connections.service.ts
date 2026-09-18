import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AuthUser } from '../auth/auth.types';

@Injectable()
export class ConnectionsService {
  constructor(private readonly prisma: PrismaService) {}

  list(user: AuthUser) {
    return this.prisma.connection.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ fromUserId: user.id }, { toUserId: user.id }],
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        fromUser: { select: { id: true, username: true, name: true, universityId: true, university: { select: { name: true } } } },
        toUser: { select: { id: true, username: true, name: true, universityId: true, university: { select: { name: true } } } },
      },
    });
  }

  pending(user: AuthUser) {
    return this.prisma.connection.findMany({
      where: { toUserId: user.id, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      include: {
        fromUser: { select: { id: true, username: true, name: true, universityId: true, university: { select: { name: true } } } },
      },
    });
  }

  async request(user: AuthUser, targetUsername: string) {
    const target = await this.prisma.user.findUnique({
      where: { username: targetUsername },
      select: { id: true, universityId: true, friendRequestPolicy: true },
    });
    if (!target) throw new NotFoundException('User not found.');
    if (target.id === user.id) throw new BadRequestException('You cannot connect with yourself.');

    if (target.friendRequestPolicy === 'NOBODY') throw new ForbiddenException('This user is not accepting connection requests.');
    if (target.friendRequestPolicy === 'UNIVERSITY_ONLY' && target.universityId !== user.universityId) {
      throw new ForbiddenException('This user only accepts requests from their university.');
    }
    if (target.friendRequestPolicy === 'CONNECTIONS_ONLY') {
      const direct = await this.prisma.connection.findFirst({
        where: {
          status: 'ACCEPTED',
          OR: [
            { fromUserId: user.id, toUserId: target.id },
            { fromUserId: target.id, toUserId: user.id },
          ],
        },
      });
      if (!direct) throw new ForbiddenException('This user restricts connection requests.');
    }

    const reverse = await this.prisma.connection.findUnique({
      where: { fromUserId_toUserId: { fromUserId: target.id, toUserId: user.id } },
    });
    if (reverse?.status === 'ACCEPTED') return reverse;
    if (reverse?.status === 'PENDING') throw new BadRequestException('This user already sent you a connection request.');

    return this.prisma.connection.upsert({
      where: { fromUserId_toUserId: { fromUserId: user.id, toUserId: target.id } },
      update: { status: 'PENDING' },
      create: { fromUserId: user.id, toUserId: target.id, status: 'PENDING' },
    });
  }

  async respond(user: AuthUser, id: string, accept: boolean) {
    const request = await this.prisma.connection.findUnique({ where: { id } });
    if (!request) throw new NotFoundException('Connection request not found.');
    if (request.toUserId !== user.id) throw new ForbiddenException('You cannot respond to this request.');
    if (request.status !== 'PENDING') throw new BadRequestException('This request is no longer pending.');
    return this.prisma.connection.update({
      where: { id },
      data: { status: accept ? 'ACCEPTED' : 'REJECTED' },
    });
  }

  async remove(user: AuthUser, id: string) {
    const connection = await this.prisma.connection.findUnique({ where: { id } });
    if (!connection) throw new NotFoundException('Connection not found.');
    if (connection.fromUserId !== user.id && connection.toUserId !== user.id) {
      throw new ForbiddenException('You cannot remove this connection.');
    }
    await this.prisma.connection.delete({ where: { id } });
    return { deleted: true };
  }
}
