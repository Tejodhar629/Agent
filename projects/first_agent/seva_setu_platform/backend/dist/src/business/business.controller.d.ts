import { BusinessService, SeoBlogRequest, SeoBlogResponse, NotificationPayload, NotificationResponse, TelemetryEvent, ConsultancyBookingRequest, ConsultancyBookingResponse, CscLocationResponse } from './business.service';
export declare class BusinessController {
    private readonly businessService;
    private readonly logger;
    constructor(businessService: BusinessService);
    generateBlog(payload: SeoBlogRequest): Promise<SeoBlogResponse>;
    sendNotification(payload: NotificationPayload): Promise<NotificationResponse>;
    logTelemetry(payload: TelemetryEvent): Promise<{
        status: string;
        anonymousHash: string;
    }>;
    redeemReferral(referrerId: string, refereeId: string): Promise<any>;
    handleRazorpayWebhook(signature: string, payload: any): Promise<{
        status: string;
    }>;
    bookConsultant(payload: ConsultancyBookingRequest): Promise<ConsultancyBookingResponse>;
    locateCsc(latitude: string, longitude: string, maxRadiusKm?: string): Promise<CscLocationResponse[]>;
}
