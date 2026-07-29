# User Stories and Acceptance Criteria: Seva Setu Platform

This document outlines the core Epic, User Stories, and Acceptance Criteria (AC) for the **Seva Setu** platform. These stories are mapped directly to our defined user personas: Ramesh (Rural Beneficiary), Sunita (Unorganized Worker), Vikram (Micro-Entrepreneur), and Amit (Verified Consultant).

---

## Epic 1: Multilingual & Voice-First AI Assistant
**Objective:** Enable users of all digital literacy levels to interact with government services naturally using their native language and voice.

### User Story 1.1: Regional Voice Input
**As** a rural beneficiary with low digital literacy (Ramesh),
**I want to** ask questions using voice notes in my native language (Hindi/Bhojpuri),
**So that** I don't have to struggle with typing complex government terms on a small screen.

**Acceptance Criteria:**
*   **AC1:** The chat interface must feature a prominent, easily tappable microphone icon.
*   **AC2:** The system must accurately transcribe Hindi/regional voice input to text (Speech-to-Text).
*   **AC3:** The AI must respond in the same language the user initiated the conversation in.
*   **AC4:** The response must include a text-to-speech (TTS) playback button for audio consumption.

### User Story 1.2: Conversational Simplification
**As** an unorganized sector worker (Sunita),
**I want to** receive explanations about schemes like e-Shram in simple, non-bureaucratic terms,
**So that** I understand the benefits without feeling overwhelmed by legal jargon.

**Acceptance Criteria:**
*   **AC1:** AI responses must have a reading level suitable for primary education (e.g., Flesch-Kincaid score).
*   **AC2:** Complex terms (e.g., "Domicile", "Unorganized Sector") must be auto-linked to brief, visual tooltip explanations.
*   **AC3:** The AI must always cite official sources (e.g., ".gov.in") at the bottom of the response to maintain trust.

---

## Epic 2: Profiling & Proactive Recommendations
**Objective:** Contextually gather user data to match them with relevant government schemes accurately.

### User Story 2.1: Visual Profiling Onboarding
**As** an unorganized sector worker (Sunita),
**I want to** set up my profile using simple icons and guided questions (Age, Gender, Income, Dependents),
**So that** I don't have to fill out long, intimidating text forms.

**Acceptance Criteria:**
*   **AC1:** The onboarding flow must present one question per screen with large, descriptive icons (e.g., Male/Female icons, Rupee stacks for income).
*   **AC2:** Users must be able to skip non-mandatory questions.
*   **AC3:** Profile data is securely saved (DPDP Act compliant) and visible in a "My Profile" tab.

### User Story 2.2: Scheme Matching (RAG Pipeline)
**As** a rural beneficiary (Ramesh),
**I want the** platform to automatically tell me I am eligible for PM-KISAN,
**So that** I don't miss out on financial support I didn't know existed.

**Acceptance Criteria:**
*   **AC1:** Upon completing the profile, the platform queries the AI Knowledge Base to match the user's demographic data with the eligibility criteria of the Top 10 schemes.
*   **AC2:** Eligible schemes are displayed in a "Recommended for You" carousel.
*   **AC3:** Each recommended card clearly states *why* the user is eligible (e.g., "Because you are a farmer in Bihar earning under ₹X").

---

## Epic 3: Actionable Checklists & Dashboards
**Objective:** Provide structured guidance and tracking for complex applications.

### User Story 3.1: Step-by-Step Document Checklist
**As** a micro-entrepreneur (Vikram),
**I want a** clear, itemized checklist of documents needed for Udyam and GST registration,
**So that** I can gather everything before starting the official application, saving me time.

**Acceptance Criteria:**
*   **AC1:** When asking about a specific service, the AI generates an interactive checklist of required documents.
*   **AC2:** The user can check off items on the list as they gather them.
*   **AC3:** The checklist state is saved across sessions so the user doesn't lose their progress.

### User Story 3.2: Personalized Dashboard & Reminders
**As** a micro-entrepreneur (Vikram),
**I want to** see upcoming compliance deadlines (like GST filing) and track my PMMY loan application status,
**So that** I don't incur late fees and know exactly where my business stands.

**Acceptance Criteria:**
*   **AC1:** The dashboard must display a calendar widget highlighting upcoming tax/statutory deadlines relevant to the user's saved profile.
*   **AC2:** Users can manually update the "Status" of their ongoing applications (e.g., Draft, Submitted, Approved) via the dashboard.
*   *(Note: Direct backend integration with gov servers is out of scope for MVP; tracking is user-managed or based on scraped timeline estimates).*

---

## Epic 4: Consultant CRM (B2B Tier)
**Objective:** Empower verified consultants to manage multiple citizen applications efficiently at scale.

### User Story 4.1: Client Profile Management
**As** a verified service consultant (Amit),
**I want to** create and manage separate folders/profiles for each of my clients,
**So that** I can keep their documents, eligibility results, and application statuses organized in one place.

**Acceptance Criteria:**
*   **AC1:** Consultant accounts must have access to a distinct "B2B Dashboard".
*   **AC2:** Consultants can click "Add New Client" to create a sub-profile.
*   **AC3:** All interactions with the AI (e.g., checking scheme rules) can be attached to a specific client's file for future reference.

### User Story 4.2: Policy Update Knowledge Retrieval
**As** a verified service consultant (Amit),
**I want to** quickly query the AI for the latest changes in EPF withdrawal rules,
**So that** I can give my clients 100% accurate, up-to-date advice without reading 50-page PDF notifications.

**Acceptance Criteria:**
*   **AC1:** The AI must prioritize the latest indexed documents from the RAG pipeline when answering specific regulatory queries.
*   **AC2:** The response must provide a TL;DR summary followed by a link to the original government notification PDF/page.
*   **AC3:** Consultants can export these AI summaries as white-labeled PDFs to share with their clients on WhatsApp.