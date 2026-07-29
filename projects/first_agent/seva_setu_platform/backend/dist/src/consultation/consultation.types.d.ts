import { ConsultationStatus } from '@prisma/client';
import { User } from '../user/user.types';
export declare class Consultant {
    id: string;
    user: User;
    specialties: string[];
    rating?: number;
    hourlyRate: number;
    isVerified: boolean;
}
export declare class Consultation {
    id: string;
    citizen: User;
    consultant: Consultant;
    scheduledAt: string;
    status: ConsultationStatus;
    meetingLink?: string;
}
