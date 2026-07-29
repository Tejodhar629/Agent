import { Controller, Post, Body, Headers, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-order')
  @HttpCode(HttpStatus.OK)
  async createOrder(
    @CurrentUser() user: any,
    @Body('amount') amount: number,
    @Body('consultationId') consultationId: string,
  ) {
    return this.paymentService.createOrder(amount, consultationId, user.sub);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() payload: any,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    return this.paymentService.verifyWebhook(payload, signature);
  }
}
