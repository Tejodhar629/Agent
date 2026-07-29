import { PrismaService } from '../prisma/prisma.service';
import { ProfileInput } from './user.types';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    getUserById(userId: string): Promise<{
        profile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            age: number | null;
            gender: string | null;
            state: string | null;
            casteCategory: string | null;
            annualIncome: number | null;
            occupation: string | null;
            disabilityStatus: boolean | null;
            userId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        mobile: string | null;
        email: string | null;
        role: import(".prisma/client").$Enums.Role;
        subscriptionTier: import(".prisma/client").$Enums.SubscriptionTier;
    }>;
    updateProfile(userId: string, input: ProfileInput): Promise<{
        profile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            age: number | null;
            gender: string | null;
            state: string | null;
            casteCategory: string | null;
            annualIncome: number | null;
            occupation: string | null;
            disabilityStatus: boolean | null;
            userId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        mobile: string | null;
        email: string | null;
        role: import(".prisma/client").$Enums.Role;
        subscriptionTier: import(".prisma/client").$Enums.SubscriptionTier;
    }>;
}
