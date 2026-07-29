import { Role } from '@prisma/client';
export declare class Profile {
    id: string;
    age?: number;
    gender?: string;
    state?: string;
    casteCategory?: string;
    annualIncome?: number;
    occupation?: string;
    disabilityStatus?: boolean;
}
export declare class User {
    id: string;
    mobile?: string;
    email?: string;
    role: Role;
    profile?: Profile;
}
export declare class ProfileInput {
    age?: number;
    gender?: string;
    state?: string;
    casteCategory?: string;
    annualIncome?: number;
    occupation?: string;
    disabilityStatus?: boolean;
}
