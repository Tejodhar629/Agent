# Functional Requirements Document (FRD)
## Project Name: Seva Setu - AI-Powered Government Services Platform

### 1. Introduction
This document outlines the detailed functional requirements for the Seva Setu platform. It defines the specific behaviors, features, and capabilities the system must possess to fulfill the business goals outlined in the BRD and PRD, and to serve the User Personas effectively.

---

### 2. User Authentication & Authorization (AUTH)
*   **FR-AUTH-01 (OTP Login):** The system shall allow users to register and log in using a Mobile Number and OTP (One Time Password).
*   **FR-AUTH-02 (OAuth):** The system shall allow users to log in using Google OAuth.
*   **FR-AUTH-03 (Role-Based Access Control):** The system shall support multiple user roles: Citizen, Verified Consultant, Editor (CMS), and Super Admin. Permissions shall be restricted based on the assigned role.
*   **FR-AUTH-04 (Session Management):** The system shall maintain persistent user sessions via secure JWT (JSON Web Tokens) and allow users to securely log out from all devices.

---

### 3. AI Conversational Interface (CHAT)
*   **FR-CHAT-01 (Multi-turn Chat):** The AI interface shall support continuous, multi-turn conversations, maintaining the context of previous user messages within a single session.
*   **FR-CHAT-02 (Dynamic Profiling):** The AI shall proactively ask missing contextual questions (e.g., age, state, caste, income, disability status) required to evaluate scheme eligibility.
*   **FR-CHAT-03 (Multilingual Input/Output):** The chat shall auto-detect user language and respond accordingly. It must support English, Hindi, and major regional languages (e.g., Marathi, Tamil, Bengali, Telugu). Users shall also have a manual language toggle.
*   **FR-CHAT-04 (Voice-to-Text & Text-to-Voice):** To support low-literacy personas (e.g., The Rural Beneficiary), the chat interface shall include a microphone input (speech-to-text) and a read-aloud feature (text-to-speech) for responses.
*   **FR-CHAT-05 (Human Handoff):** The system shall detect complex or highly ambiguous queries and offer a seamless transition/booking to a Verified Service Consultant.

---

### 4. Scheme Discovery & Eligibility Engine (DISC)
*   **FR-DISC-01 (RAG Querying):** The system shall translate user inputs into semantic search queries against the Vector Database (Qdrant/Pinecone) to retrieve relevant government circulars and scheme rules.
*   **FR-DISC-02 (Eligibility Matching):** The LLM shall evaluate the user's extracted profile data against the retrieved scheme rules to determine eligibility (Categorized as: *Eligible*, *Not Eligible*, or *Needs More Info*).
*   **FR-DISC-03 (Source Citation):** The AI shall strictly cite the official source URL (must be a `.gov.in` domain) alongside its recommendations to prevent hallucinations.

---

### 5. Action Plan & Deliverables (ACT)
*   **FR-ACT-01 (Action Plan Generation):** For each matched scheme/service, the system shall generate a structured "Action Plan."
*   **FR-ACT-02 (Action Plan Contents):** The Action Plan must display:
    *   Scheme Name & Overview
    *   Expected Financial/Social Benefits
    *   Mandatory Document Checklist (e.g., Aadhaar, Income Certificate)
    *   Step-by-step application instructions
    *   Direct official `.gov.in` link
    *   Common rejection reasons
*   **FR-ACT-03 (Export):** The system shall allow users to download the Action Plan as a localized PDF report or share it via WhatsApp.

---

### 6. Citizen Dashboard & Tracking (DASH)
*   **FR-DASH-01 (Save to Profile):** Logged-in users shall be able to save discovered schemes and Action Plans to their personal dashboard.
*   **FR-DASH-02 (Application Status Tracking):** Users shall be able to manually update the status of their saved applications using a Kanban-style tracker (e.g., *To-Do*, *Gathering Documents*, *Applied*, *Approved/Rejected*).
*   **FR-DASH-03 (Profile Management):** Users shall be able to view and edit their core profile variables (demographics, business details) to improve future AI recommendations.

---

### 7. Consultant & B2B Portal (CONS)
*   **FR-CONS-01 (Consultant Dashboard):** Verified Consultants shall have access to a CRM-style dashboard to manage multiple citizen profiles (with their explicit consent).
*   **FR-CONS-02 (Booking System):** The system shall allow citizens to schedule online/offline consultation appointments with verified CAs/Lawyers/CSC operators.
*   **FR-CONS-03 (Payment Gateway Integration):** The system shall integrate with a payment gateway (e.g., Razorpay) to process premium membership upgrades or consultancy fees securely.

---

### 8. Admin & Content Management System (ADMIN)
*   **FR-ADMIN-01 (Knowledge Base Updates):** Admins shall be able to upload new PDF circulars or input URLs via the dashboard. The system will automatically chunk, embed, and store this data in the Vector Database.
*   **FR-ADMIN-02 (Blog/CMS):** Admins and Editors shall be able to create, edit, and publish SEO-optimized blog posts, guides, and FAQs.
*   **FR-ADMIN-03 (Analytics Hub):** The Admin dashboard shall display core platform metrics: Daily Active Users (DAU), most searched schemes, AI token usage, and user feedback scores.

---

### 9. Notification System (NOTF)
*   **FR-NOTF-01 (Alerts):** The system shall send proactive SMS, Email, or WhatsApp notifications for:
    *   Nearing application deadlines for saved schemes.
    *   Launch of new schemes matching a user's demographic profile.
    *   Consultation booking confirmations.
*   **FR-NOTF-02 (Opt-out):** Users shall have granular control to opt-in or opt-out of specific notification types.