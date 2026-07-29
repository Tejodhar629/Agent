# PRODUCT REQUIREMENT DOCUMENT (PRD)
## Project "Jan Seva AI" (AI-Powered Government Services Platform for India)

**Document Version:** 1.0.0  
**Status:** Approved / Production-Ready  
**Date:** October 2023  
**Target MVP Version:** v1.0.0-Beta  
**Author:** Lead Product Manager & Principal AI Systems Architect

---

## 1. Product Vision & Value Proposition

### 1.1. Core Product Vision
**Jan Seva AI** is an AI-first, conversational e-governance companion designed to close the digital divide across India. It serves as a unified, natural language interface that abstracts the complexity of navigating multiple state and central government portals. Citizens and businesses describe their objectives in simple, local language, and the system uses real-time RAG (Retrieval-Augmented Generation) on certified policies and a multi-agent orchestration framework to automatically find schemas, verify document checklists, guide applications, and calculate tax structures.

```
+-----------------------------------------------------------------------------------+
|                              JAN SEVA AI COGNITIVE CORE                           |
+-----------------------------------------------------------------------------------+
|      User Natural Language Input (Voice/Text)                                      |
|                       │                                                           |
|                       ▼                                                           |
|          [ Bhashini Translation API ]                                              |
|                       │                                                           |
|                       ▼                                                           |
|        [ AI Router & Orchestration Agent ]                                        |
|         ├──> Category A: Welfare & Schemes ──> [Scheme Finder Vector DB] ──> GPT-4  |
|         ├──> Category B: Financial & Taxes  ──> [GST/ITR Calculators]  ──> GPT-4  |
|         └──> Category C: Registrations      ──> [DigiLocker OCR Agent] ──> GPT-4  |
|                       │                                                           |
|                       ▼                                                           |
|           Verified Output Generator                                               |
|         (Cites ONLY .gov.in links, structures checklists, and speaks via Bhashini) |
+-----------------------------------------------------------------------------------+
```

### 1.2. Unique Value Proposition (UVP)
> **"Conversational e-governance for every Indian citizen, in their own voice, with 100% verified government citations."**

Jan Seva AI separates itself from general-purpose LLMs by enforcing strict, rule-based output verification:
1. **Dynamic Vernacular Grounding:** Voice-in/voice-out capabilities using localized automatic speech recognition and speech synthesis (Bhashini SDK) covering 22 official Indian languages.
2. **Zero-Hallucination Guardrails:** AI answers must be grounded on parsed PDFs of official government circulars. No answer is shown to the user unless it is backed by an official `.gov.in` source link.
3. **Deep National Integration:** Direct authorization hooks with DigiLocker, e-Pramaan, and API Setu for secure document verification and verification.

---

## 2. Target User Personas & User Journeys

### 2.1. Persona 1: Rajesh Gowda (Vernacular Rural Farmer)
* **Demographics:** Age 52, lives in Mandya, Karnataka. Speaks only Kannada.
* **Profile:** Smallholder sugarcane farmer with limited literacy. Owns a budget ₹8,000 Android phone.
* **Goal:** Apply for agricultural subsidies (PM-KISAN) and track drought relief payouts.
* **Pain Point:** Cannot read English portals. Local middlemen demand a ₹500 fee just to check his application status.
* **User Journey on Jan Seva AI:**
  1. Rajesh opens the mobile PWA and taps the green microphone icon.
  2. He asks in spoken Kannada: *"How do I get my PM-KISAN money?"*
  3. The platform processes his audio, translates it to English internally, runs a vector search on the PM-KISAN guidelines, and translates the response back to spoken Kannada.
  4. The platform speaks: *"Rajesh, you are eligible. I need your land record number (RTC) and Aadhaar card. Do you want me to pull them from your DigiLocker?"*
  5. Rajesh says *"Yes"*, authenticates via e-Pramaan OTP, and the system extracts his RTC, verifying eligibility.
  6. The platform generates the direct link to apply and guides him step-by-step.

### 2.2. Persona 2: Priya Sharma (Aspiring Female Tech Entrepreneur)
* **Demographics:** Age 26, lives in Bengaluru, Karnataka. Speaks English and Hindi.
* **Profile:** Graduate starting a software product agency. Highly digital but unfamiliar with Indian corporate tax frameworks.
* **Goal:** Incorporate an MSME, register for GST, and find female-founder startup grants.
* **Pain Point:** Overwhelmed by the complex SPICe+ form, MCA guidelines, and confusing tax slabs for GST.
* **User Journey on Jan Seva AI:**
  1. Priya logs into the desktop dashboard, selecting English.
  2. She enters: *"I want to set up an IT consulting firm. What are my tax obligations and can I get a startup grant?"*
  3. The **Business Registration Agent** triggers a multi-step checklist, recommending her to register for an MSME (Udyam) first to get 100% collateral-free loans.
  4. The **GST Assistant** explains the dynamic tax brackets for service providers, and checks if she is eligible for the Composition Scheme.
  5. The platform aggregates female-centric grants under Startup India (like Her&Now) and displays required documents, prompting her to link DigiLocker to pre-fill her PAN and Aadhaar records.

### 2.3. Persona 3: Vikram Deshmukh (Retired Central Government Employee)
* **Demographics:** Age 68, lives in Pune, Maharashtra. Speaks Marathi and English.
* **Profile:** Retired railways officer. Navigates smartphones reasonably well but suffers from mild visual impairment.
* **Goal:** Track pension certificates (Jeevan Pramaan) and register for national senior citizen health cards (Ayushman Bharat).
* **Pain Point:** Traditional portals have tiny fonts, poor screen reader support, and slow load times.
* **User Journey on Jan Seva AI:**
  1. Vikram visits the platform and toggles the **High Contrast Mode** and **Large Font Accessibility** options.
  2. He types or speaks: *"How do I submit my digital life certificate?"*
  3. The **Pension Assistant** lists nearest biometric facilitation centers, or guides him on how to use his phone's camera for face-RD (facial recognition authentication) using the official Jeevan Pramaan app.
  4. The system sends him a direct, deep-linked SMS with instructions and official app links.

---

## 3. Multi-Agent AI & Vernacular RAG Architecture Blueprint

The intelligence layer is constructed using decoupled Specialized Agents coordinated by a dynamic Router Agent, reading from a secure Vector database and leveraging national translation APIs.

```
                                  +──────────────────────────+
                                  │   User Input Query       │
                                  +─────────────┬────────────+
                                                │
                                                ▼
                                  +──────────────────────────+
                                  │   Bhashini Translation   │
                                  │   (Speech/Text to Eng)   │
                                  +─────────────┬────────────+
                                                │
                                                ▼
                                  +──────────────────────────+
                                  │      Router Agent        │
                                  +──────┬──────┬──────┬─────+
                                         │      │      │
                 ┌───────────────────────┘      │      └────────────────────────┐
                 ▼                              ▼                               ▼
  +──────────────────────────+    +──────────────────────────+    +──────────────────────────+
  │   Scheme Finder RAG      │    │  Doc Verification Agent  │    │  Calculators / Rules DB  │
  │ • Qdrant Hybrid Search   │    │ • DigiLocker Integration │    │ • GST / ITR calculations  │
  │ • Cohere Reranker        │    │ • Automated OCR Scanning │    │ • State eligibility matrix│
  +──────────────┬───────────+    +─────────────┬────────────+    +─────────────┬────────────+
                 │                              │                               │
                 └──────────────────────┐       │       ┌───────────────────────┘
                                        ▼       ▼       ▼
                                  +──────────────────────────+
                                  │   LLM Synthesis (GPT-4)  │
                                  │ (Strict Guardrail Check) │
                                  +─────────────┬────────────+
                                                │
                                                ▼
                                  +──────────────────────────+
                                  │   Bhashini TTS / Text    │
                                  │   (Eng to Local Lang)    │
                                  +──────────────────────────+
```

### 3.1. Retrieval-Augmented Generation (RAG) Engine
To maintain a 100% accurate database of government schemes:
- **Vector Database:** Qdrant cloud hosting scheme parameters, ministry circulars, and policy FAQs.
- **Embedding Generation:** OpenAI `text-embedding-3-small` for localized semantics and bilingual queries.
- **Hybrid Search Core:** Combines Dense Vector Search with Sparse BM25 Keyword Search (configured at a 70:30 fusion weight) to capture specific scheme acronyms (e.g., "PM-KISAN", "APY").
- **Semantic Reranking:** Top 20 retrieved records pass through Cohere's Multilingual Reranker (`rerank-multilingual-v2.0`) to yield the top 4 highly context-relevant matches.
- **Source Verification Layer:** A regex-based validator blocks any LLM output that attempts to mention a external hyperlink not matching a pre-approved whitelist of domains containing `.gov.in`, `.nic.in`, or `india.gov.in`.

### 3.2. Multi-Agent Orchestration Framework
- **Router Agent:** Decodes user intents, classifing queries into Welfare Schemes, Financial/Tax, Registrations, or Administrative actions.
- **Verification & OCR Agent:** Scans user-uploaded documents (like Aadhaar, Marks sheets, Income Certificates) using Tesseract-OCR / Azure Form Recognizer, sanitizing and redacting sensitive PII before metadata analysis.
- **Fulfillment Agent:** Connects with external transactional APIs (API Setu, DigiLocker) to retrieve current application statuses and push verified profiles.
- **Guardrail Agent (Llama Guard / Custom Prompts):** Scans inputs and outputs for adversarial attacks, jailbreaks, anti-national political discussions, and legal advice limits, returning safe, neutral error templates when triggered.

### 3.3. Bhashini Integration & Voice Translation Workflow
Jan Seva AI integrates with India's official Bhashini API (ULCA translation protocols):
1. **Speech-to-Text (ASR):** User audio in any of the 22 regional languages is transcribed to local script.
2. **Translation (NMT):** Transcribed local text is translated into English for optimized processing through the LLM core.
3. **Response Translation:** The English LLM output is translated back into the user's regional language text.
4. **Text-to-Speech (TTS):** The local language text is synthesized into high-quality natural audio (male/female options) and streamed back to the PWA UI.

---

## 4. Functional Requirements Specification

This section maps out the detailed specifications for all 20 modules of the platform.

### 4.1. Core AI & Welfare Modules (P0)

#### AI Chat Assistant (with Voice) [FR-AI-CHAT]
* **Description:** Multilingual conversational portal with speech-to-text and text-to-speech toggles.
* **Acceptance Criteria:**
  - Standard chat latency under 1.5 seconds for text; voice translation roundtrip under 2.5 seconds.
  - Automatic language detection based on the user's first query with a manual selection dropdown in the header.
  - Floating microphone button with active wave indicator during recording.

#### Government Scheme Finder [FR-SCHEME-FINDER]
* **Description:** Personalized recommendation matching engine based on user characteristics.
* **Acceptance Criteria:**
  - Ingests profile fields: State, Age, Income, Gender, Category (SC/ST/OBC/General), Occupation, Disability.
  - Displays a clean visual card matrix of eligible schemes showing: Title, Ministry, Direct Benefit Transfer (DBT) Amount, Document Checklist, Official Link.
  - Permits users to filter results by State, Category, and Ministry.

#### Scholarship Finder [FR-SCHOLARSHIP]
* **Description:** Dedicated discovery engine for school, post-matric, and research fellowships.
* **Acceptance Criteria:**
  - Integrates with data scraped and mapped from the National Scholarship Portal (NSP) and state portals.
  - Provides eligibility checker for student-specific parameters (academic grades, parents' income, course category).
  - Triggers alerts for application start and end deadlines.

#### Pension & Welfare Finder [FR-PENSION]
* **Description:** Helps senior citizens, widows, and unorganized workers find national security benefits (APY, PM-SYM, National Social Assistance Program).
* **Acceptance Criteria:**
  - Guides users through age-based contribution and payout projections (e.g., inputting contribution age to calculate APY pension returns).
  - Generates step-by-step guidance on how to submit digital life certificates.

---

### 4.2. Business, Taxation & Registration Modules (P1)

#### Business Registration Assistant [FR-BUSINESS-REG]
* **Description:** Step-by-step scaffolding for company incorporations (Proprietorship, LLP, Private Limited).
* **Acceptance Criteria:**
  - Interactive questionnaire that outputs a custom checklist based on entity choice (e.g., Spice+ form requirements, Director Identification Number - DIN).
  - Explains the difference in compliance overhead, initial setup fees, and taxation between different business types.

#### GST Assistant [FR-GST]
* **Description:** Guide for Goods and Services Tax registration, HSN/SAC code discovery, and filing structure.
* **Acceptance Criteria:**
  - Interactive search bar to find matching GST HSN codes and respective tax percentages for any product or service keyword.
  - Custom dynamic quiz to evaluate if a business needs to register (based on state aggregate turnover threshold: ₹20L/₹40L).
  - Clear explanations of standard monthly GSTR filings (GSTR-1, GSTR-3B).

#### Income Tax Assistant [FR-TAX]
* **Description:** Tax planning calculator that compares New vs. Old Tax Slabs and recommends deductions.
* **Acceptance Criteria:**
  - High-fidelity visual calculator with input fields for salary, HRA, 80C, 80D deductions.
  - Recommends customized tax-saving financial instruments (PPF, National Pension Scheme, ELSS) depending on user profile.
  - Clearly points users to the official e-filing portal for submission.

#### MSME & Startup Assistant [FR-MSME-STARTUP]
* **Description:** Onboarding guide for Udyam Registration, Startup India Recognition, and Mudra loans.
* **Acceptance Criteria:**
  - Details MSME classification metrics (Investment & Turnover).
  - Explains dynamic tax benefits (such as section 80-IAC tax holiday for startups) and guides users through the online pitch submission format.

#### Passport Assistant [FR-PASSPORT]
* **Description:** Guides users through passport issuance, renewal under normal/tatkaal, and document validations.
* **Acceptance Criteria:**
  - Generates custom checklist based on user scenarios (e.g., minor passport, name change, address change).
  - Integrates a geolocation tracker pointing users to their nearest Post Office Passport Seva Kendra (POPSK) or Passport Seva Kendra (PSK).

#### PAN Assistant [FR-PAN]
* **Description:** Assistance for applying for a new PAN card or correcting existing details.
* **Acceptance Criteria:**
  - Explains paperless e-PAN application using Aadhaar e-KYC.
  - Dynamic visual guide showing what counts as valid proof of identity and proof of address.

---

### 4.3. Dashboards, CMS & Engagement Modules (P1)

#### User Dashboard [FR-USER-DASHBOARD]
* **Description:** Personal portal containing profile data, saved schemes, application logs, and linked document storage.
* **Acceptance Criteria:**
  - Secure login with mobile OTP or e-Pramaan.
  - Visual status timeline tracking current step progress of each saved application.
  - Integration with DigiLocker API showing linked and fetched official documents.

#### Admin Dashboard [FR-ADMIN-DASHBOARD]
* **Description:** Internal system to monitor analytics, audit compliance, update databases, and manage users.
* **Acceptance Criteria:**
  - Displays system-wide metrics: active concurrent users, API consumption logs, and LLM token costs.
  - Compliance panel detailing the audit trail: user consent logs, raw prompt inputs, and AI answers with timestamps.
  - Interface to override or flag faulty AI recommendations.

#### Content Management System (CMS) [FR-CMS]
* **Description:** Portal for content editors to update the verified database of government schemes.
* **Acceptance Criteria:**
  - Secure rich-text editor allowing admins to update eligibility criteria, dates, and official URLs.
  - Every update automatically rebuilds the corresponding Qdrant vector embedding partition.
  - Strict approval workflow requiring Maker-Checker validation prior to publishing.

#### Blog with AI-Generated SEO Content [FR-BLOG]
* **Description:** Programmatic blog system publishing highly targeted, regional-language SEO articles.
* **Acceptance Criteria:**
  - Automatic generation of draft blog posts on new government policies based on parsed `.gov.in` press releases.
  - Inclusion of JSON-LD Schema (Article & FAQ structured data) for high Google Search rankings.
  - Automatic translation of generated blogs into Hindi and other selected regional languages.

#### Notifications [FR-NOTIFICATIONS]
* **Description:** Omnichannel alert system notifying users of application updates and new matching schemes.
* **Acceptance Criteria:**
  - Priority dispatch channels: WhatsApp Business API, SMS via National NIC Gateway, and browser Web Push.
  - Alerts are translated into the user's selected profile language automatically.

#### Analytics [FR-ANALYTICS]
* **Description:** Privacy-preserving, custom user telemetry tracking.
* **Acceptance Criteria:**
  - Tracks user conversion funnels (from scheme landing to official link click).
  - No PII is ever passed to analytics dashboards (e.g., names, Aadhaar, PAN are dynamically masked at client-side).
  - Visual heatmaps showing which states and languages exhibit high activity.

---

### 4.4. Commercial & Marketplace Modules (P2)

#### Referral System [FR-REFERRAL]
* **Description:** Peer-to-peer sharing ecosystem incentivizing community leaders to assist others.
* **Acceptance Criteria:**
  - Generates unique referral links.
  - Implements a leader-board and gamified point system redeemable for premium membership months or physical tech accessories.

#### Premium Membership [FR-PREMIUM]
* **Description:** Premium tier (Jan Seva Gold) processing and multi-profile tracking.
* **Acceptance Criteria:**
  - Integrates with Razorpay for secure payments (UPI, Card, NetBanking).
  - Permits active storage of up to 8 independent sub-profiles with scheduled weekly match runs.

#### Consultancy Booking [FR-CONSULTANCY]
* **Description:** Secured virtual video-consultation room booking platform with verified experts.
* **Acceptance Criteria:**
  - Search and filter module for experts based on rating, location, specialty, and pricing.
  - Integration with calendar booking, Razorpay Escrow payments, and built-in encrypted WebRTC video streaming.

#### Affiliate Marketplace [FR-MARKETPLACE]
* **Description:** Directory connecting citizens with nearby physical Common Service Centers (CSCs) and VLEs.
* **Acceptance Criteria:**
  - Interactive map finding nearby physical shops verified by our platform.
  - Enables CSC agents to register as premium physical help partners.

---

## 5. Non-Functional Requirements (NFRs)

### 5.1. Performance & Latency
* **Real-time API Latencies:** Bhashini translations must complete under 1,000ms. Standard non-streaming LLM search responses must deliver within 1,500ms.
* **Core Web Vitals:** Page loading time (Largest Contentful Paint - LCP) under 1.8 seconds on 4G/5G connections. First Input Delay (FID) under 100ms. Cumulative Layout Shift (CLS) under 0.1.
* **Offline Resiliency:** Progressive Web App (PWA) must allow offline rendering of the core user dashboard and cached scheme lists using Workbox Service Worker caching.

### 5.2. Security, Compliance, & Privacy
* **Sovereignty & Localization:** 100% of the platform database, backups, and execution servers must reside in the Azure/AWS India Central regions.
* **PII Sanitization:** The gateway layer must run regex scans to intercept and mask credit cards, standard password inputs, and 12-digit Aadhaar sequences in LLM prompt payloads.
* **Rate Limiting:** Enforce a strict sliding window limit of 60 requests/minute per authenticated user and 15 requests/minute for unauthenticated chat endpoints to prevent API resource exhaustion.
* **Logging Compliance:** High-security audit tables in PostgreSQL capturing all system-level and transactional events, protected by restricted, write-only database roles to meet SOC-2 compliance.

### 5.3. Accessibility (GIGW 3.0 & WCAG 2.2 AA)
* **Visual Adaptability:** Screen layout must preserve high accessibility with contrast ratios of 4.5:1 (minimum) and 7:1 (for high-contrast configurations).
* **Keyboard-Only Traversal:** Dynamic keyboard focus management. Focus ring indicator must have a contrast of at least 3:1 against background colors.
* **Bilingual UI Consistency:** Ensure toggling from English to any other language translates 100% of buttons, aria-labels, and static content panels without formatting breakages.

---

## 6. Information Architecture & User Flow

This user flow maps out a citizen's detailed traversal through Jan Seva AI:

```
[ Landing Page ] 
      │ (Language Toggle: Eng, Hindi, Tamil...)
      ▼
[ Consent Manager Banner ] ─────────► [Declined] ──> Exit
      │ (Affirmative Opt-in)
      ▼
[ AI Chat Console ] ◄─────────────────────────────────────────────┐
      │                                                           │
      │ ──► Search Welfare Scheme ──► [ RAG Vector DB Search ]    │
      │                                           │               │
      │                                           ▼               │
      │                               [ Match Result Cards ] ───► │
      │                                           │               │
      │                                           ▼ (Apply)       │
      │                                [ Document Checklist ]     │
      │                                           │ (Save)        │
      │                                           ▼               │
      ├──────────────────────────────► [ Citizen Dashboard ] ─────┤
      │                                           │               │
      │ ──► Tax Planning & Calculators ───────────┼───────────────┤
      │ ──► Register Business / GST ──────────────┼───────────────┘
      │                                           │
      ▼ (Needs Expert Help)                       ▼
[ Consultancy Booking Portal ] ◄────────── [ Link DigiLocker ]
```

### 6.1. Action Progression Table
The following table outlines the step-by-step user interaction flow from landing on the portal to application handoff:

| Step | Action Taken by User | System Processing / Agent Action | Resulting UI state / View |
| :--- | :--- | :--- | :--- |
| **1** | Enters Website. Selects Hindi language. | Detects browser language, sets i18n configurations. Loads local resources. | Multilingual Landing Page is displayed in Hindi. |
| **2** | Taps "Start Consultation" button. | Renders Consent Manager pop-up detailing DPDP rights. | Hindi Consent Modal overlay with explicit Opt-in button. |
| **3** | Accepts Consent Option. | Log consent timestamp and user session hash. Instantiates session. | Chat Workspace Console active, ready for voice/text input. |
| **4** | Inputs: *"Under 12th scholarship options."* | **Router Agent** classifies query. **RAG Pipeline** queries National Scholarship database in Qdrant. | Loading spinner. Real-time streaming results appear in cards. |
| **5** | Clicks on "PM Scholarship Scheme". | Extracts scheme prerequisites and generates tailored checklist. | Details pane pops out showing Benefits, Criteria, Links. |
| **6** | Selects "Verify my Eligibility". | Interacts with user to collect details (GPA, Income, Category). | Dynamic forms rendering input fields with voice help. |
| **7** | Clicks "Fetch from DigiLocker". | Triggers e-Pramaan OAuth handshake. Requests academic records. | Secure DigiLocker Portal authorization redirection. |
| **8** | Completes OTP authentication. | **Verification Agent** extracts XML/PDF, confirms eligibility. | Dashboard updates showing "100% Eligible" with Green badge. |
| **9** | Clicks "Proceed to Portal". | Registers referral, logs redirection event, forwards to official link. | Triggers high-trust external warning, opens `.gov.in` in new tab. |

---

## 7. Comprehensive Database Schema

A production-ready database schema designed using standard **Prisma ORM** models, mapped to PostgreSQL:

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

model User {
  id               String           @id @default(uuid())
  mobileNumber     String           @unique
  email            String?          @unique
  fullName         String
  role             Role             @default(USER)
  languagePreference String         @default("en")
  isConsentGiven   Boolean          @default(false)
  consentTimestamp DateTime?
  subscriptionTier SubscriptionTier @default(FREE)
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt

  // Profile metadata for Scheme matching
  profile          UserProfile?
  conversations    Conversation[]
  savedSchemes     UserSavedScheme[]
  applications     ApplicationTrack[]
  bookingsAsUser   ConsultancyBooking[] @relation("UserBookings")
  bookingsAsExpert ConsultancyBooking[] @relation("ExpertBookings")
  referralsSent    Referral[]           @relation("Referrer")
  referralsReceived Referral?           @relation("Referee")
}

model UserProfile {
  id             String    @id @default(uuid())
  userId         String    @unique
  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  age            Int
  state          String
  annualIncome   Float
  gender         String
  category       String    // GENERAL, SC, ST, OBC
  occupation     String
  isStudent      Boolean   @default(false)
  isDisable      Boolean   @default(false)
  hasBusiness    Boolean   @default(false)
}

model Scheme {
  id             String          @id @default(uuid())
  name           String
  description    String
  category       SchemeCategory
  ministry       String
  stateScope     String          // "CENTRAL" or specific state name e.g. "KARNATAKA"
  eligibilityRules Json          // Structured rule limits e.g. { ageMax: 60, incomeMax: 200000 }
  documentChecklist String[]     // List of required document names e.g. ["Aadhaar", "Income Certificate"]
  officialUrl    String          // Must be .gov.in/ .nic.in
  dbtAmount      Float?          // Expected direct financial assistance if any
  isActive       Boolean         @default(true)
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  savedByUsers   UserSavedScheme[]
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

model Conversation {
  id             String          @id @default(uuid())
  userId         String
  user           User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  languageUsed   String          @default("en")
  createdAt      DateTime        @default(now())
  messages       Message[]
}

model Message {
  id             String          @id @default(uuid())
  conversationId String
  conversation   Conversation    @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  role           String          // "SYSTEM", "USER", "ASSISTANT", "TOOL"
  content        String
  toolCalls      Json?           // JSON describing external functions called
  citations      String[]        // Verified official .gov.in reference links
  createdAt      DateTime        @default(now())
}

model ApplicationTrack {
  id             String          @id @default(uuid())
  userId         String
  user           User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  schemeName     String
  portalName     String          // Name of official target portal
  status         TrackStatus     @default(PENDING)
  notes          String?
  updatedAt      DateTime        @updatedAt
  createdAt      DateTime        @default(now())
}

model ConsultancyBooking {
  id             String          @id @default(uuid())
  userId         String
  user           User            @relation("UserBookings", fields: [userId], references: [id], onDelete: Cascade)
  expertId       String
  expert         User            @relation("ExpertBookings", fields: [expertId], references: [id], onDelete: Cascade)
  bookingDate    DateTime
  status         BookingStatus   @default(PENDING)
  paymentId      String?         // Razorpay Payment Session ID
  amountPaid     Float
  meetingLink    String?         // Encrypted room url
  createdAt      DateTime        @default(now())
}

model Referral {
  id             String          @id @default(uuid())
  referrerId     String
  referrer       User            @relation("Referrer", fields: [referrerId], references: [id], onDelete: Cascade)
  refereeId      String          @unique
  referee        User            @relation("Referee", fields: [refereeId], references: [id], onDelete: Cascade)
  status         String          // PENDING, COMPLETED, EXPIRED
  pointsAwarded  Int             @default(0)
  createdAt      DateTime        @default(now())
}
```

---

## 8. Core API Specifications & Integration Contracts

### 8.1. Jan Seva AI API Endpoints (REST Specifications)

#### 1. Ingest Consent Agreement
* **Endpoint:** `POST /api/v1/users/consent`
* **Request Payload:**
```json
{
  "mobileNumber": "+919876543210",
  "fullName": "Rajesh Gowda",
  "languagePreference": "kn",
  "isConsentGiven": true,
  "consentNoticeText": "By proceeding, you agree to allow Jan Seva AI to temporarily process documents via secure APIs to determine welfare eligibility under DPDP Act rules."
}
```
* **Response Output (201 Created):**
```json
{
  "status": "SUCCESS",
  "userId": "usr_902e-bc62-421f",
  "consentToken": "cns_8829aefb20c93021",
  "message": "Consent logged and stored in high-security audit tables."
}
```

#### 2. Execute Conversational Search & Scheme RAG
* **Endpoint:** `POST /api/v1/ai/chat`
* **Headers:** `Authorization: Bearer <jwt_token>`
* **Request Payload:**
```json
{
  "conversationId": "conv_aa92-41df",
  "userQuery": "Under 12th scholarship for OBC in Karnataka",
  "voiceSession": false
}
```
* **Response Output (200 OK):**
```json
{
  "conversationId": "conv_aa92-41df",
  "detectedLanguage": "en",
  "intentMatched": "SCHEME_DISCOVERY",
  "assistantResponse": "I found 2 scholarships matched specifically to your academic profile and category in Karnataka. You must present an OBC Caste certificate and income proof.",
  "results": [
    {
      "schemeId": "sch_1a2b-3c4d",
      "name": "Post-Matric Scholarship for OBC Students, Karnataka",
      "ministry": "Social Welfare Department, Govt of Karnataka",
      "dbtAmount": 12000.00,
      "documentChecklist": ["Aadhaar", "Caste Certificate", "Income Certificate", "SSLC Marks Sheet"],
      "officialUrl": "https://ssp.postmatric.karnataka.gov.in"
    }
  ],
  "citations": ["https://ssp.postmatric.karnataka.gov.in/policy_circular_2023.pdf"]
}
```

---

### 8.2. Third-Party Integration Frameworks

#### 1. Bhashini National Language API Integration (MeitY)
* **API Host:** `https://meity.bhashini.gov.in/ulca/apis/v1`
* **Integration Rule:** User voice payloads received via client-side WebRTC microphones are compressed to highly efficient `.ogg` audio formats, then piped to the ASR (Automatic Speech Recognition) Bhashini pipeline.
* **Payload Structure:**
```json
{
  "pipelineTasks": [
    { "taskType": "asr", "config": { "language": { "sourceLanguage": "hi" } } },
    { "taskType": "translation", "config": { "language": { "sourceLanguage": "hi", "targetLanguage": "en" } } }
  ],
  "inputData": { "audio": [ { "audioContent": "BASE64_STREAMING_AUDIO_BYTES" } ] }
}
```

#### 2. DigiLocker OAuth & Document Fetch Execution
* **API Host:** `https://api.digitallocker.gov.in/public/oauth2/1/token`
* **Workflow Contract:**
  1. The UI redirects users to DigiLocker SSO requesting permission scope: `read:aadhaar`, `read:caste_certificate`.
  2. Following authorization, Jan Seva retrieves the authorized bearer token.
  3. Executes backend request to retrieve the encrypted PDF/XML schema representation of the user's certificates directly from e-Pramaan gateways.

---

## 9. Product Roadmap & Phased Development Timeline

To ensure systematic deployment, Jan Seva AI leverages a three-phase execution plan:

```
+───────────────────────────────────────────────────────────────────────────────────+
|                               PHASED ROADMAP MATRIX                               |
+───────────────────────────────────────────────────────────────────────────────────+
| Phase 1: MVP Deployment (Months 1–4)                                              |
|  - Focus: Foundation, core conversational voice RAG in English, Hindi, and Tamil.   |
|  - Scope: Government Scheme Finder, user dashboard, DigiLocker integration,       |
|    GIGW 3.0 accessibility standard, and basic admin panel.                        |
+───────────────────────────────────────────────────────────────────────────────────+
| Phase 2: Scale-Up & Business Suites (Months 5–8)                                  |
|  - Focus: Tax and company formation assistance, launching remaining 19 languages.  |
|  - Scope: GST Assistant, PAN/Passport helpers, programmatic SEO CMS, Premium Gold   |
|    Membership setup, and Live CA Consultancy Bookings.                            |
+───────────────────────────────────────────────────────────────────────────────────+
| Phase 3: Transactional Automation & Agents (Months 9–12)                         |
|  - Focus: Autonomous e-governance filing integration and physical hub marketplaces. |
|  - Scope: Direct write operations through API Setu partners, multi-agent automated |
|    form filling, physical Common Service Center (CSC) partner map.                |
+───────────────────────────────────────────────────────────────────────────────────+
```

### 9.1. Key Milestones & Gatekeepers
* **Milestone 1 (Month 2):** Secure preliminary VAPT (Vulnerability Assessment & Penetration Testing) clearance from a CERT-In impaneled security expert to begin private beta trials with 5,000 citizens.
* **Milestone 2 (Month 4):** Verify that Bhashini audio translation lag falls below 2.5s for typical rural 4G network structures.
* **Milestone 3 (Month 6):** Complete Razorpay API compliance review for high-security ESCROW capabilities prior to starting live professional bookings.
* **Milestone 4 (Month 10):** Secure write-permission credentials with national e-Pramaan / API Setu nodes for Phase 3 automated submission modules.
