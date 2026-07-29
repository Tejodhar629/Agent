import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Query, 
  Headers, 
  HttpCode, 
  HttpStatus, 
  BadRequestException, 
  InternalServerErrorException,
  Logger
} from '@nestjs/common';
import { 
  BusinessService, 
  SeoBlogRequest, 
  SeoBlogResponse, 
  NotificationPayload, 
  NotificationResponse, 
  TelemetryEvent, 
  ConsultancyBookingRequest, 
  ConsultancyBookingResponse, 
  CscLocationResponse 
} from './business.service';

@Controller('business')
export class BusinessController {
  private readonly logger = new Logger(BusinessController.name);

  constructor(private readonly businessService: BusinessService) {}

  /**
   * POST /business/blog/generate
   * Generates localized programmatic SEO blogs complete with search engine dynamic schemas.
   */
  @Post('blog/generate')
  @HttpCode(HttpStatus.OK)
  async generateBlog(@Body() payload: SeoBlogRequest): Promise<SeoBlogResponse> {
    if (!payload.schemeId || !payload.targetLanguage || !payload.stateScope) {
      throw new BadRequestException('schemeId, targetLanguage, and stateScope are required parameters.');
    }
    try {
      return await this.businessService.generateSeoBlog(payload);
    } catch (e: any) {
      this.logger.error(`Failed to generate SEO blog piece: ${e.message}`);
      throw new InternalServerErrorException(e.message || 'Internal server error while compiling dynamic sitemap blogs.');
    }
  }

  /**
   * POST /business/notification/send
   * Dispatches bilingual notifications (SMS or WhatsApp) via simulated NIC Gateway connections.
   */
  @Post('notification/send')
  @HttpCode(HttpStatus.OK)
  async sendNotification(@Body() payload: NotificationPayload): Promise<NotificationResponse> {
    if (!payload.userId || !payload.recipientMobile || !payload.messageTemplate || !payload.channel) {
      throw new BadRequestException('userId, recipientMobile, messageTemplate, and channel are required.');
    }
    try {
      return await this.businessService.sendNotification(payload);
    } catch (e: any) {
      this.logger.error(`Bilingual notification dispatcher failed: ${e.message}`);
      throw new InternalServerErrorException('Failed to process message dispatcher queue.');
    }
  }

  /**
   * POST /business/telemetry/log
   * Log clickstream metrics with irreversible user identifiers in alignment with the DPDP Act 2023.
   */
  @Post('telemetry/log')
  @HttpCode(HttpStatus.CREATED)
  async logTelemetry(@Body() payload: TelemetryEvent): Promise<{ status: string; anonymousHash: string }> {
    if (!payload.visitorSessionToken || !payload.eventAction || !payload.elementCategory) {
      throw new BadRequestException('visitorSessionToken, eventAction, and elementCategory are required.');
    }
    try {
      return await this.businessService.logTelemetryEvent(payload);
    } catch (e: any) {
      this.logger.error(`Telemetry logger failure: ${e.message}`);
      throw new InternalServerErrorException('Telemetry analytics record aborted.');
    }
  }

  /**
   * POST /business/referral/redeem
   * Executes gamified referral registration, linking profiles and awarding coins.
   */
  @Post('referral/redeem')
  @HttpCode(HttpStatus.OK)
  async redeemReferral(
    @Body('referrerId') referrerId: string,
    @Body('refereeId') refereeId: string
  ): Promise<any> {
    if (!referrerId || !refereeId) {
      throw new BadRequestException('Both referrerId and refereeId parameters are required in request body.');
    }
    return await this.businessService.processReferral(referrerId, refereeId);
  }

  /**
   * POST /business/razorpay/webhook
   * Receives transactional webhooks from Razorpay, verifying hashes to upgrade memberships.
   */
  @Post('razorpay/webhook')
  @HttpCode(HttpStatus.OK)
  async handleRazorpayWebhook(
    @Headers('x-razorpay-signature') signature: string,
    @Body() payload: any
  ): Promise<{ status: string }> {
    if (!signature) {
      this.logger.warn('Razorpay webhook called without explicit header signature credentials.');
      throw new BadRequestException('Missing x-razorpay-signature validation header.');
    }

    // Convert raw body payload to string for correct cryptographic HMAC evaluation
    const rawPayloadString = JSON.stringify(payload);

    try {
      return await this.businessService.verifyAndProcessRazorpayPayment(signature, rawPayloadString);
    } catch (e: any) {
      this.logger.error(`Razorpay signature verification processing failed: ${e.message}`);
      throw e; // Bubble exceptions up to NestJS error boundaries
    }
  }

  /**
   * POST /business/consultancy/book
   * Reserves calendars with expert CAs, generating secure tokens and WebRTC channels.
   */
  @Post('consultancy/book')
  @HttpCode(HttpStatus.CREATED)
  async bookConsultant(@Body() payload: ConsultancyBookingRequest): Promise<ConsultancyBookingResponse> {
    if (!payload.userId || !payload.expertId || !payload.bookingDate || !payload.amountToPay) {
      throw new BadRequestException('userId, expertId, bookingDate, and amountToPay are mandatory fields.');
    }
    return await this.businessService.createConsultancyBooking(payload);
  }

  /**
   * GET /business/csc/locate
   * Returns nearby Common Service Centres (CSCs) using Haversine physical coordinates distance filters.
   */
  @Get('csc/locate')
  @HttpCode(HttpStatus.OK)
  async locateCsc(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Query('maxRadiusKm') maxRadiusKm?: string
  ): Promise<CscLocationResponse[]> {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radius = maxRadiusKm ? parseFloat(maxRadiusKm) : undefined;

    if (isNaN(lat) || isNaN(lng)) {
      throw new BadRequestException('latitude and longitude parameters must be valid float coordinates.');
    }

    try {
      return await this.businessService.findClosestCscCentres({
        latitude: lat,
        longitude: lng,
        maxRadiusKm: radius
      });
    } catch (e: any) {
      this.logger.error(`Haversine location lookup failed: ${e.message}`);
      throw new InternalServerErrorException('Failed to compute proximity geolocation matrices.');
    }
  }
}
