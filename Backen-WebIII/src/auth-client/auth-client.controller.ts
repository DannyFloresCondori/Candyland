import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthClientService } from './auth-client.service';
import { LoginClientDto } from './dto/loginClient.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth-client')
export class AuthClientController {
  constructor(private readonly authClientService: AuthClientService) { }

  @Post('loginClient')
  login(@Body() LoginClientDto: LoginClientDto) {
    return this.authClientService.loginClient(LoginClientDto)
  }

  // auth.controller.ts
  @UseGuards(JwtAuthGuard)
  @Get('me-client')
  getProfile(@Req() req) {
    return { user: req.user }; // req.user viene del JwtStrategy
  }

}
