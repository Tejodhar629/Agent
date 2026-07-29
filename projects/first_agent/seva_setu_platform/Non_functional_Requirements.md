# Non-Functional Requirements Document (NFR)
## Project Name: Seva Setu - AI-Powered Government Services Platform

### 1. Introduction
This document defines the Non-Functional Requirements (NFRs) for the Seva Setu platform. It details the technical constraints, quality attributes, and architectural standards necessary to ensure the system is secure, performant, accessible, and scalable for an enterprise-level public rollout in India.

---

### 2. Performance & Scalability (PERF)
*   **NFR-PERF-01 (Latency):** The frontend application page load time shall not exceed 2 seconds over a standard 4G network.
*   **NFR-PERF-02 (AI Response Time):** The AI Chat Assistant shall begin streaming its response (Time-to-First-Token) within 1.5 seconds, and complete responses within 4 seconds.
*   **NFR-PERF-03 (Concurrency):** The system architecture must gracefully support up to 10,000 Concurrent Users (CCU) without performance degradation, utilizing horizontal scaling for Node.js (NestJS) microservices.
*   **NFR-PERF-04 (Caching strategy):** Redis shall be utilized to cache non-personalized static queries (e.g., "What is PM-KISAN?") to reduce redundant LLM API calls and latency.

---

### 3. Security & Data Privacy (SEC)
*   **NFR-SEC-01 (DPDP Act Compliance):** The platform must fully comply with India's Digital Personal Data Protection (DPDP) Act. Users must provide explicit, revocable consent before data is stored or processed.
*   **NFR-SEC-02 (Encryption):** All data in transit must be encrypted via TLS 1.3. All sensitive Data at Rest (e.g., user profiles, saved documents) in PostgreSQL must be encrypted using AES-256.
*   **NFR-SEC-03 (Vulnerability Protection):** The application must strictly adhere to OWASP Top 10 guidelines, preventing SQL Injection, Cross-Site Scripting (XSS), and Cross-Site Request Forgery (CSRF).
*   **NFR-SEC-04 (Rate Limiting & Abuse Prevention):** The backend must enforce strict API rate limiting per IP and per Session to prevent Distributed Denial of Service (DDoS) and AI token exhaustion attacks.
*   **NFR-SEC-05 (PII Redaction):** Personally Identifiable Information (PII) such as exact names, phone numbers, and Aadhaar numbers must be automatically masked/redacted before contextual prompts are routed to external OpenAI APIs.

---

### 4. Availability & Reliability (AVAIL)
*   **NFR-AVAIL-01 (SLA & Uptime):** The platform shall target an uptime of 99.9% (excluding scheduled maintenance windows).
*   **NFR-AVAIL-02 (Fault Tolerance):** Critical infrastructure (PostgreSQL databases, Redis cache, Vector database) shall be deployed across multiple Availability Zones (AZ) to prevent a single point of failure.
*   **NFR-AVAIL-03 (Disaster Recovery):** Automated database snapshots and backups shall be taken daily and retained securely for 30 days. Recovery Time Objective (RTO) shall be < 4 hours.

---

### 5. Usability & Accessibility (UX)
*   **NFR-UX-01 (WCAG Compliance):** The web platform must conform to WCAG 2.2 AA accessibility standards. This includes maintaining contrast ratios, full screen-reader compatibility (ARIA labels), and keyboard navigability.
*   **NFR-UX-02 (Cross-Platform / PWA):** The frontend application must be responsive (Mobile-First) and installable as a Progressive Web App (PWA) across Android, iOS, and Desktop platforms, supporting offline UI states during network drops.
*   **NFR-UX-03 (Cognitive Load):** The UI design shall minimize cognitive overload, relying on familiar icons, large typography, and uncluttered conversational interfaces suitable for users with varying levels of digital literacy.

---

### 6. Maintainability & Architecture (ARCH)
*   **NFR-ARCH-01 (Design Principles):** The NestJS backend must follow Domain-Driven Design (DDD), Clean Architecture, SOLID principles, and DRY (Don't Repeat Yourself).
*   **NFR-ARCH-02 (Code Quality):** 100% of the codebase must be strongly typed using TypeScript. Strict ESLint and Prettier configurations must be enforced via pre-commit hooks.
*   **NFR-ARCH-03 (Test Coverage):** The system must maintain a minimum of 80% test coverage across Unit and Integration tests (using Jest/Supertest). End-to-End (E2E) UI flows must be tested via Playwright or Cypress.
*   **NFR-ARCH-04 (API Documentation):** The backend REST and GraphQL endpoints must be fully self-documented using Swagger/OpenAPI specs dynamically generated from code annotations.

---

### 7. SEO & Core Web Vitals (SEO)
*   **NFR-SEO-01 (Lighthouse Metrics):** The production build must consistently achieve a Google Lighthouse score of 90+ across Performance, Accessibility, Best Practices, and SEO.
*   **NFR-SEO-02 (Dynamic Metadata):** Next.js Server-Side Rendering (SSR) or Static Site Generation (SSG) must be used for CMS-driven pages to inject dynamic OpenGraph tags, Canonical URLs, and JSON-LD structured data to ensure high indexability by search engines.