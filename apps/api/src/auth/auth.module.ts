import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

const jwtSecret = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? undefined : 'dev-only-change-me');
if (!jwtSecret) throw new Error('JWT_SECRET is required in production.');

@Module({
  imports: [JwtModule.register({ secret: jwtSecret, signOptions: { expiresIn: '7d' } })],
  controllers: [AuthController],
  providers: [PrismaService, AuthService, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard, JwtModule],
})
export class AuthModule {}
