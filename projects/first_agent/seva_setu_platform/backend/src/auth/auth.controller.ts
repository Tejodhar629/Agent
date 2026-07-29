import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body('mobile') mobile: string) {
    return this.authService.sendOtp(mobile);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body('mobile') mobile: string,
    @Body('otp') otp: string,
    @Body('referenceId') referenceId: string,
  ) {
    return this.authService.verifyOtp(mobile, otp, referenceId);
  }

  @Post('oauth/google')
  @HttpCode(HttpStatus.OK)
  async googleOAuth(@Body('idToken') idToken: string) {
    return this.authService.googleOAuth(idToken);
  }
}
