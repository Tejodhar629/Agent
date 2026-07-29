import { DashboardService } from './dashboard.service';
import { ApplicationStatus } from '@prisma/client';
export declare class DashboardResolver {
    private dashboardService;
    constructor(dashboardService: DashboardService);
    mySavedSchemes(user: any): Promise<{
        savedAt: string;
        scheme: {
            tags: string[];
            id: string;
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
        id: string;
        updatedAt: Date;
        userId: string;
        schemeId: string;
        status: import(".prisma/client").$Enums.ApplicationStatus;
    }[]>;
    saveScheme(user: any, schemeId: string): Promise<{
        savedAt: string;
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
        id: string;
        updatedAt: Date;
        userId: string;
        schemeId: string;
        status: import(".prisma/client").$Enums.ApplicationStatus;
    }>;
    updateApplicationStatus(savedSchemeId: string, status: ApplicationStatus): Promise<{
        savedAt: string;
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
        id: string;
        updatedAt: Date;
        userId: string;
        schemeId: string;
        status: import(".prisma/client").$Enums.ApplicationStatus;
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
}
