# BUSINESS REQUIREMENT DOCUMENT (BRD)
## Project "Jan Seva AI" (AI-Powered Government Services Platform for India)

**Document Version:** 1.0.0  
**Status:** Approved / Production-Ready  
**Date:** October 2023  
**Authors:** Lead Product Manager & Chief Strategy Officer  
**Classification:** Restricted (Internal / Partner Agencies)

---

## 1. Executive Summary & Vision Statement

### 1.1. Context & Problem Statement
India has over 1.4 billion citizens and a massive, complex network of public services, welfare schemes, registrations, and regulatory requirements spanning across 28 states and 8 union territories. While the Government of India has driven extensive digitization through initiatives like Digital India, India Stack, UPI, and API Setu, a critical "last-mile" accessibility gap persists:
- **Navigational Complexity:** Citizens are forced to navigate hundreds of fragmented central and state portals, each with disparate user interfaces and complex terminology.
- **Vernacular Language Barrier:** Over 90% of India's population does not speak English as their primary language, whereas a significant portion of official portals and legal jargon remains English-centric.
- **Information Asymmetry:** Millions of eligible citizens remain unaware of government welfare schemes (such as PM-KISAN, PM-SYM, or post-matric scholarships) due to a lack of personalized, plain-language discovery.
- **Administrative Red Tape:** Applying for passports, PAN cards, GST numbers, or MSME registrations involves extensive documentation and complex steps, often leading to citizen reliance on middlemen who charge exorbitant, unregulated fees.

### 1.2. Strategic Product Vision
**Jan Seva AI** is an enterprise-scale, AI-powered conversational SaaS platform designed to democratize access to Indian government services and schemes. By utilizing state-of-the-art **Retrieval-Augmented Generation (RAG)**, secure **multi-agent orchestration**, and local-language voice synthesis via **Bhashini API**, Jan Seva AI acts as a trusted, multilingual personal guide. 

The platform translates highly complex policy documents, tax codes, and eligibility forms into natural, intuitive dialogue in the user's native tongue. It guides users through eligibility screening, documents collection, and application filing, while strictly recommending and linking to **official government (.gov.in)** sources.

### 1.3. Value Proposition
* **For Citizens (Rural & Urban):** Instantly discover eligible central and state schemes in regional languages via voice or text, reducing application errors and saving hours of administrative confusion.
* **For Micro, Small, and Medium Enterprises (MSMEs) & Startups:** Seamless, jargon-free onboarding for GST, Udyam registration, Startup India benefits, and state-level tax filings.
* **For the Digital India Ecosystem:** Complements existing public infrastructure (DigiLocker, Aadhaar, API Setu) by overlaying an intelligent conversational UX, drastically boosting welfare program penetration and tax compliance.

---

## 2. Strategic Business Objectives & Key Performance Indicators (KPIs)

To validate the platform's commercial viability and social impact, Jan Seva AI aligns its growth across specific business objectives and corresponding North Star metrics.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 NORTH STAR METRIC                                      │
│                            Assisted Task Completion Rate                               │
│           (Successfully matched, verified, and directed applications to official portals)│
└───────────────────────────────────────┬────────────────────────────────────────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│  Citizen Inclusivity │    │ Operational Velocity │    │ Commercial Scalability│
│  • 10M Vernacular MAU│    │ • Avg search < 1.5s  │    │ • $12M ARR in Year 2 │
│  • Voice-first UI %  │    │ • Loop rate < 2%     │    │ • Partner Commissions│
└──────────────────────┘    └──────────────────────┘    └──────────────────────┘
```

### 2.1. Strategic Business Goals
1. **Universal Inclusivity:** Enable non-English speaking, low-literacy citizens to access high-quality government guidance via natural voice input.
2. **Strict Reliability & Accuracy:** Zero-tolerance policy for LLM hallucinations. The platform must only retrieve, summarize, and cite verified government documents (`.gov.in` domains) and official circulars.
3. **Frictionless Compliance & Onboarding:** Minimize drop-offs in critical registrations (GST, PAN, MSME, Passport) by providing personalized checklist pre-audits and step-by-step guidance.
4. **Self-Sustaining Monetization:** Balance social impact with commercial profitability via a premium tier, consultancy booking, and an affiliate marketplace, avoiding government-dependency for operational cash flow.

### 2.2. Key Performance Indicators (KPIs)

| KPI Category | Metric Name | Definition | Target (Y1) | Target (Y2) |
| :--- | :--- | :--- | :--- | :--- |
| **Growth & Engagement** | Monthly Active Users (MAU) | Unique active users interacting with the platform per month. | 2,000,000 | 10,000,000 |
| **Vernacular Reach** | Regional Language Share | Percentage of sessions conducted in languages other than English (e.g., Hindi, Tamil, Marathi, Bengali). | > 65% | > 80% |
| **Platform Accuracy** | Verified Referral Rate | Percentage of external clicks leading to a successful, correct official `.gov.in` landing page. | 100% | 100% |
| **System Reliability** | LLM Hallucination Rate | Monitored through daily semantic auditing, identifying any instances of non-existent schemes or wrong eligibility facts. | < 0.1% | < 0.01% |
| **Operational Velocity**| Average Session Time-to-Match| Time taken from first interaction to generating a verified scheme eligibility report with checklist. | < 2 minutes | < 1 minute |
| **Financial Viability** | Annual Recurring Revenue (ARR) | Revenue generated from Premium subscriptions, Expert consultations, and CSC marketplace affiliate fees. | $2.5M | $12.0M |
| **Customer Satisfaction**| Net Promoter Score (NPS) | User satisfaction score calculated across vernacular voice surveys. | > 75 | > 82 |

---

## 3. Target Audience & Stakeholder Analysis

The Indian digital ecosystem comprises highly diverse user cohorts with disparate technical capabilities, literacy levels, and accessibility needs.

```
       ┌─────────────────────────────────────────────────────────────┐
       │                CITIZENS (RURAL & URBAN)                     │
       │  • Mobile-first, vernacular speakers                        │
       │  • Low digital literacy, high welfare dependency             │
       └──────────────────────────────┬──────────────────────────────┘
                                      │
                                      ▼
       ┌─────────────────────────────────────────────────────────────┐
       │                  BUSINESS COHORT (MSMEs)                    │
       │  • Need GST, PAN, Udyam, & Tax consultation                 │
       │  • Seeking formal credit and startup grants                 │
       └──────────────────────────────┬──────────────────────────────┘
                                      │
                                      ▼
       ┌─────────────────────────────────────────────────────────────┐
       │              GOVERNMENT & COMPLIANCE PARTNERS               │
       │  • MeitY, NeGD, CSC Operators, e-Mitra                      │
       │  • Rely on GIGW 3.0, DPDP Act compliance, & secure e-KYC     │
       └─────────────────────────────────────────────────────────────┘
```

### 3.1. Target User Cohorts
* **Cohort A: Vernacular Rural Citizens (The Welfare Seekers)**
  - *Demographics:* Farmers, daily wage laborers, rural artisans, senior citizens. Age 18–75.
  - *Tech Stack:* Budget Android smartphones, low-bandwidth 4G/5G connections, heavily reliant on WhatsApp and YouTube.
  - *Core Needs:* Discovery of direct benefit transfer (DBT) schemes, pensions, scholarships, and agricultural subsidies.
  - *Barrier:* Low literacy or high discomfort with reading written English/Hindi. Require voice input/output in local dialects.
* **Cohort B: Emerging Entrepreneurs & MSMEs (The formalization seeker)**
  - *Demographics:* Small shop owners, startup founders, logistics operators, local manufacturers. Age 20–45.
  - *Tech Stack:* Mid-tier smartphones and laptops, standard mobile web, high usage of business-management tools.
  - *Core Needs:* Fast-tracked GST registration, PAN cards, Udyam (MSME) registration, compliance guidance, and business loan applications (Mudra, Standup India).
  - *Barrier:* High anxiety regarding complex tax compliance (GST filings, ITR selections), fear of legal penalties, and expensive CA/consultant overheads.
* **Cohort C: Tech-Savvy Urban Youth (The Career & Benefit Seekers)**
  - *Demographics:* Students, young professionals, gig workers. Age 16–35.
  - *Tech Stack:* Modern iOS/Android devices, high-speed 5G, desktop access.
  - *Core Needs:* National scholarships, skill development program discovery, passport application checklists, PAN corrections, and income tax saving recommendations.

### 3.2. Strategic Business Stakeholders
* **Ministry of Electronics & Information Technology (MeitY) & NeGD:**
  - *Interest:* Ensuring any citizen-facing AI complies with national standards, integrates securely with API Setu, and boosts e-governance accessibility.
* **Common Service Center (CSC) & Village Level Entrepreneurs (VLEs):**
  - *Interest:* Utilizing Jan Seva AI as an assisted-agent tool to serve walk-in citizens in rural areas, earning commission on successful applications.
* **Certified Consultants (Chartered Accountants, Lawyers, Passport Agents):**
  - *Interest:* Listed on our booking system to receive high-intent, pre-vetted leads for complex registrations, paying a platform facilitation fee.

---

## 4. Regulatory, Compliance, and Legal Framework

Jan Seva AI operates in a highly regulated domain. Absolute compliance with Indian cyber laws, personal data protections, and accessibility mandates is non-negotiable for enterprise survival and trust.

```
       ┌─────────────────────────────────────────────────────────────────────────┐
       │               REGULATORY & COMPLIANCE COMPASS                           │
       ├─────────────────────────────────────────────────────────────────────────┤
       │ 1. DPDP Act 2023        ──> Consent Manager, Localized Storage, Purge   │
       │ 2. GIGW 3.0 Compliance  ──> WCAG 2.2 AA Accessibility, Bilingual Web    │
       │ 3. UIDAI Regulations    ──> Masked Aadhaar, Secure Vault (no raw storage)│
       │ 4. CERT-In Auditing     ──> OWASP Top 10, VAPT Testing, Strict Rate Limits│
       └─────────────────────────────────────────────────────────────────────────┘
```

### 4.1. Digital Personal Data Protection (DPDP) Act, 2023 Compliance
As a **Data Fiduciary** processing citizen information (including sensitive PII such as Aadhaar numbers, income, health, and family details), the platform must enforce the following architecture:
- **Consent Architecture (Consented Processing):** Implementing a multi-lingual, highly legible Consent Manager. Users must give explicit, affirmative consent *before* entering personal data into the chat assistant. Consent notices must detail exactly what data is collected, why it is processed, and how to revoke it.
- **Data Minimization:** AI must only request fields strictly required to calculate scheme eligibility or fill out the target form.
- **Right to Erasure & Correction:** Users must have a clear "Purge My Profile" option in their dashboard, executing a permanent delete cascade across PostgreSQL, Redis, and semantic vector caches.
- **No LLM Training on PII:** System prompts and contract clauses with LLM providers (e.g., Azure OpenAI) must explicitly state that no prompt payloads, history, or user PII will be logged or used for model training.
- **Sovereign Localized Storage:** All application servers, vector engines, and relational databases must reside within AWS/Azure Indian data centers (e.g., Mumbai, Pune) to comply with localized storage rules.

### 4.2. Guidelines for Indian Government Websites (GIGW 3.0)
To establish trust and standard e-governance compatibility, the front-end layout must adhere to GIGW rules:
- **Web Content Accessibility Guidelines (WCAG 2.2 AA):** Strict compliance with screen reader compatibility (ARIA attributes), keyboard navigability, alternative text for images, and color-contrast ratios of at least 4.5:1.
- **Bilingual / Multilingual Standard:** Instant language toggles available on every view. If a user toggles to Hindi, all system elements (menus, buttons, headers) must translate dynamically, avoiding mixed-language visual layouts.
- **Standardized Footer Disclosure:** Clear disclaimers stating that Jan Seva AI is an independent platform assisting discovery, and is not an official government entity, accompanied by links to official government privacy policies and standard help desks.

### 4.3. UIDAI & Aadhaar Compliance
- **Zero Raw Aadhaar Storage:** Under UIDAI regulations, the database must never store raw 12-digit Aadhaar numbers.
- **Aadhaar Masking:** Any document uploads scanned by the platform's AI OCR must automatically redact/mask the first 8 digits of the Aadhaar number prior to server persistence.
- **e-KYC Integration:** User authentication via Aadhaar OTP must go through official licensed API Setu gateway partners using secure hardware security modules (HSM) and strict session tokens.

### 4.4. CERT-In Security Certification
- **Vulnerability Assessment & Penetration Testing (VAPT):** Mandatory bi-annual security audits conducted by a CERT-In impaneled security agency.
- **End-to-End Encryption:** Encryption of data-at-rest using AES-256 and data-in-transit via TLS 1.3.

---

## 5. High-Level Scope of Work

### 5.1. In-Scope Modules & Offerings

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               JAN SEVA AI PLATFORM SCOPE                               │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • Core Vernacular Conversational Assistant (Bhashini TTS/STT, Multilingual RAG Engine) │
│ • Scheme Finder (Direct integration with National Scheme Database via API Setu)        │
│ • State-wise Welfare & Pension Discoverer (All 28 States, localized rules)             │
│ • Business Onboarding (GST Registration Helper, PAN Builder, MSME Udyam Portal flow)    │
│ • Enterprise Core (Admin Console, SEO CMS, Telemetry Analytics, Audit Log Vault)       │
│ • Premium Features (CA Booking, CSC Referral Networks, Premium Advisory)                │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

The platform's features are grouped into five core operational segments:

1. **Conversational AI Core:** Text and voice chat in English, Hindi, and 10+ regional Indian languages; intelligent intent routing; hybrid vector-based search on official policy circulars.
2. **Citizen Welfare Suite:** Government Scheme Finder, Scholarship Finder, Pension & Welfare Finder, and Passport/PAN documentation guides.
3. **Business & Taxation Suite:** Business Registration Assistant (Udyam, Spicex+), GST Registration/filing guidance, Income Tax Assistant (tax calculations and slab comparisons).
4. **User & Administrative Ecosystem:** Citizen Dashboard, Admin Control Center, SEO-optimized localized Blog CMS, SMS/WhatsApp notification engine.
5. **Monetization & Partner Marketplace:** Premium membership, live video consultancy booking with verified professionals, and an affiliate marketplace connecting citizens with nearby physical Common Service Centers (CSCs).

### 5.2. Out-of-Scope (Future Phases)
- **Direct Application Submission (Phase 1):** In the initial launch, the system will *not* directly write data to government databases to submit applications. It will prepare the forms, check documents, and direct users to official portals. Full end-to-end transaction submission is deferred to Phase 3.
- **Custom Aadhaar Issuance:** The platform does not issue new Aadhaar numbers; it only facilitates linking, verification, and update discovery.
- **Off-line Manual Document Courier Services:** No physical pickups of documents or paper forms; all operations are digital.

---

## 6. Business Model & Monetization Strategy

To ensure long-term commercial sustainability without compromising the core mission of helping low-income citizens, Jan Seva AI leverages a segmented, multi-tiered monetization structure:

```
                  ┌──────────────────────────────────────────────┐
                  │          MONETIZATION CHANNELS               │
                  └──────────────────────┬───────────────────────┘
                                         │
           ┌─────────────────────────────┼─────────────────────────────┐
           ▼                             ▼                             ▼
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│     B2C Premium      │     │  Consultancy Booking │     │ Affiliate Marketplace│
│ • $4.99/mo (INR 399) │     │ • 25% Platform Split │     │ • API Setu Leads     │
│ • Family Profiles    │     │ • Certified CAs/CSs  │     │ • CSC Hardware sales │
│ • Priority AI Slots  │     │ • Secured Escrow     │     │ • Tax Software APIs  │
└──────────────────────┘     └──────────────────────┘     └──────────────────────┘
```

### 6.1. B2C Premium Membership (Jan Seva Gold)
* **Pricing:** ₹399 per month / ₹2,499 per year.
* **Target Audience:** Affluent families, small business owners, and rural community facilitators who manage profiles for multiple people.
* **Features:**
  - **Multi-Profile Vault:** Save up to 8 family or business member profiles (age, state, income) for automatic background monitoring. Whenever a new scheme is launched matching a profile, receive a priority WhatsApp notification.
  - **Priority Processing:** Dedicated cloud resources for faster vernacular voice translation during peak traffic.
  - **Document Pre-Verifier:** Premium AI document auditing. Upload passport-size photos, signature crops, or address proofs, and the AI will check resolution, dimensions, and potential OCR errors before you submit to government portals.

### 6.2. Certified Consultancy Booking Marketplace
* **Pricing:** Session fees set by experts (typically ₹500 - ₹3,000 per consultation). Jan Seva AI retains a **25% platform facilitation fee**.
* **Target Audience:** Users requiring verified human experts for complex corporate registrations, income tax filing disputes, or passport reissues under complex situations.
* **Features:**
  - Built-in secure video conferencing room.
  - Integration with verified, background-checked Chartered Accountants (CAs), Company Secretaries (CSs), and legal advisors.
  - Payment escrow: Expert is paid only after the session is completed and the user rates it above 3 stars or signs off.

### 6.3. Affiliate & Physical Center Marketplace (VLE Partners)
* **Pricing:** Commission-based model per transaction.
* **Target Audience:** Citizens who prefer a hybrid model—using AI to discover what they need, but wanting a physical person to complete the physical scanning and biometric verification.
* **Features:**
  - **CSC Network Directory:** Match users to their nearest physical Common Service Center (CSC) or Village Level Entrepreneur (VLE).
  - Partners pay a monthly listing fee or small transaction charge to receive high-intent, fully prepared citizen profiles (with pre-validated documents in DigiLocker).
  - Integration with third-party micro-insurance, legal draft providers, and corporate service providers matching user queries.

---

## 7. Key Constraints & Dependencies

```
                     ┌────────────────────────────────────┐
                     │         PLATFORM DEPENDENCIES      │
                     └──────────────────┬─────────────────┘
                                        │
         ┌──────────────────────────────┼──────────────────────────────┐
         ▼                              ▼                              ▼
┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐
│  Bhashini Latency│          │ API Setu Uptime  │          │   Connectivity   │
│ • Needs < 800ms  │          │ • Intermittent   │          │ • Offline modes  │
│ • Cache TTS maps │          │ • Resilient fallback│       │ • Edge compression│
└──────────────────┘          └──────────────────┘          └──────────────────┘
```

- **Dependency 1: National API Setu & State Portal Uptime**
  * *Constraint:* Many state-level portals experience high downtime or rate limits.
  * *Mitigation:* Jan Seva AI must maintain a localized cache of scheme parameters, application forms, and eligibility parameters. Real-time API check failures must trigger dynamic fallbacks to cached document forms.
- **Dependency 2: Bhashini API Speed & Quality**
  * *Constraint:* Regional voice synthesis and speech-to-text models can sometimes experience latency spikes (exceeding 2 seconds).
  * *Mitigation:* Employ edge-caching for standard conversational voice responses (e.g., greeting templates, standard rejection explanations).
- **Dependency 3: Rural Bandwidth Fluctuation**
  * *Constraint:* Target users in tier-3/tier-4 villages often have unstable internet connections.
  * *Mitigation:* The mobile application must be packaged as a lightweight Progressive Web App (PWA) with smart offline caching, limiting high-bandwidth assets and utilizing highly compressed voice packets.

---

## 8. High-Level Release Roadmap

The platform deployment strategy is designed to balance user validation, system training, and compliance checks over three operational phases.

```
       PHASE 1 (Months 1-4)               PHASE 2 (Months 5-8)             PHASE 3 (Months 9-12)
   [ MVP Launch & Inclusivity ]     [ Financial Suite & Regional ]    [ Transactional Integration ]
   ┌──────────────────────────┐     ┌────────────────────────────┐    ┌───────────────────────────┐
   │ • Core Voice AI Chat     │     │ • GST & ITR Assistants     │    │ • Full API Setu Write Ops │
   │ • Scheme Finder (5 States)│───> │ • 22 Official Languages    │───>│ • Autonomous Agent Filing │
   │ • Aadhaar & DigiLocker   │     │ • Consultancy Marketplace  │    │ • CSC Multi-tenant Web    │
   │ • GIGW 3.0 & DPDP VAPT   │     │ • Premium Gold Membership  │    │ • Advanced Analytics Tool │
   └──────────────────────────┘     └────────────────────────────┘    └───────────────────────────┘
```

* **Phase 1: Foundation, Core Welfare & Indian Compliance (Months 1–4)**
  - Core AI Chat Assistant with English, Hindi, and Tamil text/voice.
  - Government Scheme Finder covering federal schemes and 5 major states.
  - Citizen Dashboard with DigiLocker and OTP authentication.
  - Full GIGW 3.0 implementation and CERT-In baseline security audit.
* **Phase 2: Commercialization, Business & Financial Suites (Months 5–8)**
  - Launch MSME, GST, and Income Tax Assistants.
  - Roll out support for all 22 officially scheduled Indian languages.
  - Launch Premium Membership (Gold Vault) and the Consultancy Booking marketplace.
  - Integrate programmatic SEO blogging and the CSC referral map.
* **Phase 3: Deep Integrations & Autonomous Action (Months 9–12)**
  - Direct read/write API integrations for automated application submissions through API Setu partners.
  - Dynamic multi-agent filing assistance (AI auto-filling government forms while the user watches in real-time).
  - Launch of the physical affiliate marketplace and hardware partnerships (e.g., biometric scanners for VLEs).

---

## 9. Approval Sign-Off

*By signing below, the stakeholders agree that this document comprehensively outlines the business requirements and strategic goals of Project Jan Seva AI.*

| Name | Role / Title | Date | Signature |
| :--- | :--- | :--- | :--- |
| **Dr. Amit Sharma** | Chief Technology Officer, NeGD Partner | 15 Oct 2023 | _________________ |
| **Karan Malhotra** | Lead Product Manager, Jan Seva AI | 15 Oct 2023 | _________________ |
| **Priya Nair** | Head of Compliance & Legal | 15 Oct 2023 | _________________ |
