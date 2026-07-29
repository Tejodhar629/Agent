import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    sendOtp(mobile: string): Promise<{
        success: boolean;
        message: string;
        referenceId: string;
    }>;
    verifyOtp(mobile: string, otp: string, referenceId: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
    googleOAuth(idToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
}
