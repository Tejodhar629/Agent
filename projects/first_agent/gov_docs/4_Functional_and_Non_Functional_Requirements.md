# Jan Seva AI - Functional and Non-Functional Requirements Specification

**Document Identifier:** JS-SRS-V1.0.0  
**Classification:** Restricted (Government/Enterprise Standard)  
**Authors:** Lead Product Manager, Principal Architect, & Compliance Officer  
**Date:** October 2023  
**Status:** Approved  

---

## 1. Introduction

### 1.1 Document Purpose
This document establishes the official and complete Functional Requirements Specification (FRS) and Non-Functional Requirements Specification (NFRS) for **Jan Seva AI** (also referred to as SevaSetu AI), an AI-powered conversational e-governance platform for India. It serves as the master technical blueprint for development, quality assurance, security, and legal compliance audits.

### 1.2 Document Scope
This document specifies the complete system behavior, technical architectures, database bindings, API contracts, and compliance strategies for Jan Seva AI. It replaces any previous draft or unrelated product specifications.

---

## 2. System Scope & Product Boundary

Jan Seva AI is designed as a unified, conversational interface that abstracts the navigational and semantic complexity of central and state government portals in India.

```
+---------------------------------------------------------------------------------------------------------+
|                                      JAN SEVA AI SYSTEM BOUNDARY                                         |
|                                                                                                         |
|  +--------------------+        +─────────────────────────+        +──────────────────────────────────+  |
|  |  Citizen UI        |        |    Jan Seva AI Core     |        |    Bhashini API (ASR/NMT/TTS)    |  |
|  |  - Trimodal PWA    | <====> |   (FastAPI Backend)     | <====> |    (22 Scheduled Indian Langs)   |  |
|  |  - WhatsApp Bot    |  (WS/  |   - Multi-Agent Orchestr|        +──────────────────────────────────+  |
|  +--------------------+  HTTP) |   - RAG Query Processor |                                              |
|                                +────────────┬────────────+        +──────────────────────────────────+  |
|                                             │                     |    National Portal Integrations  |  |
|                                             ▼                     |    - DigiLocker (e-Pramaan Auth) |  |
|                                +─────────────────────────+ <====> |    - API Setu / GST / UIDAI Vault|  |
|                                | Postgres / Redis Cache  |        +──────────────────────────────────+  |
|                                | Qdrant Vector DB        |                                              |
|                                +-------------------------+                                              |
+---------------------------------------------------------------------------------------------------------+
```

### 2.1 In-Scope Platform Core Capabilities
1. **Trimodal User Interface:** A responsive PWA that hot-swaps between: (a) Voice HUD (Pulsating mic), (b) Chat Workspace (conversational style with file uploads), and (c) Accessibility Wizard (one question per screen, AAA standard).
2. **Vernacular RAG Engine:** Hybrid dense-sparse search and Cohere-based multilingual reranking grounded *strictly* on verified `.gov.in` policy documents, blocking non-whitelisted domains.
3. **Multi-Agent Orchestration Framework:** Decoupled Specialized Agents (Router, Verification, OCR, Fulfillment, Guardrails) handling classification, document reading, API lookups, and security checks.
4. **Bhashini ULCA Translation Pipeline:** Ingesting audio or text in 22 regional languages, converting to English for optimized LLM processing, translating responses back, and streaming audio.
5. **Secure Indian Regulatory Integrations:** Unified consent manager compliant with DPDP Act 2023, Aadhaar Vault masking, and official DigiLocker OAuth retrieval.

### 2.2 Out-of-Scope Capabilities
1. **Direct Transaction Processing Outside Government APIs:** Jan Seva AI does not host payments for taxes or application fees. It coordinates payment through Razorpay for local escrow consulting or redirects users to official `.gov.in` portals for tax filing and application submission.
2. **Proprietary LLM Base Training:** The system utilizes existing foundation models (e.g. GPT-4, Claude 3.5 Sonnet, Llama-3-70B-Instruct) via secure enterprise endpoints, applying custom RAG and prompt engineering. It does not train basic foundational weights.

---

## 3. Functional Requirements (FR) Matrix & Deep Dive

This section details all 20 modules of Jan Seva AI across their priority levels, inputs, processing logic, outputs, and technical schemas.

---

### 3.1. Category 1: Core AI & Welfare Modules (P0)

#### FR-1.1: AI Chat Assistant (with Voice) [FR-AI-CHAT]
* **Description:** Multilingual conversational workspace allowing text and voice interaction in 22 scheduled Indian languages, powered by Bhashini APIs.
* **Inputs:** Spoken audio stream (OGG/WebM format) or text query; user's `languagePreference` parameter.
* **Processing Logic:**
  1. If input is audio, route payload to MeitY's **Bhashini ASR (Speech-to-Text)** endpoint. Retain transcription script.
  2. Map detected script against the Bhashini translation module, converting regional text to English.
  3. Send translated English query to **Router Agent** for classification.
  4. Once response is synthesized, route English output to Bhashini translation, generating local language script.
  5. Route translated script to **Bhashini TTS (Text-to-Speech)**, creating a high-fidelity natural voice output file.
* **Outputs:** Text message and/or audio stream returned via WebSockets to client in user's chosen language.
* **Technical Specifications:**
  - Standard text execution latency < 1.5s; voice-to-voice roundtrip latency < 2.5s on 3G/4G networks.
  - Streaming chunked audio using Socket.io audio buffering.

#### FR-1.2: Government Scheme Finder [FR-SCHEME-FINDER]
* **Description:** Dynamic scheme matching engine that maps user profile characteristics against central and state database limits.
* **Inputs:** User's profile fields: `age`, `state`, `annualIncome`, `gender`, `category` (SC/ST/OBC), `occupation`, `isStudent`, `isDisable`.
* **Processing Logic:**
  1. Read profile parameters from `UserProfile` table.
  2. Parse active schemes from `Scheme` table where `isActive = true`.
  3. Execute JSON logic validation on `Scheme.eligibilityRules` (e.g., checking if `user.age <= scheme.rules.ageMax` and `user.annualIncome <= scheme.rules.incomeMax`).
  4. Perform hybrid semantic search on Qdrant vector database for keyword overlays (using BM25 + dense search).
  5. Generate top eligible scheme list ranked by benefit amount (`dbtAmount`) and relevance.
* **Outputs:** Card matrix displaying eligible schemes, direct government links (`officialUrl`), benefit parameters, and required document checklists.
* **Technical Specifications:**
  - Schema mapping matching the Prisma `Scheme` model. Eligibility rules stored as a structured JSONB object in PostgreSQL.

#### FR-1.3: Scholarship Finder [FR-SCHOLARSHIP]
* **Description:** Specialized matching portal for state and central scholarships, synced with National Scholarship Portal (NSP) guidelines.
* **Inputs:** Student profile variables: GPA, course level (matric, post-matric, degree, research), family income, caste category.
* **Processing Logic:**
  1. Query active scholarship entries in Qdrant vector database.
  2. Filter out programs where the application deadlines have passed.
  3. Validate caste and income thresholds against state-specific norms.
  4. Build step-by-step checklist matching required certifications (such as Bonafide Certificate, Income Proof, Caste Certificate).
* **Outputs:** Matched scholarships list with deadline timers, required documents list, and pre-filled application forms.

#### FR-1.4: Pension & Welfare Finder [FR-PENSION]
* **Description:** Guidance system for senior citizens, widows, and unorganized laborers to identify pension yojana options (APY, PM-SYM, NSAP, etc.) and generate digital life certificates (Jeevan Pramaan).
* **Inputs:** Age, demographic details, occupation type (organized vs. unorganized sector).
* **Processing Logic:**
  1. If user is senior, display options for SCSS, Atal Pension Yojana (APY), and PM Shram Yogi Maan-dhan (PM-SYM).
  2. Present contribution calculations: user inputs target pension amount (e.g. ₹1000 - ₹5000) and current age; system computes exact monthly contribution required till age 60.
  3. Offer face authentication wizard pointing to Jeevan Pramaan app, including visual guidelines for camera positioning.
* **Outputs:** Interactive contribution chart, life certificate guidelines, and direct SMS deep-link to download FaceRD authentication files.

---

### 3.2. Category 2: Business, Taxation & Registration Modules (P1)

#### FR-2.1: Business Registration Assistant [FR-BUSINESS-REG]
* **Description:** Interactive guide scaffolding legal incorporation steps for Proprietary, LLP, or Private Limited companies under Ministry of Corporate Affairs (MCA) guidelines.
* **Inputs:** Business goals, number of partners, initial capital contribution.
* **Processing Logic:**
  1. Trigger dynamic multi-step quiz to recommend optimal business entity (e.g., advising LLP over Private Limited if capital is low and audit compliance must be deferred).
  2. Output step-by-step flowchart of the SPICe+ registration process on MCA.
  3. Identify required documents (PAN of directors, Aadhaar, Digital Signature Certificate - DSC, lease agreement).
* **Outputs:** Customized PDF registration blueprint, downloadable checklists, and link to MCA portal.

#### FR-2.2: GST Assistant [FR-GST]
* **Description:** Lookup utility for HSN/SAC codes, tax rates, and threshold eligibility checking.
* **Inputs:** Service or product keyword inputs; annual aggregate turnover figures.
* **Processing Logic:**
  1. Parse product keywords and query matching Harmonized System of Nomenclature (HSN) or Service Accounting Codes (SAC) databases.
  2. Run threshold checker: assess if aggregate business turnover exceeds regional threshold rules (e.g., ₹40 Lakhs for goods in standard states, ₹20 Lakhs in Special Category North-Eastern states, and ₹20 Lakhs for services).
  3. Formulate GSTR filing schedule (GSTR-1, GSTR-3B) tailored to composition vs. standard tax schemes.
* **Outputs:** HSN tax rate card (e.g. 5%, 12%, 18%, 28%), registration mandate status, and monthly calendar reminders.

#### FR-2.3: Income Tax Assistant [FR-TAX]
* **Description:** High-fidelity interactive tax calculator comparing New vs. Old tax regimes under Section 115BAC, suggesting section-wise optimizations.
* **Inputs:** Gross annual income, standard salary deductions, HRA, 80C investments, 80D medical insurances, NPS contributions.
* **Processing Logic:**
  1. Calculate taxable income under the standard Old tax slabs, applying section-wise deductions (80C capped at ₹1.5L, 80D at ₹25k, etc.).
  2. Calculate taxable income under the New tax slabs (zero deductions except standard deduction of ₹50,000).
  3. Perform comparative tax-liability check, identifying the more tax-efficient regime.
  4. Generate optimization recommendations (e.g., suggesting user invest the remaining limit under PPF or ELSS to maximize 80C).
* **Outputs:** Side-by-side comparison chart, exact tax saving calculation, and official IT e-filing redirect links.

#### FR-2.4: MSME & Startup Assistant [FR-MSME-STARTUP]
* **Description:** Step-by-step onboarding wizard for Udyam MSME Registration and Startup India Recognition.
* **Inputs:** Investment in plant & machinery, annual turnover, sector type, innovative product outline.
* **Processing Logic:**
  1. Classify MSME category (Micro: investment < ₹1cr & turnover < ₹5cr; Small: < ₹10cr & < ₹50cr; Medium: < ₹50cr & < ₹250cr).
  2. Map eligible startup incentives (including Section 80-IAC tax exemption, fast-tracked patent applications, and capital gains exemptions).
  3. Guide user through Udyam portal registration prerequisites.
* **Outputs:** Verification certificate, startup pitch checklist, and eligibility matrix for collateral-free MUDRA loans.

#### FR-2.5: Passport Assistant [FR-PASSPORT]
* **Description:** Step-by-step instruction checklist for fresh, renewal, tatkaal, and minor passport requests.
* **Inputs:** Application type, age, location postcode, required changes (address, surname).
* **Processing Logic:**
  1. Select required documents from the official passport handbook (e.g., Annexure check, Birth proof, Non-ECR qualifications).
  2. Search nearest POPSK (Post Office Passport Seva Kendra) by mapping the user's input postcode against the national directory database.
* **Outputs:** PDF checklist customized to user's age/location, and map coordinates of the nearest POPSK.

#### FR-2.6: PAN Assistant [FR-PAN]
* **Description:** Guides users through applying for a new Permanent Account Number (PAN) or correction procedures.
* **Inputs:** Aadhaar card availability, age, correction fields.
* **Processing Logic:**
  1. Check if user holds an active Aadhaar card with a matched mobile number (enabling paperless e-PAN).
  2. Display required physical proofs of identity/address if Aadhaar is unavailable.
* **Outputs:** Link to official NSDL/UTIITS e-PAN portal, and instructions to complete Aadhaar-based OTP signing.

---

### 3.3. Category 3: Dashboards, CMS & Engagement Modules (P1)

#### FR-3.1: User Dashboard [FR-USER-DASHBOARD]
* **Description:** Secure portal for citizens to manage profiles, view matched schemes, track linked documents, and review application statuses.
* **Inputs:** User authentication credentials (mobile OTP / e-Pramaan).
* **Processing Logic:**
  1. Validate incoming sessions using JWT tokens.
  2. Load user's profile and save-history from `UserSavedScheme` and `ApplicationTrack` tables.
  3. Pull authenticated credentials from DigiLocker API if connected, and map metadata to dashboard fields.
* **Outputs:** Interactive dashboard interface displaying user profile metrics, active application progress timelines, and encrypted file cabinets.

#### FR-3.2: Admin Dashboard [FR-ADMIN-DASHBOARD]
* **Description:** High-security administrative interface to monitor system metrics, audit compliance logs, manage scheme entries, and override faulty AI generations.
* **Inputs:** Admin credentials; system telemetry; query parameters.
* **Processing Logic:**
  1. Enforce Role-Based Access Control (RBAC), verifying role equals `ADMIN` or `MODERATOR`.
  2. Query database for active concurrent user sessions, average API call latency, and overall LLM token spend.
  3. Display read-only logs from high-security PostgreSQL audit tables.
  4. Provide toggle to flag, modify, or delete inaccurate scheme outputs.
* **Outputs:** Live metric widgets, audit trace panels, and system override interfaces.

#### FR-3.3: Content Management System (CMS) with Maker-Checker Flow [FR-CMS]
* **Description:** Portal for government content coordinators to add, edit, or archive scheme guidelines, enforcing strict review processes before Qdrant embedding refreshes.
* **Inputs:** Scheme description texts, eligibility criteria, and whitelisted URLs.
* **Processing Logic:**
  1. A Content Creator (Maker) creates or edits a Scheme database record. The record status is marked `DRAFT`.
  2. An Admin (Checker) reviews the draft in a dedicated verification panel.
  3. If approved, the record is marked `ACTIVE` and written to the database.
  4. The CMS triggers an asynchronous celery worker that computes text embeddings using OpenAI's embedding API and updates the Qdrant vector store partition.
* **Outputs:** Refreshed vector DB records and live website scheme updates.

#### FR-3.4: Blog with AI-Generated SEO Content [FR-BLOG]
* **Description:** Programmatic CMS that reads official PIB (Press Information Bureau) or `.gov.in` releases and generates localized SEO articles.
* **Inputs:** Official press releases; keyword targets; language requests.
* **Processing Logic:**
  1. Extract structured facts, scheme parameters, and official source links from whitelisted press releases.
  2. Synthesize detailed, informative blog articles containing JSON-LD schema markup.
  3. Translate the synthesized article into Hindi and selected regional languages.
  4. Save drafts to the blog DB for maker-checker review prior to publication.
* **Outputs:** SEO-optimized multilingual blogs with rich schema markings.

#### FR-3.5: Notifications (WhatsApp/SMS NIC Gateway) [FR-NOTIFICATIONS]
* **Description:** Dynamic alerting subsystem pushing real-time updates regarding application statuses or newly launched matching schemes.
* **Inputs:** System triggers (e.g., state change in `ApplicationTrack` or a new match found); user's preferred notification channel (SMS, WhatsApp, Email).
* **Processing Logic:**
  1. Format alert text using templates matching user's `languagePreference`.
  2. Route alert payload to official SMS Gateway (NIC standard API) or official WhatsApp Business API.
  3. Log delivery responses and retry failed notifications once with exponential backoff.
* **Outputs:** Dispatched text alerts received on citizen's mobile devices.

#### FR-3.6: Analytics (Privacy-Masked Telemetry) [FR-ANALYTICS]
* **Description:** Custom web analytics tracker measuring user traversal funnels while maintaining compliance with privacy standards.
* **Inputs:** Page clicks, language swaps, scheme detail requests, and outbound link clicks.
* **Processing Logic:**
  1. Capture user tracking events client-side.
  2. Mask and sanitize any user inputs on the client before transmission to prevent any potential PII leak (such as names, Aadhaar patterns, or phone numbers).
  3. Group data by state, language, and scheme type, writing results to analytics-only read tables.
* **Outputs:** Anonymized analytics charts and demographic heatmaps displayed in the Admin panel.

---

### 3.4. Category 4: Commercial & Marketplace Modules (P2)

#### FR-4.1: Referral System [FR-REFERRAL]
* **Description:** Gamified peer-to-peer sharing program rewarding community leaders (such as Gram Panchayat members or college representatives) who assist other citizens.
* **Inputs:** Share action triggers; referee registration completions.
* **Processing Logic:**
  1. Generate unique alphanumeric referral codes bound to the referrer's user ID.
  2. If a new user (referee) completes registration and gives consent using a referral link, update the `Referral` table state.
  3. Allocate points to both referrer and referee, displaying ranks on a regional leaderboard.
* **Outputs:** Point updates and localized referral leaderboard statistics.

#### FR-4.2: Premium Membership [FR-PREMIUM]
* **Description:** Tiered enrollment system (Jan Seva Gold) facilitating multi-profile tracking for families or consultants.
* **Inputs:** Premium selection; Razorpay payment confirmation.
* **Processing Logic:**
  1. User initiates premium purchase. Backend requests a Razorpay transaction token.
  2. Process secure callback from Razorpay API. Verify signature validity.
  3. Update `User.subscriptionTier` to `GOLD_MONTHLY` or `GOLD_ANNUAL`.
  4. Unlock additional sub-profile slots (up to 8 family members) in the database.
* **Outputs:** Premium access activation, receipt generation, and expanded profile configurations.

#### FR-4.3: Consultancy Booking [FR-CONSULTANCY]
* **Description:** High-security expert booking marketplace connecting citizens with verified CAs, lawyers, or pension experts.
* **Inputs:** Category filters (tax, legal, crop yojana); calendar date selections; Razorpay Escrow payments.
* **Processing Logic:**
  1. Display expert availability based on calendar slots.
  2. Hold consultation fees in an escrow account until the meeting is complete.
  3. Instatiate an encrypted WebRTC video consultation room link.
  4. Release funds to the expert's verified bank account upon confirmation of meeting completion (or within 24 hours of scheduled meeting time if no dispute is raised).
* **Outputs:** Confirmed calendar events, WebRTC session tokens, and transaction invoices.

#### FR-4.4: Affiliate Marketplace (CSC Locator) [FR-MARKETPLACE]
* **Description:** Geolocation directory linking online users with nearest physical Common Service Centers (CSCs) and Village Level Entrepreneurs (VLEs).
* **Inputs:** User's zip code, geolocation coordinates.
* **Processing Logic:**
  1. Pull nearby CSC coordinators using a spatial geospatial query inside the PostgreSQL database.
  2. Allow CSC centers to register on Jan Seva AI, paying a platform referral fee to handle manual verification tasks for nearby citizens.
* **Outputs:** Interactive map view, address details, and contact coordinates of verified local CSC hubs.

---

## 4. Indian Regulatory Compliance & Privacy Framework

Jan Seva AI is engineered to meet strict compliance standards matching Indian cybersecurity, financial, and digital privacy regulations.

```
+---------------------------------------------------------------------------------------------------------+
|                                    COMPLIANCE & GUARDRAIL STRUCTURE                                      |
|                                                                                                         |
|    +-------------------------+      +-----------------------------+      +-------------------------+    |
|    |      DPDP Act 2023      |      |          GIGW 3.0           |      |   UIDAI Regulations     |    |
|    |                         |      |                             |      |                         |    |
|    | - Multilingual Consent  |      | - WCAG 2.2 AA Accessibility |      | - Aadhaar Vault         |    |
|    | - Right to Erasure      |      | - Dual-Language UI Sync     |      | - Automated 8-Digit PDF |    |
|    | - Local Data Residency  |      | - Keyboard-only Nav Focus   |      |   Masking (regex/OCR)   |    |
|    +-------------------------+      +-----------------------------+      +-------------------------+    |
+---------------------------------------------------------------------------------------------------------+
```

### 4.1. Digital Personal Data Protection (DPDP) Act 2023 Compliance
* **Multilingual Consent Manager:** Prior to processing any citizen data, the application presents a clear, unambiguous consent notice translated into the user's selected language. Users must take an explicit, affirmative action (clicking "I Agree") to opt-in.
* **Data Minimization & Erasure:** The system stores only necessary profile fields (`UserProfile` model) and implements an absolute "Right to Erasure." Users can click "Delete My Account" in their dashboard, which triggers a cascading delete purging all profile fields, conversation history, and uploaded files within 48 hours.
* **Strict Sovereign Residency:** All primary databases, vector systems, Redis caches, and backups are hosted in AWS/Azure datacenters physically located within the sovereign borders of India (Mumbai/Pune/Hyderabad regions). No data is ever exported or processed internationally.

### 4.2. Guidelines for Indian Government Websites (GIGW 3.0)
* **WCAG 2.2 AA Web Accessibility:** All user interface pages support screen readers (ARIA landmark roles), keyboard-only focus navigation, and visual contrast ratios of at least 4.5:1.
* **Visual Adaptability:** The Trimodal UX structure allows users with low literacy or senior citizens to scale text up to 200% and swap to a dedicated 7:1 High-Contrast layout mode (Dark Navy/Green/White) without UI fragmentation.
* **Dynamic Bilingual Alignment:** Swapping languages instantly translates 100% of the active page interface (including form field placeholders, tooltips, and buttons) without breaking the responsive grid layout.

### 4.3. UIDAI & Aadhaar Regulations
* **Aadhaar Vault Integration:** Raw Aadhaar numbers are never stored in plain-text databases. If a user inputs their Aadhaar, the system writes it to a secure, separate HSM (Hardware Security Module) Aadhaar Vault, retrieving a randomized token for transaction processing.
* **Automated 8-Digit Masking:** When a user uploads a PDF or image of their Aadhaar card, the **Verification & OCR Agent** intercepts the file, runs a regex scan, and applies a black mask overlay hiding the first 8 digits before saving the image to disk or transferring the file.
* **OTP Sign-offs:** Biometric integrations run strictly on UIDAI's FaceRD or sandboxed Aadhaar e-KYC gateways, securing transmissions via TLS 1.3 encryption.

---

## 5. Non-Functional Requirements (NFR) Deep Dive

### 5.1. Performance & Latency (NFR-1)
* **NFR-1.1: Live WebSocket Latency:** Real-time log streams of active agent reasoning steps must render in the UI with a latency under 200ms using native WebSocket connections.
* **NFR-1.2: Page Speed Index:** Main dashboard page load speed must remain under 1.8s for LCP (Largest Contentful Paint) on standard 3G/4G connections.
* **NFR-1.3: Concurrency Throughput:** The backend API must handle up to 10,000 active concurrent WebSocket chat connections using async FastAPI handlers and Redis Pub/Sub backplanes without performance degradation.

### 5.2. Security & Compliance (NFR-2)
* **NFR-2.1: AST and PII Redaction:** The LLM gateway layer must run pre-execution AST (Abstract Syntax Tree) checks and real-time regex scanning to redact Credit Cards, Aadhaar patterns, or PAN cards before routing payloads to external LLM providers.
* **NFR-2.2: Ephemeral OCR Processing:** Document photos parsed by the OCR engine are processed inside RAM memory and immediately wiped from local disks following verification.
* **NFR-2.3: SOC-2 Compliant Logging:** Every transaction, user consent click, and administrative update is logged inside write-only, encrypted PostgreSQL audit tables with strict user permission roles preventing log alteration or deletion.

### 5.3. Reliability, Resilience & Scaling (NFR-3)
* **NFR-3.1: Stateful Recovery:** Session-level user conversations and form statuses must survive backend crashes. If a connection drops, the platform reads state from PostgreSQL, allowing users to resume instantly.
* **NFR-3.2: Database Multi-AZ Replication:** Ensure PostgreSQL databases operate with active Multi-AZ replication to meet a 99.99% system availability SLA.
* **NFR-3.3: Dynamic Failover Routing:** The LLM Gateway must use circuit-breaker patterns. If the primary API provider (e.g., OpenAI) returns consecutive 5xx errors, route queries to alternative models (e.g., Claude via Bedrock) within 3 seconds, notifying administrators.

### 5.4. Localized Multilingual Capabilities (NFR-4)
* **NFR-4.1: Unicode Support:** The system enforces strict UTF-8 Unicode character encoding across the entire data pipeline (including filesystems, database records, Redis queues, and WebSocket outputs).
* **NFR-4.2: Colloquial Dialect Handling:** The translation and semantic search pipelines must handle conversational code-switching (e.g. Hinglish, Kanglish, Tanglish) and map regional terms (such as *' RTC'*, *'Khasra'*, *'Nuksaan'*) to their respective formal equivalents without throwing processing errors.
* **NFR-4.3: Regional Formatting:** All timestamps, currency symbols (₹), and financial metrics must adapt to the user's selected regional locale (using `Intl.NumberFormat` with Indian numbering system conventions, e.g., lakhs and crores).

---

## 6. Tech Stack & Infrastructure Mapping

The specifications defined in this document are mapped to the following production-ready tech stack and hosting architectures:

| Module / Requirement | Technology Stack | Deployment Component |
| :--- | :--- | :--- |
| **Frontend UI** | React.js / Next.js (App Router) + Tailwind CSS | AWS Amplify / Vercel Edge Networks |
| **Bhashini Integrations** | MeitY Bhashini SDK + WebRTC audio | API Gateway Proxy to MeitY endpoints |
| **Backend Core** | FastAPI (Python 3.11) | AWS EKS (Kubernetes Pods) |
| **Orchestration Workflow** | Temporal.io Workflow SDK | Temporal Cloud or EKS Temporal workers |
| **Relational Database** | PostgreSQL Serverless (Aurora) | AWS RDS Aurora Multi-AZ |
| **Caching & Pub/Sub** | Redis Cluster | AWS ElastiCache |
| **Semantic Vector Store**| Qdrant Cloud | Secure, isolated Qdrant nodes |
| **Document OCR Engine** | Tesseract OCR / Azure Form Recognizer | Ephemeral worker pods |
| **Payment Gateways** | Razorpay Standard API | Razorpay secure Webhooks |

---
*End of Functional and Non-Functional Requirements Specification.*
