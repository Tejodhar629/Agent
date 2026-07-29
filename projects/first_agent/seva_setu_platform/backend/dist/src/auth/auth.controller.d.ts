import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
