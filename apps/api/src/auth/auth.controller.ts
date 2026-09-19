import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';

class RegisterDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(3) username!: string;
  @IsString() @MinLength(2) name!: string;
  @IsString() @MinLength(8) password!: string;
}
class LoginDto { @IsEmail() email!: string; @IsString() @MinLength(8) password!: string; }

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('register') register(@Body() dto: RegisterDto) { return this.auth.register(dto); }
  @Post('login') login(@Body() dto: LoginDto) { return this.auth.login(dto.email, dto.password); }
  @Get('verify-email') verifyEmail(@Query('token') token: string) { return this.auth.verifyEmail(token); }
}
