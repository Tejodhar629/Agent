import { PrismaService } from '../prisma/prisma.service';
import { SchemeInput } from './admin.types';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getPlatformMetrics(userId: string, role: string): Promise<{
        dailyActiveUsers: number;
        totalApplicationsTracked: number;
        topSearchedSchemes: {
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
        }[];
    }>;
    updateScheme(schemeId: string, input: SchemeInput, role: string): Promise<{
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
    }>;
}
