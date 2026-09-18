import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AuthUser } from '../auth/auth.types';
import { assertUniversityAccess, universityScope } from '../common/tenant';

@Injectable()
export class FeedService {
  constructor(private readonly prisma: PrismaService) {}

  list(user: AuthUser) {
    return this.prisma.post.findMany({
      where: universityScope(user),
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        author: { select: { id: true, name: true, username: true } },
        community: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async create(user: AuthUser, input: { content: string; communityId?: string }) {
    const content = input.content.trim();
    if (!content) throw new BadRequestException('Post content is required.');

    if (input.communityId) {
      const community = await this.prisma.community.findUnique({
        where: { id: input.communityId },
        select: { id: true, universityId: true },
      });
      if (!community) throw new NotFoundException('Community not found.');
      assertUniversityAccess(user, community.universityId);

      const membership = await this.prisma.communityMember.findUnique({
        where: { communityId_userId: { communityId: community.id, userId: user.id } },
        select: { id: true },
      });
      if (!membership) throw new BadRequestException('Join this community before posting.');
    }

    return this.prisma.post.create({
      data: {
        authorId: user.id,
        universityId: user.universityId,
        communityId: input.communityId,
        content,
      },
      include: {
        author: { select: { id: true, name: true, username: true } },
        community: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async remove(user: AuthUser, postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true, universityId: true },
    });
    if (!post) throw new NotFoundException('Post not found.');
    assertUniversityAccess(user, post.universityId);
    const canModerate = user.role === 'MODERATOR' || user.role === 'UNIVERSITY_ADMIN' || user.role === 'SUPER_ADMIN';
    if (post.authorId !== user.id && !canModerate) throw new BadRequestException('You cannot delete this post.');
    await this.prisma.post.delete({ where: { id: post.id } });
    return { deleted: true };
  }
}
