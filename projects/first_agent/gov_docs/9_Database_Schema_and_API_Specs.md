# Relational Database Schema & API Specifications
**Document Version:** 1.0.0  
**Status:** Production-Ready Specification  
**System:** AI Government Services Platform (SevaSetu AI / Jan Seva AI)  
**Security Level:** Restricted (PII Compliance Enforced)  
**Compliance Mandates:** DPDP Act (2023) & UIDAI Aadhaar Regulations  

---

## 1. Compliance-by-Design Architecture

To operate safely within the Indian public service landscape, the storage and interface architectures of SevaSetu AI enforce compliance programmatically. 

### 1.1. DPDP Act (2023) Compliance Framework
The Digital Personal Data Protection (DPDP) Act mandates clear purpose limitations, affirmative opt-in, strict data minimization, dynamic user consent tracking, and an absolute "right to erasure" (data purging). 
1. **Dynamic Consent State Machine:** Consent is never assumed. Every transactional action (e.g., retrieving data from DigiLocker, performing eligibility matching) checks the `ConsentRecord` table for a valid, unexpired, and non-revoked consent entry corresponding to that specific `ConsentPurpose`.
2. **Right to Erasure (Purging):** When a user requests data deletion, the system executes a cascading deletion. All PII records in `UserProfile`, `AadhaarVault`, and `Document` are deleted. To comply with national audit guidelines without retaining user data, corresponding `SecurityAuditLog` and transactional entries set their foreign keys (`userId`) to `NULL`. The PII contents themselves are irreversibly purged, leaving only anonymized statistics.
3. **Data Minimization & Column Encryption:** Field-level encryption using AES-256-GCM is applied on all PII columns (names, emails, physical phone numbers) before persistence. Only cryptographically secure non-reversible hashes are indexed for high-speed lookups (e.g., `mobileNumberHash` for user login queries).

### 1.2. UIDAI (Aadhaar) Vault & Masking Architecture
Under UIDAI regulations, storing raw Aadhaar numbers is illegal unless hosted in an isolated, security-hardened, and audited "Aadhaar Vault."
1. **Physical Segregation:** The actual 12-digit Aadhaar UID is never stored in the primary user profile tables. It resides exclusively inside the `AadhaarVault` model.
2. **Aadhaar Vault Encryption (Envelope Pattern):** The raw UID is encrypted at the application layer with a unique Data Encryption Key (DEK). This DEK is further encrypted using a Key Encryption Key (KEK) managed by a Federal HSM or cloud equivalent (AWS KMS / Azure Key Vault).
3. **Strict Synthetic Tokenization:** The application references the user's identity using a non-sensitive UUID called the `aadhaarToken`. This token acts as the exclusive handshaking identifier between the core application database and the vault database.
4. **Automated Masking:** The `maskedAadhaar` field stores only the last 4 digits (preceded by 8 "X" characters: `XXXXXXXX1234`). Only the masked string is allowed to leave the service boundary to be displayed on web frontends, mobile PWAs, or sent in external notification payloads.

```
+───────────────────────────────────────────────────────────────────────────────────────────+
|                                    AADHAAR VAULT BOUNDARY                                 |
|                                                                                           |
|  +──────────────────────+       Generate Token       +─────────────────────────+          |
|  |   Core Application   | ─────────────────────────> |     Aadhaar Vault       |          |
|  |       Database       |                            |                         |          |
|  |                      | <───────────────────────── | - aadhaarToken (UUID)   |          |
|  | - userId             |      Return synthetic      | - maskedAadhaar         |          |
|  | - profileMetadata    |            token           | - encryptedAadhaar      |          |
|  +──────────────────────+                            +────────────┬────────────+          |
|                                                                   │                       |
|                                                                   ▼                       |
|                                                      +─────────────────────────+          |
|                                                      |  HSM / Cloud KMS (KEK)  |          |
|                                                      +─────────────────────────+          |
+───────────────────────────────────────────────────────────────────────────────────────────+
```

---

## 2. Complete PostgreSQL Database Schema (Prisma ORM Specs)

This file represents the production-ready `schema.prisma` configuration file. It includes database indexes (`@@index`), unique constraints (`@unique`), cascade rules, default values, and specialized compliance tables.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  USER
  ADMIN
  MODERATOR
  CONSULTANT
}

enum SchemeCategory {
  AGRICULTURE
  EDUCATION
  HEALTHCARE
  PENSION_WELFARE
  BUSINESS_MSME
  TAXATION
  PASSPORT_PAN
}

enum SubscriptionTier {
  FREE
  GOLD_MONTHLY
  GOLD_ANNUAL
}

enum BookingStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
}

enum TrackStatus {
  PENDING
  DOCUMENTS_SUBMITTED
  UNDER_REVIEW
  APPROVED
  REJECTED
}

enum ConsentStatus {
  GRANTED
  REVOKED
  EXPIRED
}

enum ConsentPurpose {
  SCHEME_ELIGIBILITY
  DIGILOCKER_FETCH
  BHASHINI_TRANSLATION
  CONSULTANCY_BOOKING
  TAX_CALCULATION
}

enum AuditAction {
  USER_LOGIN
  PII_READ
  PII_UPDATE
  PII_DELETE
  CONSENT_GRANT
  CONSENT_REVOKE
  AADHAAR_ACCESS
  DOCUMENT_UPLOAD
  DOCUMENT_DELETE
}

model User {
  id                   String               @id @default(uuid())
  mobileNumberHash     String               @unique // Non-reversible SHA-256 hash for lookups
  mobileNumberEnc      String               // AES-256 encrypted raw mobile number (+91...)
  emailEnc             String?              @unique // AES-256 encrypted email address
  fullNameEnc          String               // AES-256 encrypted full legal name
  role                 Role                 @default(USER)
  languagePreference   String               @default("en")
  isConsentGiven       Boolean              @default(false)
  subscriptionTier     SubscriptionTier     @default(FREE)
  createdAt            DateTime             @default(now())
  updatedAt            DateTime             @updatedAt

  profile              UserProfile?
  aadhaarVault         AadhaarVault?
  conversations        Conversation[]
  savedSchemes         UserSavedScheme[]
  applications         ApplicationTrack[]
  bookingsAsUser       ConsultancyBooking[] @relation("UserBookings")
  bookingsAsExpert     ConsultancyBooking[] @relation("ExpertBookings")
  referralsSent        Referral[]           @relation("Referrer")
  referralsReceived    Referral?            @relation("Referee")
  consentRecords       ConsentRecord[]
  documents            Document[]
  securityAuditLogs    SecurityAuditLog[]
}

model UserProfile {
  id             String    @id @default(uuid())
  userId         String    @unique
  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  age            Int
  state          String    // Matches standardized census state lists
  annualIncome   Float
  gender         String    // "MALE", "FEMALE", "OTHER"
  category       String    // "GENERAL", "SC", "ST", "OBC"
  occupation     String
  isStudent      Boolean   @default(false)
  isDisable      Boolean   @default(false)
  hasBusiness    Boolean   @default(false)
}

model AadhaarVault {
  id               String    @id @default(uuid())
  userId           String    @unique
  user             User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  aadhaarToken     String    @unique @default(uuid()) // Synthetic identifier exposed externally
  maskedAadhaar    String    // Masked format: "XXXXXXXX1234"
  encryptedAadhaar String    // Cryptographically encrypted 12-digit UID
  isVerified       Boolean   @default(false)
  verifiedAt       DateTime?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  
  @@index([aadhaarToken])
}

model ConsentRecord {
  id                 String         @id @default(uuid())
  userId             String
  user               User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  purpose            ConsentPurpose
  status             ConsentStatus  @default(GRANTED)
  consentNoticeText  String         // Store verbatim localized notice shown to user
  languagePreference String         @default("en")
  ipAddress          String?
  userAgent          String?
  grantedAt          DateTime       @default(now())
  revokedAt          DateTime?
  expiresAt          DateTime?

  @@index([userId, purpose, status])
}

model Scheme {
  id                String            @id @default(uuid())
  name              String
  description       String
  category          SchemeCategory
  ministry          String
  stateScope        String            // "CENTRAL" or specific state name e.g., "KARNATAKA"
  eligibilityRules  Json              // Dynamic structured rules e.g., { "ageMax": 60, "incomeMax": 200000 }
  documentChecklist String[]          // String representations of required certificates
  officialUrl       String            // Whitelisted .gov.in or .nic.in domain
  dbtAmount         Float?            // DBT financial payout configuration
  isActive          Boolean           @default(true)
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  savedByUsers      UserSavedScheme[]
  documentsRequired DocumentTemplate[]
}

model UserSavedScheme {
  id        String   @id @default(uuid())
  userId    String
  schemeId  String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  scheme    Scheme   @relation(fields: [schemeId], references: [id], onDelete: Cascade)
  savedAt   DateTime @default(now())

  @@unique([userId, schemeId])
}

model DocumentTemplate {
  id           String @id @default(uuid())
  schemeId     String
  scheme       Scheme @relation(fields: [schemeId], references: [id], onDelete: Cascade)
  documentName String
}

model Document {
  id             String           @id @default(uuid())
  userId         String
  user           User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  fileName       String
  fileType       String           // "PDF", "JPG", "PNG"
  fileUrlEnc     String           // Encrypted S3 bucket relative path
  ocrMetadata    Json?            // OCR parsing outputs and localized translation elements
  isMasked       Boolean          @default(false) // Flag confirming OCR-based Aadhaar masking was applied
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt

  @@index([userId])
}

model Conversation {
  id             String          @id @default(uuid())
  userId         String
  user           User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  languageUsed   String          @default("en")
  createdAt      DateTime        @default(now())
  messages       Message[]

  @@index([userId])
}

model Message {
  id             String          @id @default(uuid())
  conversationId String
  conversation   Conversation    @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  role           String          // "SYSTEM", "USER", "ASSISTANT", "TOOL"
  content        String          // Multilingual final text delivered to the UI
  toolCalls      Json?           // Records of tool payloads executed (e.g. database query, API check)
  citations      String[]        // Array of verified .gov.in resource URLs
  createdAt      DateTime        @default(now())
  bhashiniTasks  BhashiniTask[]

  @@index([conversationId])
}

model BhashiniTask {
  id             String         @id @default(uuid())
  messageId      String?
  message        Message?       @relation(fields: [messageId], references: [id], onDelete: SetNull)
  taskType       String         // "ASR", "NMT", "TTS"
  sourceLang     String
  targetLang     String
  characterCount Int
  latencyMs      Int
  status         String         // "SUCCESS", "FAILED"
  errorLog       String?
  createdAt      DateTime       @default(now())

  @@index([messageId])
}

model ApplicationTrack {
  id             String          @id @default(uuid())
  userId         String
  user           User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  schemeName     String
  portalName     String          // e.g., "National Scholarship Portal"
  status         TrackStatus     @default(PENDING)
  notes          String?
  updatedAt      DateTime        @updatedAt
  createdAt      DateTime        @default(now())

  @@index([userId])
}

model ConsultancyBooking {
  id             String          @id @default(uuid())
  userId         String
  user           User            @relation("UserBookings", fields: [userId], references: [id], onDelete: Cascade)
  expertId       String
  expert         User            @relation("ExpertBookings", fields: [expertId], references: [id], onDelete: Cascade)
  bookingDate    DateTime
  status         BookingStatus   @default(PENDING)
  paymentId      String?         // Razorpay Payment Identifier
  amountPaid     Float
  meetingLink    String?         // Encrypted room path
  createdAt      DateTime        @default(now())

  @@index([userId])
  @@index([expertId])
}

model Referral {
  id             String          @id @default(uuid())
  referrerId     String
  referrer       User            @relation("Referrer", fields: [referrerId], references: [id], onDelete: Cascade)
  refereeId      String          @unique
  referee        User            @relation("Referee", fields: [refereeId], references: [id], onDelete: Cascade)
  status         String          // "PENDING", "COMPLETED", "EXPIRED"
  pointsAwarded  Int             @default(0)
  createdAt      DateTime        @default(now())

  @@index([referrerId])
}

model SecurityAuditLog {
  id             String       @id @default(uuid())
  userId         String?
  user           User?        @relation(fields: [userId], references: [id], onDelete: SetNull) // Nullable on user deletion
  action         AuditAction
  ipAddress      String
  userAgent      String
  accessedFields String[]     // e.g. ["fullNameEnc", "aadhaarToken"]
  details        String?      // General operation metadata (never stores actual PII values)
  createdAt      DateTime     @default(now())

  @@index([createdAt, action])
  @@index([userId])
}
```

---

## 3. REST API Specifications

The following endpoints handle consent lifecycle orchestration, low-latency translation workloads via Bhashini, and Retrieval-Augmented Generation (RAG) conversational queries.

### 3.1. Consent Management API

#### 1. Request New Consent Opt-In
* **Endpoint:** `POST /api/v1/consent/request`
* **Headers:** 
  * `Content-Type: application/json`
  * `X-Client-IP: 103.45.2.11`
  * `User-Agent: Mozilla/5.0...`
* **Request Payload:**
```json
{
  "userId": "902e1bca-bc62-421f-88ef-93a8cf8829ae",
  "purpose": "SCHEME_ELIGIBILITY",
  "languagePreference": "hi",
  "consentNoticeText": "मैं सेवासेतु एआई को मेरी पात्रता जांचने के उद्देश्य से मेरे दस्तावेज और प्रोफाइल जानकारी को संसाधित करने की अनुमति देने के लिए अपनी स्पष्ट सहमति प्रदान करता हूं।"
}
```
* **Success Response (201 Created):**
```json
{
  "status": "SUCCESS",
  "consentId": "cns_3b8f2d9a-ec1a-493b-bb2e-4091aefbc012",
  "grantedAt": "2023-10-24T08:14:30.125Z",
  "expiresAt": "2024-10-24T08:14:30.125Z",
  "message": "Consent logged successfully under DPDP parameters."
}
```
* **Error Response (400 Bad Request):**
```json
{
  "errorCode": "INVALID_CONSENT_INPUT",
  "message": "Validation failed. The requested purpose is not recognized by the system context.",
  "errors": [
    {
      "field": "purpose",
      "error": "Must be one of: SCHEME_ELIGIBILITY, DIGILOCKER_FETCH, BHASHINI_TRANSLATION, CONSULTANCY_BOOKING, TAX_CALCULATION"
    }
  ]
}
```

#### 2. Verify User Consent Status
* **Endpoint:** `GET /api/v1/consent/status/:userId`
* **Headers:** 
  * `Authorization: Bearer <JWT_TOKEN>`
* **Success Response (200 OK):**
```json
{
  "userId": "902e1bca-bc62-421f-88ef-93a8cf8829ae",
  "consents": [
    {
      "consentId": "cns_3b8f2d9a-ec1a-493b-bb2e-4091aefbc012",
      "purpose": "SCHEME_ELIGIBILITY",
      "status": "GRANTED",
      "expiresAt": "2024-10-24T08:14:30.125Z"
    },
    {
      "consentId": "cns_9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
      "purpose": "BHASHINI_TRANSLATION",
      "status": "GRANTED",
      "expiresAt": "2024-10-24T08:14:30.125Z"
    }
  ]
}
```
* **Error Response (401 Unauthorized):**
```json
{
  "errorCode": "AUTHENTICATION_FAILED",
  "message": "The provided JSON Web Token is expired or invalid."
}
```

#### 3. Revoke Consent / Enforce Right to Erasure
* **Endpoint:** `POST /api/v1/consent/revoke`
* **Headers:** 
  * `Authorization: Bearer <JWT_TOKEN>`
  * `Content-Type: application/json`
* **Request Payload:**
```json
{
  "userId": "902e1bca-bc62-421f-88ef-93a8cf8829ae",
  "purpose": "SCHEME_ELIGIBILITY",
  "requestPurgeAllData": true
}
```
* **Success Response (200 OK):**
```json
{
  "status": "SUCCESS",
  "userId": "902e1bca-bc62-421f-88ef-93a8cf8829ae",
  "revokedConsentId": "cns_3b8f2d9a-ec1a-493b-bb2e-4091aefbc012",
  "dataPurgeStatus": "COMPLETED",
  "purgedTables": ["UserProfile", "AadhaarVault", "Document"],
  "message": "Consent successfully revoked. High-security automated cascade has irreversibly deleted personal records from the core cluster."
}
```
* **Error Response (403 Forbidden):**
```json
{
  "errorCode": "REVOCATION_DENIED",
  "message": "Cannot revoke consent while an active application is processing in state portals. Finalize or cancel active applications first."
}
```

---

### 3.2. Bhashini Translation Pipeline API

This service wraps the MeitY National Language Translation Mission (NLTM) standards to handle speech-to-text, neural machine translations, and text-to-speech.

#### 1. Neural Machine Translation (NMT)
* **Endpoint:** `POST /api/v1/bhashini/translate`
* **Headers:** 
  * `Content-Type: application/json`
  * `X-Bhashini-Api-Key: <SECURE_API_KEY>`
* **Request Payload:**
```json
{
  "sourceLanguage": "kn",
  "targetLanguage": "en",
  "text": "ನನಗೆ ಪ್ರಧಾನ ಮಂತ್ರಿ ಕಿಸಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ ಯೋಜನೆಯ ಅರ್ಹತೆ ತಿಳಿಸಿ."
}
```
* **Success Response (200 OK):**
```json
{
  "sourceLanguage": "kn",
  "targetLanguage": "en",
  "originalText": "ನನಗೆ ಪ್ರಧಾನ ಮಂತ್ರಿ ಕಿಸಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ ಯೋಜನೆಯ ಅರ್ಹತೆ ತಿಳಿಸಿ.",
  "translatedText": "Please tell me the eligibility for Pradhan Mantri Kisan Samman Nidhi Yojana.",
  "bhashiniTaskRecord": {
    "taskId": "task_bc72-421a-bc01",
    "characterCount": 59,
    "latencyMs": 182
  }
}
```
* **Error Response (422 Unprocessable Entity):**
```json
{
  "errorCode": "BHASHINI_NMT_FAILED",
  "message": "The translation service failed to process the request context.",
  "details": "Gateway Timeout from National ULCA Translation Node."
}
```

#### 2. Automatic Speech Recognition (ASR / Voice-to-Text)
* **Endpoint:** `POST /api/v1/bhashini/asr`
* **Headers:** 
  * `Content-Type: application/json`
* **Request Payload:**
```json
{
  "sourceLanguage": "hi",
  "audioFormat": "ogg",
  "samplingRate": 16000,
  "audioContent": "T3dnU291bmRCeXRlc1N0cmVhbU11bHRpcGFydFJlcXVlc3RCYXNlNjRVbmljb2RlRW5jb2RlZElucHV0RGF0YQ=="
}
```
* **Success Response (200 OK):**
```json
{
  "sourceLanguage": "hi",
  "transcribedText": "मुझे व्यवसाय शुरू करने के लिए मुद्रा लोन चाहिए।",
  "confidenceScore": 0.982,
  "latencyMs": 412
}
```
* **Error Response (400 Bad Request):**
```json
{
  "errorCode": "INVALID_AUDIO_PAYLOAD",
  "message": "The payload is invalid. Audio byte length exceeds the max 10MB limit or audio is corrupted."
}
```

#### 3. Text-to-Speech (TTS / Voice Synthesis)
* **Endpoint:** `POST /api/v1/bhashini/tts`
* **Headers:** 
  * `Content-Type: application/json`
* **Request Payload:**
```json
{
  "targetLanguage": "hi",
  "text": "आप मुद्रा ऋण के लिए पात्र हैं। आगे बढ़ने के लिए कृपया अपना पैन दर्ज करें।",
  "voiceGender": "FEMALE"
}
```
* **Success Response (200 OK):**
```json
{
  "targetLanguage": "hi",
  "audioFormat": "ogg",
  "audioContent": "UklGRiS9AgBXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQC9AgAAAAAAA...",
  "latencyMs": 350
}
```

---

### 3.3. Chat RAG Service API

Handles semantic vector matching and synthesis from verified government policy documents.

#### 1. Query Conversational Agent
* **Endpoint:** `POST /api/v1/ai/chat/query`
* **Headers:** 
  * `Authorization: Bearer <JWT_TOKEN>`
  * `Content-Type: application/json`
* **Request Payload:**
```json
{
  "conversationId": "conv_88c2-bb12-99ef-883a",
  "userQuery": "What is the scholarship limit for OBC students in Karnataka?",
  "streamResponse": false
}
```
* **Success Response (200 OK):**
```json
{
  "conversationId": "conv_88c2-bb12-99ef-883a",
  "messageId": "msg_f3a2b4c6-d8e0-4c22-b98a-7f61031d24a9",
  "detectedLanguage": "en",
  "intent": "SCHEME_DISCOVERY",
  "assistantResponse": "Under the Post-Matric Scholarship Scheme for OBC students in Karnataka, eligible candidates whose family income is less than ₹1 Lakh per year are provided with tuition fee coverage and a monthly maintenance allowance ranging up to ₹750 depending on the type of course.",
  "results": [
    {
      "schemeId": "sch_1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "name": "Post-Matric Scholarship Scheme for OBC",
      "ministry": "Backward Classes Welfare Department, Govt. of Karnataka",
      "stateScope": "KARNATAKA",
      "dbtAmount": 9000.00,
      "officialUrl": "https://ssp.postmatric.karnataka.gov.in"
    }
  ],
  "citations": [
    "https://ssp.postmatric.karnataka.gov.in/policy_circular_2023.pdf",
    "https://bcwd.karnataka.gov.in/en-post-matric-details"
  ]
}
```
* **Error Response (422 Unprocessable Entity):**
```json
{
  "errorCode": "LLM_GUARDRAIL_VIOLATION",
  "message": "The system blocked the output response as it generated hyperlinks referencing non-whitelisted official domains. Output halted for validation safety."
}
```

#### 2. Retrieve Specific Citation Source Details
* **Endpoint:** `GET /api/v1/ai/chat/citations/:messageId`
* **Headers:** 
  * `Authorization: Bearer <JWT_TOKEN>`
* **Success Response (200 OK):**
```json
{
  "messageId": "msg_f3a2b4c6-d8e0-4c22-b98a-7f61031d24a9",
  "citations": [
    {
      "url": "https://ssp.postmatric.karnataka.gov.in/policy_circular_2023.pdf",
      "extractedParagraph": "Post-matric scholarships are awarded to students of Karnataka State whose parental annual income does not exceed ₹1,00,000/- for Group 2A, 3A, and 3B.",
      "pageReference": 3,
      "documentHash": "sha256_889faefb20c93021bb2ea091aefbc012",
      "lastVerifiedAt": "2023-10-15T04:00:00Z"
    }
  ]
}
```

#### 3. Submit Conversational Feedback
* **Endpoint:** `POST /api/v1/ai/chat/feedback`
* **Headers:** 
  * `Authorization: Bearer <JWT_TOKEN>`
  * `Content-Type: application/json`
* **Request Payload:**
```json
{
  "messageId": "msg_f3a2b4c6-d8e0-4c22-b98a-7f61031d24a9",
  "rating": "THUMBS_UP",
  "comments": "Highly accurate. Matched my state scholarship parameters perfectly."
}
```
* **Success Response (200 OK):**
```json
{
  "status": "SUCCESS",
  "feedbackId": "fdb_2b8c9d1e-f3a4-5b6c-7d8e-9f0a1b2c3d4e",
  "message": "Feedback recorded. This data helps reinforce the accuracy loops for the regional routing engine."
}
```

---

## 4. GraphQL API Specifications

For highly interactive client views, the GraphQL endpoint allows high-speed schema matching, detailed audit logging lookups, and unified translation payloads.

### 4.1. Complete Schema Definition Language (SDL)

```graphql
enum Role {
  USER
  ADMIN
  MODERATOR
  CONSULTANT
}

enum SchemeCategory {
  AGRICULTURE
  EDUCATION
  HEALTHCARE
  PENSION_WELFARE
  BUSINESS_MSME
  TAXATION
  PASSPORT_PAN
}

enum ConsentStatus {
  GRANTED
  REVOKED
  EXPIRED
}

enum ConsentPurpose {
  SCHEME_ELIGIBILITY
  DIGILOCKER_FETCH
  BHASHINI_TRANSLATION
  CONSULTANCY_BOOKING
  TAX_CALCULATION
}

enum AuditAction {
  USER_LOGIN
  PII_READ
  PII_UPDATE
  PII_DELETE
  CONSENT_GRANT
  CONSENT_REVOKE
  AADHAAR_ACCESS
  DOCUMENT_UPLOAD
  DOCUMENT_DELETE
}

type User {
  id: ID!
  role: Role!
  languagePreference: String!
  isConsentGiven: Boolean!
  profile: UserProfile
  aadhaarVault: AadhaarVault
  conversations(limit: Int): [Conversation!]!
  consentRecords: [ConsentRecord!]!
  documents: [Document!]!
  createdAt: String!
}

type UserProfile {
  id: ID!
  age: Int!
  state: String!
  annualIncome: Float!
  gender: String!
  category: String!
  occupation: String!
  isStudent: Boolean!
  isDisable: Boolean!
  hasBusiness: Boolean!
}

type AadhaarVault {
  aadhaarToken: ID!
  maskedAadhaar: String!
  isVerified: Boolean!
  verifiedAt: String
}

type ConsentRecord {
  id: ID!
  purpose: ConsentPurpose!
  status: ConsentStatus!
  consentNoticeText: String!
  languagePreference: String!
  ipAddress: String
  userAgent: String
  grantedAt: String!
  revokedAt: String
  expiresAt: String
}

type Scheme {
  id: ID!
  name: String!
  description: String!
  category: SchemeCategory!
  ministry: String!
  stateScope: String!
  eligibilityRules: String! # JSON payload parsed as a String
  documentChecklist: [String!]!
  officialUrl: String!
  dbtAmount: Float
  isActive: Boolean!
}

type Document {
  id: ID!
  fileName: String!
  fileType: String!
  isMasked: Boolean!
  createdAt: String!
}

type Conversation {
  id: ID!
  languageUsed: String!
  messages: [Message!]!
  createdAt: String!
}

type Message {
  id: ID!
  role: String!
  content: String!
  citations: [String!]!
  createdAt: String!
  bhashiniTasks: [BhashiniTask!]!
}

type BhashiniTask {
  id: ID!
  taskType: String!
  sourceLang: String!
  targetLang: String!
  characterCount: Int!
  latencyMs: Int!
  status: String!
}

type SecurityAuditLog {
  id: ID!
  action: AuditAction!
  ipAddress: String!
  userAgent: String!
  accessedFields: [String!]!
  details: String
  createdAt: String!
}

input CreateConsentInput {
  userId: ID!
  purpose: ConsentPurpose!
  languagePreference: String!
  consentNoticeText: String!
  ipAddress: String
  userAgent: String
}

input BhashiniTranslateInput {
  sourceLanguage: String!
  targetLanguage: String!
  text: String!
}

input SchemeFilterInput {
  category: SchemeCategory
  stateScope: String
  age: Int
  annualIncome: Float
  categoryGroup: String # e.g. "OBC"
}

type SchemeMatchResult {
  isEligible: Boolean!
  matchingScore: Float!
  scheme: Scheme!
}

type Query {
  me: User!
  verifyConsent(userId: ID!, purpose: ConsentPurpose!): ConsentRecord
  getAuditHistory(userId: ID!, limit: Int): [SecurityAuditLog!]!
  findMatchingSchemes(filter: SchemeFilterInput!): [SchemeMatchResult!]!
  getConversationDetails(conversationId: ID!): Conversation
}

type Mutation {
  recordConsent(input: CreateConsentInput!): ConsentRecord!
  revokeConsent(userId: ID!, purpose: ConsentPurpose!, requestPurgeAllData: Boolean!): Boolean!
  executeTranslation(input: BhashiniTranslateInput!): BhashiniTask!
}
```

---

### 4.2. Sample GraphQL Operations

#### 1. Fetch User Consent History and Audit Details
Allows system compliance officers or the user themselves to audit how, when, and what permission structures were captured.

* **GraphQL Query:**
```graphql
query GetMyConsentAudit($userId: ID!) {
  me {
    id
    languagePreference
    isConsentGiven
    consentRecords {
      id
      purpose
      status
      consentNoticeText
      ipAddress
      grantedAt
      revokedAt
    }
  }
  getAuditHistory(userId: $userId, limit: 3) {
    id
    action
    ipAddress
    accessedFields
    details
    createdAt
  }
}
```
* **Variables:**
```json
{
  "userId": "902e1bca-bc62-421f-88ef-93a8cf8829ae"
}
```
* **JSON Output:**
```json
{
  "data": {
    "me": {
      "id": "902e1bca-bc62-421f-88ef-93a8cf8829ae",
      "languagePreference": "hi",
      "isConsentGiven": true,
      "consentRecords": [
        {
          "id": "cns_3b8f2d9a-ec1a-493b-bb2e-4091aefbc012",
          "purpose": "SCHEME_ELIGIBILITY",
          "status": "GRANTED",
          "consentNoticeText": "मैं सेवासेतु एआई को मेरी पात्रता जांचने के उद्देश्य से मेरे दस्तावेज...",
          "ipAddress": "103.45.2.11",
          "grantedAt": "2023-10-24T08:14:30.125Z",
          "revokedAt": null
        }
      ]
    },
    "getAuditHistory": [
      {
        "id": "aud_108a-bc32-11ef",
        "action": "PII_READ",
        "ipAddress": "103.45.2.11",
        "accessedFields": ["fullNameEnc", "mobileNumberEnc"],
        "details": "User profile accessed for scheme eligibility calculation",
        "createdAt": "2023-10-24T08:15:01.002Z"
      }
    ]
  }
}
```

#### 2. Request Bhashini Translation Tasks
Directly executes translation and logs the transactional performance metadata inside the DB.

* **GraphQL Mutation:**
```graphql
mutation ExecuteBhashiniTranslation($input: BhashiniTranslateInput!) {
  executeTranslation(input: $input) {
    id
    taskType
    sourceLang
    targetLang
    characterCount
    latencyMs
    status
  }
}
```
* **Variables:**
```json
{
  "input": {
    "sourceLanguage": "en",
    "targetLanguage": "hi",
    "text": "Your Aadhaar Card has been successfully verified."
  }
}
```
* **JSON Output:**
```json
{
  "data": {
    "executeTranslation": {
      "id": "task_2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d",
      "taskType": "NMT",
      "sourceLang": "en",
      "targetLang": "hi",
      "characterCount": 49,
      "latencyMs": 145,
      "status": "SUCCESS"
    }
  }
}
```

#### 3. Match Schemes by Dynamic Demographics
Queries the RAG eligibility compiler, checking active schemes against the dynamic criteria rules set in PostgreSQL.

* **GraphQL Query:**
```graphql
query CheckSchemeEligibility($filter: SchemeFilterInput!) {
  findMatchingSchemes(filter: $filter) {
    isEligible
    matchingScore
    scheme {
      id
      name
      category
      ministry
      dbtAmount
      officialUrl
    }
  }
}
```
* **Variables:**
```json
{
  "filter": {
    "category": "PENSION_WELFARE",
    "stateScope": "KARNATAKA",
    "age": 65,
    "annualIncome": 75000.00,
    "categoryGroup": "OBC"
  }
}
```
* **JSON Output:**
```json
{
  "data": {
    "findMatchingSchemes": [
      {
        "isEligible": true,
        "matchingScore": 0.95,
        "scheme": {
          "id": "sch_827a-bc12-dd09",
          "name": "Sandhya Suraksha Scheme (Old Age Pension)",
          "category": "PENSION_WELFARE",
          "ministry": "Social Welfare Department, Govt. of Karnataka",
          "dbtAmount": 1200.00,
          "officialUrl": "https://sevasindhu.karnataka.gov.in"
        }
      }
    ]
  }
}
```

---

## 5. Enterprise Data Management, Security, and Migration Strategies

To maintain performance, security, and resiliency under heavy public workloads, the database uses specific partitioning, security-envelope patterns, and high-availability operations.

### 5.1. High-Volume Log Table Partitioning
Table size bloat is a common performance bottleneck in production clusters. In this design, two tables accumulate records at a high frequency:
1. `SecurityAuditLog` (Capturing every single API read and PII access session).
2. `ChatMessage` / `BhashiniTask` (Capturing every dialogue step and API call).

To prevent index degradation and maintain rapid access times, these tables implement **Declarative Range Partitioning** inside PostgreSQL:
* **Partition Key:** `createdAt`
* **Partition Interval:** Monthly (e.g., `audit_log_2023_10`, `audit_log_2023_11`).
* **Retention Policy:** Hot storage for 6 months. After 6 months, a pipeline automatically detaches the partition table and exports it as highly compressed Apache Parquet formats to cold storage (AWS S3 Glacier Select / Azure Archive Storage) for long-term DPDP and SOC-2 security audits. This keeps the active operational database footprint clean and highly responsive.

### 5.2. Column-Level Envelope Encryption Setup (KMS Integration)
Direct column encryption prevents data exposure in the event of a raw database snapshot leak.
* **Cryptographic Algorithm:** AES-256-GCM.
* **Key Hierarchy:**
  * **Master Key (KEK):** Managed and stored inside a FIPS 140-2 Level 3 Hardware Security Module (HSM) or key service (e.g., AWS KMS or Azure Key Vault).
  * **Data Encryption Key (DEK):** Stored inside the runtime environment context, protected and re-encrypted by the KEK.
* **Workflow:**
  1. User enters private details (e.g., Full Legal Name).
  2. The application layer requests the active DEK.
  3. The value is encrypted to a Base64 string and written to `fullNameEnc` in the PostgreSQL database.
  4. When querying, only the exact cryptographic matching is parsed, preserving the index logic through hashed equivalents like `mobileNumberHash`.

```
 +------------------+           Encrypt (AES-256-GCM)          +------------------+
 |  Raw Plaintext   | ───────────────────────────────────────> | Encrypted Column |
 |  (e.g., Name)    | <─────────────────────────────────────── | (Stored in DB)   |
 +--------┬---------+           Decrypt (AES-256-GCM)          +------------------+
          │                                                             ▲
          │ Uses DEK                                                    │ Uses DEK
          ▼                                                             │
  +───────────────+                                                     │
  |  Data Enc Key | <───────────────────────────────────────────────────┘
  |    (DEK)      |
  +───────┬───────+
          │
          │ Decrypted by KEK
          ▼
  +───────────────+
  |  Master Key   | (Securely hosted inside Cloud KMS / HSM)
  |    (KEK)      |
  +───────────────+
```

### 5.3. Disaster Recovery and Replication Topologies
To protect critical citizen interactions during regional network disruptions or system failures, the database uses a Multi-AZ, Multi-Region replication strategy.

* **Replication Pattern:**
  * **Active Primary Node:** Located in Mumbai region (`ap-south-1` on AWS or Central India on Azure) serving all write operations.
  * **Synchronous Multi-AZ Secondary:** Located in a separate availability zone within the primary region, enabling sub-second automatic failover with zero data loss.
  * **Asynchronous Read-Replicas:** Distributed in the Chennai region (`ap-south-2` or South India) to offload read operations (such as CMS lookups and vector retrieval checks) and serve as a hot standby.
* **Recovery Targets:**
  * **Recovery Point Objective (RPO):** < 5 minutes (Maximum allowed data loss in a severe disaster).
  * **Recovery Time Objective (RTO):** < 15 minutes (Maximum allowed time to restore services).
* **Point-in-Time Recovery (PITR):** Write-Ahead Logging (WAL) files are continuously backed up to an isolated S3 object store with Object Lock enabled, permitting recovery to any specific second over a trailing 35-day window.

### 5.4. Zero-Downtime Rolling Database Migration Strategy
For a platform serving millions of active users, taking the database offline for migration changes is unacceptable. The database utilizes the **Expand-Contract (Parallel-Run) Pattern** to safely update schemas:

1. **Phase 1: Expand (Additive Changes)**
   * Deploy additive schema migrations (e.g., adding a new optional column or table).
   * Do not alter or drop any existing columns, keeping the running old version of the API functional.
2. **Phase 2: Sync (Dual-Writing)**
   * Deploy application code that writes to *both* the old and the new columns/tables.
   * Run a background worker process in batches to migrate historical data from the old model to the new model.
3. **Phase 3: Transition (Read Switch)**
   * Deploy application code that switches reads exclusively to the new database columns.
   * At this stage, the system is fully operating on the new schema, but the old layout remains in place as an instant rollback option.
4. **Phase 4: Contract (Cleanup)**
   * Once operations are verified as stable over a complete monitoring cycle, run a migration to safely drop the old unused columns/tables and clean up dual-write logic in the application code.
