import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { AuthUser } from '../auth/auth.types';
import { assertUniversityAccess, universityScope } from '../common/tenant';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  list(user: AuthUser) {
    return this.prisma.event.findMany({
      where: universityScope(user),
      orderBy: { startsAt: 'asc' },
      include: { _count: { select: { attendees: true } } },
    });
  }

  async get(user: AuthUser, id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: { _count: { select: { attendees: true } } },
    });
    if (!event) throw new NotFoundException('Event not found.');
    assertUniversityAccess(user, event.universityId);
    return event;
  }

  async attend(user: AuthUser, id: string) {
    const event = await this.prisma.event.findUnique({ where: { id }, select: { id: true, universityId: true } });
    if (!event) throw new NotFoundException('Event not found.');
    assertUniversityAccess(user, event.universityId);
    return this.prisma.eventAttendee.upsert({
      where: { eventId_userId: { eventId: id, userId: user.id } },
      update: {},
      create: { eventId: id, userId: user.id },
    });
  }

  async leave(user: AuthUser, id: string) {
    const event = await this.prisma.event.findUnique({ where: { id }, select: { id: true, universityId: true } });
    if (!event) throw new NotFoundException('Event not found.');
    assertUniversityAccess(user, event.universityId);
    await this.prisma.eventAttendee.deleteMany({ where: { eventId: id, userId: user.id } });
    return { attending: false };
  }
}
