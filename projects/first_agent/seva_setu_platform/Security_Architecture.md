# Security Architecture & Compliance Strategy

Given the platform handles PII (Personally Identifiable Information) and government scheme data, robust security is paramount.

## 1. Regulatory Compliance
*   **DPDP Act (India):** strict compliance with the Digital Personal Data Protection Act.
    *   Explicit, localized consent collection before profiling.
    *   "Right to be Forgotten" implementation allowing users to permanently delete their profiles and chat history.
    *   Data Localization: All data stays within AWS/GCP `ap-south-1` (Mumbai) regions.

## 2. Data Security
*   **Data in Transit:** TLS 1.3 enforced for all web and API traffic.
*   **Data at Rest:** 
    *   PostgreSQL and Vector DB volumes encrypted using AES-256.
    *   S3 Buckets (for user documents) encrypted using KMS (Key Management Service) with strict IAM policies. Documents are accessed via short-lived pre-signed URLs.
*   **PII Masking & LLM Privacy:** 
    *   Before any user data (e.g., Aadhar numbers, names) is injected into the LLM context, a pre-processing middleware (using Regex/NLP) masks the PII.
    *   Zero-data-retention agreements with LLM providers, or utilizing self-hosted open-source models (Llama 3) for absolute data sovereignty.

## 3. API & Infrastructure Security
*   **Authentication:** 
    *   Stateless JWTs stored in `HttpOnly`, `Secure`, `SameSite=Strict` cookies to prevent XSS and CSRF attacks.
    *   OTP verification limited by device fingerprinting and rate-limiting.
*   **Rate Limiting & DDoS Protection:** 
    *   Cloudflare / AWS WAF for Layer 7 DDoS protection.
    *   Redis-backed API rate limiting: strict constraints on the `/chat` (LLM) and `/auth/otp` endpoints to prevent billing abuse.
*   **RBAC (Role-Based Access Control):** 
    *   Strict separation of concerns at the GraphQL/REST controller level.
    *   Roles: `CITIZEN`, `CONSULTANT_PENDING`, `CONSULTANT_VERIFIED`, `ADMIN`.

## 4. Application Security (AppSec)
*   **Input Validation:** Zod schemas used on both frontend (React Hook Form) and backend (NestJS ValidationPipe) to prevent SQL Injection and NoSQL/Vector injection.
*   **Dependency Scanning:** automated Dependabot / Snyk scans in the CI pipeline.