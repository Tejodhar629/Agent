export interface EligibilityRules {
    ageMin?: number;
    ageMax?: number;
    incomeMax?: number;
    gender?: string[];
    category?: string[];
    isStudent?: boolean;
    isDisable?: boolean;
    hasBusiness?: boolean;
    occupations?: string[];
}
export interface UserProfileDto {
    age: number;
    state: string;
    annualIncome: number;
    gender: string;
    category: string;
    occupation: string;
    isStudent: boolean;
    isDisable: boolean;
    hasBusiness: boolean;
}
export interface SchemeMatchResult {
    schemeId: string;
    name: string;
    description: string;
    category: string;
    ministry: string;
    stateScope: string;
    dbtAmount: number | null;
    officialUrl: string;
    isEligible: boolean;
    matchingScore: number;
    reasons: string[];
    documentChecklist: string[];
}
export declare class SchemeService {
    private readonly logger;
    private prisma;
    private readonly defaultSchemes;
    constructor();
    findAll(category?: string, stateScope?: string, search?: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
    evaluateEligibility(schemeId: string, userProfile: UserProfileDto): Promise<SchemeMatchResult>;
    findMatchingSchemes(userProfile: UserProfileDto, category?: string): Promise<SchemeMatchResult[]>;
    saveScheme(userId: string, schemeId: string): Promise<any>;
    unsaveScheme(userId: string, schemeId: string): Promise<boolean>;
}
