import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async sendOtp(mobile: string) {
    // TODO: Integrate with MSG91, Twilio, or AWS SNS for real SMS delivery
    console.log(`[AuthService] Simulated sending OTP to ${mobile}`);
    
    // Returning dummy reference ID for API spec compliance
    return {
      success: true,
      message: 'OTP sent successfully',
      referenceId: 'dummy-ref-id-1234',
    };
  }

  async verifyOtp(mobile: string, otp: string, referenceId: string) {
    // Dummy check for MVP/Testing purposes
    if (otp !== '123456') {
      throw new UnauthorizedException({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid OTP provided.',
        }
      });
    }

    // Upsert User in Database
    let user = await this.prisma.user.findUnique({ where: { mobile } });
    if (!user) {
      user = await this.prisma.user.create({
        data: { mobile },
      });
    }

    const payload = { sub: user.id, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }), // Ideally returned via HttpOnly Cookie
      user: {
        id: user.id,
        role: user.role,
      },
    };
  }

  async googleOAuth(idToken: string) {
    // TODO: Verify Google ID Token here using google-auth-library
    console.log(`[AuthService] Verifying Google ID Token...`);
    
    // Dummy implementation assuming token resolves to dummy@gmail.com
    const email = 'dummy@gmail.com'; 
    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: { email },
      });
    }

    const payload = { sub: user.id, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        id: user.id,
        role: user.role,
      },
    };
  }
}
