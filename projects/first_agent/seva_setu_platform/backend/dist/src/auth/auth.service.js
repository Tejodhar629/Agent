"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async sendOtp(mobile) {
        console.log(`[AuthService] Simulated sending OTP to ${mobile}`);
        return {
            success: true,
            message: 'OTP sent successfully',
            referenceId: 'dummy-ref-id-1234',
        };
    }
    async verifyOtp(mobile, otp, referenceId) {
        if (otp !== '123456') {
            throw new common_1.UnauthorizedException({
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Invalid OTP provided.',
                }
            });
        }
        let user = await this.prisma.user.findUnique({ where: { mobile } });
        if (!user) {
            user = await this.prisma.user.create({
                data: { mobile },
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
    async googleOAuth(idToken) {
        console.log(`[AuthService] Verifying Google ID Token...`);
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map