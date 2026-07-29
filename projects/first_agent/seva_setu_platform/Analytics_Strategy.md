# Analytics & Data Strategy

To continuously improve the platform, personalize the UX, and monitor the AI's effectiveness, a robust analytics strategy is required.

## 1. Product & Behavioral Analytics
*   **Tool:** PostHog (Open-source, self-hostable to align with DPDP data residency if needed).
*   **Core Metrics Tracked:**
    *   **Funnel Drop-offs:** Onboarding initiation -> Profile completion -> First chat message -> Scheme saved to Kanban.
    *   **Feature Usage:** Language toggle usage (to understand demographic splits), Voice Input vs. Text Input ratios.
    *   **Time-to-Value:** Average time taken from landing on the site to successfully matching with an eligible scheme.

## 2. AI & Chat Analytics
*   **Tool:** LangSmith or Custom PostgreSQL Logging.
*   **Metrics:**
    *   **Token Usage & Costs:** Real-time tracking of LLM spend.
    *   **User Feedback (Thumbs Up/Down):** Granular tracking of UI feedback on AI messages to fine-tune the RAG system.
    *   **Unanswered Queries:** Logging questions where the Vector DB returned low confidence scores (identifying gaps in our `.gov.in` data ingestion).

## 3. Marketing & Acquisition Analytics
*   **Tool:** Google Analytics 4 (GA4) & Google Search Console.
*   **Metrics:**
    *   Organic search traffic to programmatic scheme pages.
    *   Attribution tracking for Consultant sign-ups (Referrals, Social, Organic).

## 4. Privacy & Compliance Layer
*   All product analytics will hash or redact PII (Phone numbers, Names) before sending data to Posthog/GA4.
*   Tracking consent banners will be implemented in accordance with Indian data protection laws, allowing users to opt-out of non-essential behavioral tracking.