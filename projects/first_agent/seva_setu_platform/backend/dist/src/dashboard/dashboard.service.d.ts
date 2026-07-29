import { PrismaService } from '../prisma/prisma.service';
import { ApplicationStatus } from '@prisma/client';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getMySavedSchemes(userId: string): Promise<({
        scheme: {
            id: string;
            tags: string[];
            title: string;
            description: string | null;
            ministry: string | null;
            category: string | null;
            officialLink: string | null;
            eligibilityCriteria: string | null;
            benefits: string | null;
            dbtAmount: number | null;
            documentsRequired: string[];
            createdAt: Date;
            updatedAt: Date;
        };
        actionPlan: {
            checklist: {
                id: string;
                name: string;
                isCompleted: boolean;
                actionPlanId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            steps: string[];
            rejectionReasons: string[];
            savedSchemeId: string;
        };
    } & {
        id: string;
        updatedAt: Date;
        userId: string;
        schemeId: string;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        savedAt: Date;
    })[]>;
    saveScheme(userId: string, schemeId: string): Promise<{
        scheme: {
            id: string;
            tags: string[];
            title: string;
            description: string | null;
            ministry: string | null;
            category: string | null;
            officialLink: string | null;
            eligibilityCriteria: string | null;
            benefits: string | null;
            dbtAmount: number | null;
            documentsRequired: string[];
            createdAt: Date;
            updatedAt: Date;
        };
        actionPlan: {
            checklist: {
                id: string;
                name: string;
                isCompleted: boolean;
                actionPlanId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            steps: string[];
            rejectionReasons: string[];
            savedSchemeId: string;
        };
    } & {
        id: string;
        updatedAt: Date;
        userId: string;
        schemeId: string;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        savedAt: Date;
    }>;
    updateApplicationStatus(savedSchemeId: string, status: ApplicationStatus): Promise<{
        scheme: {
            id: string;
            tags: string[];
            title: string;
            description: string | null;
            ministry: string | null;
            category: string | null;
            officialLink: string | null;
            eligibilityCriteria: string | null;
            benefits: string | null;
            dbtAmount: number | null;
            documentsRequired: string[];
            createdAt: Date;
            updatedAt: Date;
        };
        actionPlan: {
            checklist: {
                id: string;
                name: string;
                isCompleted: boolean;
                actionPlanId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            steps: string[];
            rejectionReasons: string[];
            savedSchemeId: string;
        };
    } & {
        id: string;
        updatedAt: Date;
        userId: string;
        schemeId: string;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        savedAt: Date;
    }>;
    toggleChecklistItem(actionPlanId: string, itemName: string, isCompleted: boolean): Promise<{
        checklist: {
            id: string;
            name: string;
            isCompleted: boolean;
            actionPlanId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        steps: string[];
        rejectionReasons: string[];
        savedSchemeId: string;
    }>;
    getCitizenProfileSummary(userId: string): Promise<{
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
        activeApplications: number;
    }>;
    purgeCitizenPersonalData(userId: string): Promise<boolean>;
}
