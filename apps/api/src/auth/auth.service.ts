import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  async register(input: { email: string; username: string; name: string; password: string }) {
    const email = input.email.trim().toLowerCase();
    const username = input.username.trim().toLowerCase();
    const name = input.name.trim();
    const domain = email.split('@')[1];
    if (!domain) throw new BadRequestException('A valid university email is required.');

    const universityDomain = await this.prisma.universityDomain.findUnique({
      include: { university: true },
      where: { domain },
    });
    if (!universityDomain || universityDomain.university.verificationStatus !== 'VERIFIED') {
      throw new BadRequestException('This email domain is not an approved university domain.');
    }

    const existing = await this.prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
    if (existing) throw new BadRequestException('Email or username is already registered.');

    const passwordHash = await argon2.hash(input.password);
    const user = await this.prisma.user.create({
      data: { email, username, name, passwordHash, universityId: universityDomain.universityId },
    });

    const verificationToken = await this.createVerificationToken(user.id);
    await this.sendVerificationEmail(email, name, verificationToken);

    return {
      verificationRequired: true,
      message: 'Account created. Check your university email to verify your account.',
    };
  }

  async verifyEmail(token: string) {
    const normalized = token.trim();
    if (!normalized) throw new BadRequestException('Verification token is required.');
    const tokenHash = this.hashToken(normalized);
    const record = await this.prisma.emailVerificationToken.findUnique({ where: { tokenHash } });

    if (!record || record.expiresAt <= new Date()) {
      throw new BadRequestException('This verification link is invalid or expired.');
    }

    const user = await this.prisma.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date() },
    });
    await this.prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });
    return { verified: true, message: 'Email verified. You can now sign in.' };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user || !(await argon2.verify(user.passwordHash, password))) {
      throw new UnauthorizedException('Invalid credentials.');
    }
    if (!user.emailVerifiedAt) {
      throw new UnauthorizedException('Please verify your university email before signing in.');
    }
    return this.issue(user);
  }

  private async createVerificationToken(userId: string) {
    const raw = randomBytes(32).toString('hex');
    await this.prisma.emailVerificationToken.deleteMany({ where: { userId } });
    await this.prisma.emailVerificationToken.create({
      data: {
        userId,
        tokenHash: this.hashToken(raw),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    return raw;
  }

  private async sendVerificationEmail(email: string, name: string, token: string) {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    const webUrl = process.env.WEB_URL || process.env.CORS_ORIGIN || 'http://localhost:3000';
    const verificationUrl = `${webUrl.replace(/\/$/, '')}/verify-email?token=${token}`;

    if (!apiKey || !from) {
      if (process.env.NODE_ENV === 'production') {
        throw new BadRequestException('Email verification is not configured. Set RESEND_API_KEY and EMAIL_FROM.');
      }
      return;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [email],
        subject: 'Verify your UniConnect account',
        html: `<p>Hi ${name.replace(/</g, '&lt;')},</p><p>Verify your UniConnect university account by clicking the link below.</p><p><a href="${verificationUrl}">Verify my email</a></p><p>This link expires in 24 hours.</p>`,
      }),
    });

    if (!response.ok) {
      await this.prisma.emailVerificationToken.deleteMany({ where: { userId: (await this.prisma.user.findUniqueOrThrow({ where: { email }, select: { id: true } })).id } });
      throw new BadRequestException('We could not send the verification email. Please try again.');
    }
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private issue(user: { id: string; universityId: string; role: string; email: string; username: string; name: string; emailVerifiedAt: Date | null }) {
    const token = this.jwt.sign({ sub: user.id, universityId: user.universityId, role: user.role });
    return {
      token,
      user: {
        id: user.id, email: user.email, username: user.username, name: user.name,
        universityId: user.universityId, role: user.role, emailVerified: Boolean(user.emailVerifiedAt),
      },
    };
  }
}
