import { ConsultationService } from './consultation.service';
export declare class ConsultationResolver {
    private consultationService;
    constructor(consultationService: ConsultationService);
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
        scheduledAt: string;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ConsultationStatus;
        citizenId: string;
        consultantId: string;
        meetingLink: string | null;
    }>;
    bookConsultation(user: any, consultantId: string, scheduledAt: string): Promise<{
        scheduledAt: string;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ConsultationStatus;
        citizenId: string;
        consultantId: string;
        meetingLink: string | null;
    }>;
    cancelConsultation(user: any, consultationId: string): Promise<{
        scheduledAt: string;
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.ConsultationStatus;
        citizenId: string;
        consultantId: string;
        meetingLink: string | null;
    }>;
}
