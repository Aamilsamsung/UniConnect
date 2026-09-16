import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_SECRET || 'dev-only-change-me', signOptions: { expiresIn: '7d' } })],
  controllers: [AuthController],
  providers: [PrismaService, AuthService, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard, JwtModule],
})
export class AuthModule {}
