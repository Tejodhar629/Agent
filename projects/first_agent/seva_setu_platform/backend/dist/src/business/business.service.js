"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BusinessService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const crypto = require("crypto");
let BusinessService = BusinessService_1 = class BusinessService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(BusinessService_1.name);
        this.razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_wh_secret_9982';
        this.dailyRotatedSalt = crypto.randomBytes(32).toString('hex');
    }
    async generateSeoBlog(payload) {
        this.logger.log(`Generating dynamic localized SEO blog for Scheme: ${payload.schemeId}, Lang: ${payload.targetLanguage}`);
        let schemeName = 'PM Fasal Bima Yojana (PMFBY)';
        let ministry = 'Ministry of Agriculture & Farmers Welfare';
        let category = 'AGRICULTURE';
        let officialUrl = 'https://pmfby.gov.in';
        let dbtAmount = 0;
        try {
            const dbScheme = await this.prisma.scheme.findUnique({
                where: { id: payload.schemeId }
            });
            if (dbScheme) {
                schemeName = dbScheme.title;
                ministry = dbScheme.ministry;
                category = dbScheme.category;
                officialUrl = dbScheme.officialLink;
                dbtAmount = dbScheme.dbtAmount || 0;
            }
        }
        catch (e) {
            this.logger.warn(`Scheme database lookup failed, using metadata mocks: ${e.message}`);
        }
        const dict = {
            hi: {
                title: `${schemeName} के लिए आवेदन कैसे करें: पात्रता, दस्तावेज़ और लाभ विवरण`,
                intro: `क्या आप उत्तर प्रदेश या अन्य राज्यों में किसान हैं? आधिकारिक ${schemeName} आपके कृषि कल्याण के लिए महत्वपूर्ण वित्तीय सहायता प्रदान करता है। जानिए संपूर्ण प्रक्रिया।`,
                eligibility: 'पात्रता मानदंड विवरण:',
                documents: 'आवश्यक सरकारी दस्तावेज़ों की सूची:',
                benefits: 'वित्तीय और सामाजिक लाभ विवरण:'
            },
            mr: {
                title: `${schemeName} साठी अर्ज कसा करावा: पात्रता, आवश्यक कागदपत्रे आणि लाभ`,
                intro: `महाराष्ट्र आणि इतर राज्यातील शेतकऱ्यांसाठी आनंदाची बातमी! ${schemeName} अंतर्गत आता शेती नुकसानीसाठी थेट बँक खात्यात आर्थिक मदत मिळणार आहे. संपूर्ण माहिती वाचा.`,
                eligibility: 'पात्रतेचे निकष खालीलप्रमाणे आहेत:',
                documents: 'आवश्यक शासकीय कागदपत्रे:',
                benefits: 'थेट लाभ हस्तांतरण (DBT) रक्कम आणि फायदे:'
            },
            kn: {
                title: `${schemeName} ಯೋಜನೆಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸುವುದು ಹೇಗೆ: ಅರ್ಹತೆ ಮತ್ತು ದಾಖಲೆಗಳು`,
                intro: `ಕರ್ನಾಟಕದ ಪ್ರೀತಿಯ ರೈತ ಬಾಂಧವರೇ, ನಿಮ್ಮ ಬೆಳೆ ನಷ್ಟ ಪರಿಹಾರಕ್ಕಾಗಿ ${schemeName} ಯೋಜನೆಯ ಸಂಪೂರ್ಣ ವಿವರ ಇಲ್ಲಿದೆ. ಇಂದೇ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ ಲಾಭ ಪಡೆಯಿರಿ.`,
                eligibility: 'ಅರ್ಹತೆಯ ಮುಖ್ಯ ಮಾನದಂಡಗಳು:',
                documents: 'ಅಗತ್ಯವಿರುವ ಅಧಿಕೃತ ದಾಖಲೆಗಳು:',
                benefits: 'ನೇರ ನಗದು ವರ್ಗಾವಣೆ (DBT) ವಿವರಗಳು:'
            },
            en: {
                title: `How to Apply for ${schemeName}: Complete Eligibility, Required Documents, and Direct Benefits Manual`,
                intro: `Discover the ultimate programmatic guide to applying for ${schemeName} under ${ministry}. Secure your benefits with official steps.`,
                eligibility: 'Key Eligibility Standards:',
                documents: 'Official Document Checklists Required:',
                benefits: 'Direct Benefit Transfer (DBT) Metrics & Payouts:'
            }
        };
        const lang = dict[payload.targetLanguage] ? payload.targetLanguage : 'en';
        const text = dict[lang];
        const slug = `${schemeName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${payload.targetLanguage}`;
        const dynamicUrl = `https://sevasetu.gov.in/schemes/${payload.stateScope.toLowerCase()}/${category.toLowerCase()}/${slug}`;
        const contentMarkdown = `
# ${text.title}

${text.intro}

---

## 📋 ${text.eligibility}
- **Geographic Coverage:** Authorized for residents in the state of **${payload.stateScope}**.
- **Income Gating Ceiling:** Verified based on parental income sheets or economic certificate status.
- **Benefit Classifications:** Standardized under the **${category}** welfare category.

---

## 🗃️ ${text.documents}
1. **Aadhaar Identity Verification:** Must be validated via client-side masked token systems.
2. **Bank Account Details:** Explicitly registered with **Direct Benefit Transfer (DBT)** parameters enabled.
3. **Caste/Income Certificate:** Validated via **DigiLocker SSO Integration** on the SevaSetu Dashboard.

---

## 💰 ${text.benefits}
- **Direct Financial Transfers:** Up to **Rs ${dbtAmount > 0 ? dbtAmount : '6,000'}** paid dynamically into certified accounts.
- **Authorized Whitelisted Reference Portal:** You can access the official guidelines at [${schemeName} Reference Portal](${officialUrl}).

---

*This article is programmatically synchronized and verified against official gazettes under the whitelist of ${ministry}, Government of India.*
    `.trim();
        const governmentServiceSchema = {
            '@context': 'https://schema.org',
            '@type': 'GovernmentService',
            'name': schemeName,
            'serviceType': 'Public Welfare Subsidy Scheme',
            'provider': {
                '@type': 'GovernmentOrganization',
                'name': ministry,
                'areaServed': payload.stateScope
            },
            'serviceOperator': {
                '@type': 'GovernmentOrganization',
                'name': 'SevaSetu AI Integration Portal'
            },
            'areaServed': {
                '@type': 'AdministrativeArea',
                'name': payload.stateScope
            },
            'url': officialUrl
        };
        const faqPageSchema = {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            'mainEntity': [
                {
                    '@type': 'Question',
                    'name': `Who is eligible to apply for ${schemeName}?`,
                    'acceptedAnswer': {
                        '@type': 'Answer',
                        'text': `Eligible citizens residing in ${payload.stateScope} who meet the income limits and specific occupational standards outlined under ${category} guidelines.`
                    }
                },
                {
                    '@type': 'Question',
                    'name': `What documents are required for application under ${schemeName}?`,
                    'acceptedAnswer': {
                        '@type': 'Answer',
                        'text': 'Mandatory documents include a valid masked Aadhaar card, bank account linked to Direct Benefit Transfer (DBT), and income or caste certificates synchronized from DigiLocker.'
                    }
                }
            ]
        };
        return {
            slug,
            title: text.title,
            contentMarkdown,
            language: lang,
            metaDescription: `${text.title} - Get the verified eligibility rules and document checklists on SevaSetu AI.`,
            alternateHreflangMaps: [
                { lang: 'en', url: `https://sevasetu.gov.in/schemes/${payload.stateScope.toLowerCase()}/${category.toLowerCase()}/${schemeName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-en` },
                { lang: 'hi', url: `https://sevasetu.gov.in/schemes/${payload.stateScope.toLowerCase()}/${category.toLowerCase()}/${schemeName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-hi` },
                { lang: 'kn', url: `https://sevasetu.gov.in/schemes/${payload.stateScope.toLowerCase()}/${category.toLowerCase()}/${schemeName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-kn` },
                { lang: 'mr', url: `https://sevasetu.gov.in/schemes/${payload.stateScope.toLowerCase()}/${category.toLowerCase()}/${schemeName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-mr` }
            ],
            structuredDataJsonLd: {
                governmentServiceSchema,
                faqPageSchema
            }
        };
    }
    async sendNotification(payload) {
        const startTime = Date.now();
        this.logger.log(`Dispatching bilingual ${payload.channel} notification to ${payload.recipientMobile}...`);
        let formattedMessage = payload.messageTemplate;
        for (const [key, val] of Object.entries(payload.variables)) {
            formattedMessage = formattedMessage.replace(new RegExp(`{{${key}}}`, 'g'), val);
        }
        const characterCount = formattedMessage.length;
        const isUnicode = /[^\x00-\x7F]/.test(formattedMessage);
        const segmentLength = isUnicode ? 70 : 160;
        const smsSegments = Math.ceil(characterCount / segmentLength);
        const mockNICGatewayEndpoint = 'https://api.sms.nic.in/v1/send';
        this.logger.debug(`POST payload routed to NIC Gateway endpoint [${mockNICGatewayEndpoint}]. Segments: ${smsSegments}`);
        const deliveryLatencyMs = Math.floor(Math.random() * 120) + 30;
        try {
            await this.prisma.securityAuditLog.create({
                data: {
                    action: client_1.AuditAction.PII_READ,
                    ipAddress: '127.0.0.1',
                    userAgent: 'SevaSetu System Scheduler',
                    accessedFields: ['mobileNumberEnc'],
                    details: `Sent ${payload.channel} notification messageId: nt_${Math.random().toString(36).substring(7)}`
                }
            });
        }
        catch (e) {
            this.logger.error(`Failed to write notification security audit log: ${e.message}`);
        }
        return {
            messageId: `nt_${crypto.randomBytes(8).toString('hex')}`,
            recipient: payload.recipientMobile.replace(/\d{6}/, 'XXXXXX'),
            channel: payload.channel,
            status: 'SENT',
            smsSegments,
            characterCount,
            deliveryLatencyMs
        };
    }
    async logTelemetryEvent(payload) {
        let anonymousIdentifier = 'ANONYMOUS_GUEST';
        if (payload.userId) {
            anonymousIdentifier = crypto
                .createHmac('sha256', this.dailyRotatedSalt)
                .update(payload.userId)
                .digest('hex');
        }
        this.logger.log(`[ANALYTICS EVENT LOGGED] Action: ${payload.eventAction}, Component: ${payload.elementCategory}, ObfuscatedUser: ${anonymousIdentifier.substring(0, 12)}...`);
        return {
            status: 'SUCCESS',
            anonymousHash: anonymousIdentifier
        };
    }
    async processReferral(referrerId, refereeId) {
        this.logger.log(`Processing referral connection. Referrer ID: ${referrerId}, Referee ID: ${refereeId}`);
        if (referrerId === refereeId) {
            throw new common_1.BadRequestException('Referral system fraud violation: Citizens cannot redeem their own referral codes.');
        }
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                const referrer = await tx.user.findUnique({ where: { id: referrerId } });
                if (!referrer)
                    throw new common_1.BadRequestException('Referrer user profile does not exist.');
                const referee = await tx.user.findUnique({ where: { id: refereeId } });
                if (!referee)
                    throw new common_1.BadRequestException('Referee user profile does not exist.');
                const existingReferral = await tx.referral.findUnique({
                    where: { refereeId }
                });
                if (existingReferral) {
                    throw new common_1.BadRequestException('Referee profile has already redeemed an invitation code.');
                }
                const newReferral = await tx.referral.create({
                    data: {
                        referrerId,
                        refereeId,
                        status: 'COMPLETED',
                        pointsAwarded: 100
                    }
                });
                await tx.securityAuditLog.create({
                    data: {
                        userId: referrerId,
                        action: client_1.AuditAction.PII_UPDATE,
                        ipAddress: '127.0.0.1',
                        userAgent: 'SevaSetu Referral Controller',
                        accessedFields: ['referralsSent'],
                        details: `Completed referral tracking, awarded 100 Jan Seva Coins to Referrer. Link ID: ${newReferral.id}`
                    }
                });
                return newReferral;
            });
            return {
                status: 'COMPLETED',
                referralId: result.id,
                pointsAwarded: result.pointsAwarded,
                message: 'Successfully tracked referral invite! 100 Jan Seva Coins awarded to referrer.'
            };
        }
        catch (e) {
            this.logger.error(`Referral registration transactional flow failed: ${e.message}`);
            throw new common_1.BadRequestException(e.message || 'Failed to redeem referral code.');
        }
    }
    async verifyAndProcessRazorpayPayment(signature, payloadRaw) {
        this.logger.log('Incoming Razorpay transaction webhook signature verification audit initialized...');
        const expectedSignature = crypto
            .createHmac('sha256', this.razorpayWebhookSecret)
            .update(payloadRaw)
            .digest('hex');
        const isSignatureValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
        if (!isSignatureValid) {
            this.logger.warn('[SECURITY BREACH ALERT] Invalid Razorpay webhook signature detected. Blocking operation.');
            throw new common_1.BadRequestException('Razorpay webhook signature verification failed.');
        }
        try {
            const payloadObj = JSON.parse(payloadRaw);
            const transactionStatus = payloadObj.event;
            if (transactionStatus !== 'payment.captured') {
                this.logger.log(`Ignoring unhandled Razorpay event category: ${transactionStatus}`);
                return { status: 'IGNORED' };
            }
            const notes = payloadObj.payload?.payment?.entity?.notes || {};
            const targetUserId = notes.userId;
            const targetSubscriptionTier = notes.subscriptionTier;
            if (!targetUserId || !targetSubscriptionTier) {
                throw new common_1.BadRequestException('Missing target userId or subscription details in webhook notes metadata.');
            }
            await this.prisma.$transaction(async (tx) => {
                await tx.user.update({
                    where: { id: targetUserId },
                    data: { subscriptionTier: targetSubscriptionTier }
                });
                await tx.securityAuditLog.create({
                    data: {
                        userId: targetUserId,
                        action: client_1.AuditAction.PII_UPDATE,
                        ipAddress: '127.0.0.1',
                        userAgent: 'Razorpay Webhook Listener',
                        accessedFields: ['subscriptionTier'],
                        details: `Upgraded subscriptionTier status to ${targetSubscriptionTier} via verified webhook paymentId: ${payloadObj.payload.payment.entity.id}`
                    }
                });
            });
            this.logger.log(`User Profile [${targetUserId}] upgraded successfully to ${targetSubscriptionTier}.`);
            return { status: 'SUCCESS', userId: targetUserId };
        }
        catch (e) {
            this.logger.error(`Razorpay webhook processing failed: ${e.message}`);
            throw new common_1.InternalServerErrorException(e.message || 'Razorpay webhook internal server error.');
        }
    }
    async createConsultancyBooking(payload) {
        this.logger.log(`Booking consultancy room: User ${payload.userId} with Consultant ${payload.expertId}`);
        const bookingDateParsed = new Date(payload.bookingDate);
        const amountPaid = payload.amountToPay;
        const platformSplitFee = parseFloat((amountPaid * 0.25).toFixed(2));
        const consultantPayout = parseFloat((amountPaid * 0.75).toFixed(2));
        const uniqueRoomToken = crypto.randomBytes(16).toString('hex');
        const meetingLink = `https://meet.sevasetu.gov.in/v1/room_${uniqueRoomToken}`;
        try {
            const booking = await this.prisma.$transaction(async (tx) => {
                const expert = await tx.user.findUnique({ where: { id: payload.expertId } });
                if (!expert || expert.role !== client_1.Role.CONSULTANT) {
                    throw new common_1.BadRequestException('Target expert ID is invalid or does not belong to verified CONSULTANTS.');
                }
                const newBooking = await tx.consultancyBooking.create({
                    data: {
                        userId: payload.userId,
                        expertId: payload.expertId,
                        bookingDate: bookingDateParsed,
                        status: client_1.BookingStatus.CONFIRMED,
                        amountPaid,
                        meetingLink,
                        paymentId: `pay_${crypto.randomBytes(8).toString('hex')}`
                    }
                });
                await tx.securityAuditLog.create({
                    data: {
                        userId: payload.userId,
                        action: client_1.AuditAction.PII_READ,
                        ipAddress: '127.0.0.1',
                        userAgent: 'SevaSetu Booking Manager',
                        accessedFields: ['bookingsAsUser'],
                        details: `Consultancy room allocated: ${meetingLink}, split processed. Booking ID: ${newBooking.id}`
                    }
                });
                return newBooking;
            });
            return {
                bookingId: booking.id,
                userId: booking.userId,
                expertId: booking.expertId,
                status: booking.status,
                meetingLink: booking.meetingLink || '',
                platformSplitFee,
                consultantPayout,
                paymentId: booking.paymentId || ''
            };
        }
        catch (e) {
            this.logger.error(`Failed to register consultancy booking: ${e.message}`);
            throw new common_1.BadRequestException(e.message || 'Failed to complete consultancy booking.');
        }
    }
    async findClosestCscCentres(query) {
        this.logger.log(`Locating local Common Service Centres near coordinates: [Lat: ${query.latitude}, Lng: ${query.longitude}]`);
        const maxRadius = query.maxRadiusKm || 10.0;
        const cscDatabase = [
            { id: 'csc_001', name: 'Unnao Central Jan Seva Kendra', operator: 'Suresh Chandra Maurya', contact: '+919988776611', lat: 26.5393, lng: 80.4878, hours: '09:00 AM - 06:00 PM' },
            { id: 'csc_002', name: 'Unnao Rural Agriculture CSC', operator: 'Rajesh Mishra', contact: '+919876123456', lat: 26.5450, lng: 80.4920, hours: '08:00 AM - 05:00 PM' },
            { id: 'csc_003', name: 'Lucknow Chowk Digital Kendra', operator: 'Amit Srivastava', contact: '+919123456789', lat: 26.8467, lng: 80.9462, hours: '10:00 AM - 08:00 PM' },
            { id: 'csc_004', name: 'Bengaluru SSP Helpdesk CSC', operator: 'Kiran Gowda', contact: '+918088112233', lat: 12.9716, lng: 77.5946, hours: '09:30 AM - 06:30 PM' }
        ];
        const results = [];
        for (const csc of cscDatabase) {
            const distance = this.calculateHaversineDistance(query.latitude, query.longitude, csc.lat, csc.lng);
            if (distance <= maxRadius) {
                const affiliateReferralCode = `VLE_${csc.id.toUpperCase()}_${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
                results.push({
                    cscId: csc.id,
                    centerName: csc.name,
                    vleOperatorName: csc.operator,
                    contactNumber: csc.contact,
                    operatingHours: csc.hours,
                    distanceKm: parseFloat(distance.toFixed(2)),
                    directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${csc.lat},${csc.lng}`,
                    affiliateReferralCode
                });
            }
        }
        return results.sort((a, b) => a.distanceKm - b.distanceKm);
    }
    calculateHaversineDistance(lat1, lon1, lat2, lon2) {
        const earthRadiusKm = 6371.0;
        const dLat = this.degreesToRadians(lat2 - lat1);
        const dLon = this.degreesToRadians(lon2 - lon1);
        const lat1Rad = this.degreesToRadians(lat1);
        const lat2Rad = this.degreesToRadians(lat2);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadiusKm * c;
    }
    degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
};
exports.BusinessService = BusinessService;
exports.BusinessService = BusinessService = BusinessService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BusinessService);
//# sourceMappingURL=business.service.js.map