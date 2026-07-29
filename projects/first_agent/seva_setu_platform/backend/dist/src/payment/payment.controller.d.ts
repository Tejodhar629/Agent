import { PaymentService } from './payment.service';
export declare class PaymentController {
    private paymentService;
    constructor(paymentService: PaymentService);
    createOrder(user: any, amount: number, consultationId: string): Promise<{
        orderId: string;
        amount: number;
        currency: string;
        consultationId: string;
    }>;
    handleWebhook(payload: any, signature: string): Promise<{
        success: boolean;
    }>;
}
