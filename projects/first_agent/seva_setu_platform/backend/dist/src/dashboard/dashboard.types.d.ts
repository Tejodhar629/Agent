import { ApplicationStatus } from '@prisma/client';
import { Scheme } from '../scheme/scheme.types';
export declare class ChecklistItem {
    id: string;
    name: string;
    isCompleted: boolean;
}
export declare class ActionPlan {
    id: string;
    steps: string[];
    rejectionReasons?: string[];
    checklist: ChecklistItem[];
}
export declare class SavedScheme {
    id: string;
    scheme: Scheme;
    status: ApplicationStatus;
    actionPlan?: ActionPlan;
    savedAt: string;
}
