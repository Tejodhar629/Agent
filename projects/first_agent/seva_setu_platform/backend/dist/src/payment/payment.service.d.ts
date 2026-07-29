export declare class PaymentService {
    createOrder(amount: number, consultationId: string, userId: string): Promise<{
        orderId: string;
        amount: number;
        currency: string;
        consultationId: string;
    }>;
    verifyWebhook(payload: any, signature: string): Promise<{
        success: boolean;
    }>;
}
