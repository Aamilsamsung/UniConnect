import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AuthUser } from '../auth/auth.types';
import { ConnectionStatus } from '@prisma/client';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: AuthUser) {
    return this.prisma.conversation.findMany({
      where: { members: { some: { userId: user.id } } },
      orderBy: { updatedAt: 'desc' },
      include: { members: { include: { user: { select: { id:true, username:true, name:true, universityId:true } } } },
        messages: { orderBy: { createdAt:'desc' }, take:1, include:{ sender:{select:{id:true,username:true,name:true}} } } },
    });
  }

  private async assertMember(userId: string, conversationId: string) {
    const member = await this.prisma.conversationMember.findUnique({ where:{conversationId_userId:{conversationId,userId}} });
    if (!member) throw new ForbiddenException('You are not a member of this conversation.');
  }

  async createDirect(user: AuthUser, username: string) {
    const target = await this.prisma.user.findUnique({ where:{username:username.trim()}, select:{id:true,universityId:true,username:true,name:true} });
    if (!target || target.id === user.id) throw new NotFoundException('User not found.');
    if (target.messagePolicy === 'NOBODY') throw new ForbiddenException('This user does not accept messages.');
    if (target.messagePolicy === 'UNIVERSITY_ONLY' && target.universityId !== user.universityId) throw new ForbiddenException('This user only accepts university messages.');
    if (target.messagePolicy === 'CONNECTIONS_ONLY') {
      const connected = await this.prisma.connection.findFirst({ where:{status:'ACCEPTED', OR:[{fromUserId:user.id,toUserId:target.id},{fromUserId:target.id,toUserId:user.id}] }});
      if (!connected) throw new ForbiddenException('Connect with this user before messaging.');
    }
    const existing = await this.prisma.conversation.findFirst({ where:{isGroup:false, AND:[
      {members:{some:{userId:user.id}}},{members:{some:{userId:target.id}}}
    ]}});
    if (existing) return existing;
    return this.prisma.conversation.create({data:{createdById:user.id,members:{create:[{userId:user.id},{userId:target.id}]}},include:{members:true}});
  }

  async send(user: AuthUser, conversationId: string, content: string) {
    const text=content.trim(); if(!text) throw new BadRequestException('Message content is required.');
    await this.assertMember(user.id,conversationId);
    return this.prisma.message.create({data:{conversationId,senderId:user.id,content:text},include:{sender:{select:{id:true,username:true,name:true}}}});
  }

  async history(user: AuthUser, conversationId: string) {
    await this.assertMember(user.id,conversationId);
    return this.prisma.message.findMany({where:{conversationId},orderBy:{createdAt:'asc'},take:100,include:{sender:{select:{id:true,username:true,name:true}}}});
  }
}
