# Product Requirement Document (PRD)
## Project Name: Seva Setu - AI-Powered Government Services Platform

### 1. Document Overview
This Product Requirement Document (PRD) details the functional and non-functional requirements for the "Seva Setu" platform. It translates the high-level business goals outlined in the Business Requirement Document (BRD) into actionable product specifications for the engineering, design, and AI development teams.

### 2. Product Vision & Objective
Create a scalable, secure, multilingual, and SEO-optimized platform where Indian citizens and businesses simply describe their needs in natural language, and an AI assistant guides them through personalized recommendations for government schemes, certificates, taxes, and business services.

### 3. Key User Personas (Summary)
*   **Rural Citizen (Ravi):** Needs access to basic welfare, agricultural schemes (PM-KISAN), and employment (MGNREGA). Low tech literacy, relies on voice/regional language.
*   **Urban Student (Priya):** Seeking scholarships, education loans, and identity documents (Passport, Voter ID). High tech literacy, mobile-first.
*   **MSME Owner (Anil):** Needs help with GST registration, business loans (Mudra Yojana), and compliance. Requires accuracy and efficiency.
*   **Consultant/CA (Neha):** Premium user managing multiple clients' tax filings, registrations, and complex applications.

### 4. Core User Flows
#### 4.1. The AI Chat Discovery Flow
1.  **Initiation:** User opens the Web/PWA interface.
2.  **Context Gathering:** The AI prompts the user with conversational questions (e.g., "What are you looking for today?"). The AI dynamically asks for variables like age, income, state, category (SC/ST/OBC/Gen), and occupation.
3.  **Processing:** The system matches inputs against the RAG (Retrieval-Augmented Generation) knowledge base containing scheme circulars.
4.  **Result Generation:** AI presents an "Action Plan" that includes:
    *   Eligible schemes (e.g., PMJDY, Ayushman Bharat, PMAY).
    *   Benefits summary and eligibility explanation.
    *   Mandatory document checklist (e.g., Aadhaar, Income Certificate).
    *   Direct official `.gov.in` application links.
    *   Common rejection reasons and tips for success.

#### 4.2. User Dashboard & Tracking
1.  User creates an account (OAuth or OTP-based).
2.  Saves generated action plans.
3.  Marks application statuses (e.g., "Documents Gathered," "Applied," "Approved").
4.  Receives platform notifications (Email/SMS/Push) when scheme deadlines approach or new eligible schemes are announced.

### 5. Functional Requirements (Modules)
#### 5.1. AI Conversational Assistant (Core Engine)
*   **Multi-turn Context:** Must remember previous answers in a session.
*   **Multilingual Support:** Auto-detect and respond in English, Hindi, and major regional languages.
*   **Fallback Mechanism:** Handover to verified consultants if the query is too complex or ambiguous.

#### 5.2. Scheme & Service Domains
The system must categorize and serve up-to-date info for:
*   **Top Welfare Schemes:** PMJDY, AB-PMJAY, PM-KISAN, MGNREGA, PMAY, SSY, APY, PMMY, e-Shram, PMUY.
*   **Certificates:** Aadhaar, PAN, Income, Caste, Domicile, Birth/Death, Driving License, Voter ID.
*   **Tax & Business:** ITR, GST, Udyam (MSME), EPF.

#### 5.3. RAG Pipeline & Knowledge Base
*   **Data Ingestion:** Automated scraping/upload of PDF circulars and official `.gov.in` web pages.
*   **Vector Database:** Qdrant or Pinecone for semantic search.
*   **Citation:** AI must strictly cite the exact official document/URL it retrieved the rule from to prevent hallucinations.

#### 5.4. Admin & CMS
*   Manage user roles (Super Admin, Editor, Consultant).
*   Create and manage SEO-optimized blog posts using AI assistance.
*   Monitor API usage (OpenAI tokens), system health, and user metrics.

#### 5.5. Premium & Ecosystem Features
*   **Consultancy Booking:** Interface for users to book video calls/chats with verified CAs/Lawyers.
*   **Payment Gateway:** Integration (e.g., Razorpay/Stripe) for premium membership and consulting fees.
*   **Affiliate Network:** Referral tracking for third-party micro-loans or insurance (where legally permissible).

### 6. Non-Functional Requirements (NFRs)
#### 6.1. Technical Stack
*   **Frontend:** Next.js (React), TypeScript, Tailwind CSS, Shadcn UI, PWA configuration.
*   **Backend:** NestJS (Node.js), TypeScript.
*   **Database:** PostgreSQL (Relational data, User Profiles) with Prisma ORM. Redis for caching and rate limiting.
*   **AI/ML:** OpenAI APIs (GPT-4o/GPT-4-turbo), LangChain/LlamaIndex, Qdrant/Pinecone (Vector DB).
*   **DevOps:** Docker, GitHub Actions (CI/CD), AWS/GCP hosting.

#### 6.2. Security & Compliance
*   **Data Privacy:** Compliance with India's DPDP (Digital Personal Data Protection) Act.
*   **Auth:** JWT-based stateless auth, Google OAuth, and mobile OTP (via SMS provider).
*   **Vulnerability Protection:** OWASP Top 10 (CSRF, XSS, SQLi protection), strict Rate Limiting.
*   **Audit Logging:** All modifications to the knowledge base and user profile access must be logged.

#### 6.3. UX & Accessibility
*   **Accessibility:** Strict adherence to WCAG 2.2 AA (high contrast modes, screen reader compatibility).
*   **Performance:** Target Google Lighthouse scores of 90+ (Core Web Vitals). Lazy loading, CDN caching for static assets.
*   **Design:** Mobile-first approach, clean and uncluttered UI ensuring low cognitive load for non-tech-savvy users.

### 7. Assumptions & Constraints
*   **Out of Scope (MVP):** Direct API integration with government portals for automated form submission (due to security and captcha restrictions on gov sites). The platform will act as an *enabler/guide*, not a direct application proxy.
*   **Constraint:** AI token costs can scale rapidly; robust caching of common queries (e.g., "What is Ayushman Bharat?") is required.

### 8. Key Performance Indicators (KPIs)
*   **User Engagement:** Average session length and number of chat turns per user.
*   **Conversion Rate:** Percentage of users who save a scheme or create an account.
*   **Accuracy:** Percentage of AI responses flagged as "helpful" vs. "hallucinated/incorrect" via user feedback thumbs up/down.
*   **Platform Uptime:** 99.9% target SLA.
*   **Monetization:** Number of premium consultancy bookings per month.