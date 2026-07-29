import { SchemeService, UserProfileDto, SchemeMatchResult } from './scheme.service';
export declare class SchemeController {
    private readonly schemeService;
    private readonly logger;
    constructor(schemeService: SchemeService);
    getSchemes(category?: string, stateScope?: string, search?: string): Promise<any[]>;
    getScholarships(stateScope?: string, search?: string): Promise<any[]>;
    getPensions(stateScope?: string, search?: string): Promise<any[]>;
    getSchemeById(id: string): Promise<any>;
    matchSchemesForUser(userId: string, profileOverride?: Partial<UserProfileDto>): Promise<SchemeMatchResult[]>;
    saveScheme(schemeId: string, userId: string): Promise<any>;
    unsaveScheme(schemeId: string, userId: string): Promise<any>;
}
