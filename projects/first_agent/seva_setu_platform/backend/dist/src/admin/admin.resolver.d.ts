import { AdminService } from './admin.service';
import { SchemeInput } from './admin.types';
export declare class AdminResolver {
    private adminService;
    constructor(adminService: AdminService);
    getPlatformMetrics(user: any): Promise<{
        dailyActiveUsers: number;
        totalApplicationsTracked: number;
        topSearchedSchemes: {
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
        }[];
    }>;
    updateScheme(user: any, id: string, input: SchemeInput): Promise<{
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
    }>;
}
