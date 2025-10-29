import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtUserAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  login(@Body() LoginDto: LoginDto) {
    return this.authService.login(LoginDto);
  }

  // auth.controller.ts
  @UseGuards(JwtUserAuthGuard)
  @Get('me')
  getProfile(@Req() req) {
    return { user: req.user }; // req.user viene del JwtStrategy
  }
}
