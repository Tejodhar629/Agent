import { ProfileInput } from './user.types';
import { UserService } from './user.service';
export declare class UserResolver {
    private readonly userService;
    constructor(userService: UserService);
    me(user: any): Promise<{
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
    updateProfile(user: any, input: ProfileInput): Promise<{
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
