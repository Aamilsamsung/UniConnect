import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  async register(input: { email: string; username: string; name: string; password: string }) {
    const email = input.email.trim().toLowerCase();
    const domain = email.split('@')[1];
    if (!domain) throw new BadRequestException('A valid university email is required.');
    const universityDomain = await this.prisma.universityDomain.findUnique({ include: { university: true }, where: { domain } });
    if (!universityDomain || universityDomain.university.verificationStatus !== 'VERIFIED') {
      throw new BadRequestException('This email domain is not an approved university domain.');
    }
    const existing = await this.prisma.user.findFirst({ where: { OR: [{ email }, { username: input.username }] } });
    if (existing) throw new BadRequestException('Email or username is already registered.');
    const passwordHash = await argon2.hash(input.password);
    const user = await this.prisma.user.create({ data: { email, username: input.username.trim(), name: input.name.trim(), passwordHash, universityId: universityDomain.universityId } });
    return this.issue(user);
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user || !(await argon2.verify(user.passwordHash, password))) throw new UnauthorizedException('Invalid credentials.');
    return this.issue(user);
  }

  private issue(user: { id: string; universityId: string; role: string; email: string; username: string; name: string; emailVerifiedAt: Date | null }) {
    const token = this.jwt.sign({ sub: user.id, universityId: user.universityId, role: user.role });
    return { token, user: { id: user.id, email: user.email, username: user.username, name: user.name, universityId: user.universityId, role: user.role, emailVerified: Boolean(user.emailVerifiedAt) } };
  }
}
