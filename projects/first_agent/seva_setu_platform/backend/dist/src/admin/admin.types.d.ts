import { Scheme } from '../scheme/scheme.types';
export declare class PlatformMetrics {
    dailyActiveUsers: number;
    totalApplicationsTracked: number;
    topSearchedSchemes: Scheme[];
}
export declare class SchemeInput {
    title?: string;
    description?: string;
    ministry?: string;
    officialLink?: string;
    eligibilityCriteria?: string;
    benefits?: string;
    documentsRequired?: string[];
}
