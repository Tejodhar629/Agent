import { PrismaService } from '../prisma/prisma.service';
export declare class ConsultationService {
    private prisma;
    constructor(prisma: PrismaService);
    getConsultants(specialty?: string, state?: string): Promise<({
        user: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        specialties: string[];
        rating: number | null;
        hourlyRate: number;
        isVerified: boolean;
    })[]>;
    getConsultationDetails(id: string): Promise<{
        consultant: {
            user: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                mobile: string | null;
                email: string | null;
                role: import(".prisma/client").$Enums.Role;
                subscriptionTier: import(".prisma/client").$Enums.SubscriptionTier;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            specialties: string[];
            rating: number | null;
            hourlyRate: number;
            isVerified: boolean;
        };
        citizen: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ConsultationStatus;
        citizenId: string;
        consultantId: string;
        scheduledAt: Date;
        meetingLink: string | null;
    }>;
    bookConsultation(citizenId: string, consultantId: string, scheduledAt: string): Promise<{
        consultant: {
            user: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                mobile: string | null;
                email: string | null;
                role: import(".prisma/client").$Enums.Role;
                subscriptionTier: import(".prisma/client").$Enums.SubscriptionTier;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            specialties: string[];
            rating: number | null;
            hourlyRate: number;
            isVerified: boolean;
        };
        citizen: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ConsultationStatus;
        citizenId: string;
        consultantId: string;
        scheduledAt: Date;
        meetingLink: string | null;
    }>;
    cancelConsultation(consultationId: string, userId: string): Promise<{
        consultant: {
            user: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                mobile: string | null;
                email: string | null;
                role: import(".prisma/client").$Enums.Role;
                subscriptionTier: import(".prisma/client").$Enums.SubscriptionTier;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            specialties: string[];
            rating: number | null;
            hourlyRate: number;
            isVerified: boolean;
        };
        citizen: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ConsultationStatus;
        citizenId: string;
        consultantId: string;
        scheduledAt: Date;
        meetingLink: string | null;
    }>;
}
