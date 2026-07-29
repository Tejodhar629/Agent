import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus } from '@prisma/client';
export interface SeoBlogRequest {
    schemeId: string;
    targetLanguage: string;
    stateScope: string;
}
export interface SeoBlogResponse {
    slug: string;
    title: string;
    contentMarkdown: string;
    language: string;
    metaDescription: string;
    alternateHreflangMaps: Array<{
        lang: string;
        url: string;
    }>;
    structuredDataJsonLd: {
        governmentServiceSchema: Record<string, any>;
        faqPageSchema: Record<string, any>;
    };
}
export interface NotificationPayload {
    userId: string;
    recipientMobile: string;
    messageTemplate: string;
    variables: Record<string, string>;
    channel: 'SMS' | 'WHATSAPP';
}
export interface NotificationResponse {
    messageId: string;
    recipient: string;
    channel: 'SMS' | 'WHATSAPP';
    status: 'SENT' | 'FAILED';
    smsSegments: number;
    characterCount: number;
    deliveryLatencyMs: number;
}
export interface TelemetryEvent {
    userId?: string;
    visitorSessionToken: string;
    eventAction: string;
    elementCategory: string;
    stateScope: string;
    deviceType: string;
    ipAddress: string;
}
export interface ConsultancyBookingRequest {
    userId: string;
    expertId: string;
    bookingDate: string;
    amountToPay: number;
}
export interface ConsultancyBookingResponse {
    bookingId: string;
    userId: string;
    expertId: string;
    status: BookingStatus;
    meetingLink: string;
    platformSplitFee: number;
    consultantPayout: number;
    paymentId: string;
}
export interface CscLocationQuery {
    latitude: number;
    longitude: number;
    maxRadiusKm?: number;
}
export interface CscLocationResponse {
    cscId: string;
    centerName: string;
    vleOperatorName: string;
    contactNumber: string;
    operatingHours: string;
    distanceKm: number;
    directionsUrl: string;
    affiliateReferralCode: string;
}
export declare class BusinessService {
    private readonly prisma;
    private readonly logger;
    private readonly razorpayWebhookSecret;
    private readonly dailyRotatedSalt;
    constructor(prisma: PrismaService);
    generateSeoBlog(payload: SeoBlogRequest): Promise<SeoBlogResponse>;
    sendNotification(payload: NotificationPayload): Promise<NotificationResponse>;
    logTelemetryEvent(payload: TelemetryEvent): Promise<{
        status: string;
        anonymousHash: string;
    }>;
    processReferral(referrerId: string, refereeId: string): Promise<any>;
    verifyAndProcessRazorpayPayment(signature: string, payloadRaw: string): Promise<{
        status: string;
        userId?: string;
    }>;
    createConsultancyBooking(payload: ConsultancyBookingRequest): Promise<ConsultancyBookingResponse>;
    findClosestCscCentres(query: CscLocationQuery): Promise<CscLocationResponse[]>;
    private calculateHaversineDistance;
    private degreesToRadians;
}
