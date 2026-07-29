# Testing Strategy

To ensure a highly reliable platform, especially given the non-deterministic nature of AI/LLMs, we will implement a multi-layered testing strategy (Test Pyramid).

## 1. Unit Testing
*   **Tools:** Jest, React Testing Library.
*   **Scope:** 
    *   Frontend UI components (accessibility checks, interaction).
    *   Backend utility functions, pure business logic (e.g., eligibility calculation scripts).
    *   Zod validation schemas.
*   **Target:** 80% code coverage minimum.

## 2. Integration Testing
*   **Tools:** Supertest (NestJS), Apollo Server Testing.
*   **Scope:**
    *   API endpoint tests against an in-memory or Dockerized test database (Testcontainers).
    *   GraphQL query/mutation resolution checks.
    *   **RAG Pipeline Integration:** Mocking the LLM but testing the entire flow from Vector Search -> Context Retrieval -> Prompt Construction.

## 3. End-to-End (E2E) Testing
*   **Tools:** Playwright (preferred over Cypress for multiple tab/auth flows).
*   **Scope:**
    *   Core Critical Paths: Citizen onboarding flow, OTP login, searching for a scheme, talking to the chatbot, saving a scheme to the Kanban board, and generating an export.
    *   Consultant flow: Client creation, application status updates.
    *   Cross-browser and mobile responsive testing.

## 4. Performance & Load Testing
*   **Tools:** k6 (by Grafana).
*   **Scope:**
    *   Stress testing the Next.js SSR pages.
    *   **SSE Chat Endpoints:** Verifying that concurrent users do not bottleneck the Node.js event loop or exhaust Redis connections during high-traffic events (e.g., a new major government scheme announcement).

## 5. AI Specific Testing (LLM Evals)
*   **Tools:** Ragas, LangSmith, or TruLens.
*   **Scope:** 
    *   **Hallucination Testing:** Continuously evaluating RAG output against a golden dataset of known scheme FAQs.
    *   **Relevance:** Measuring Context Precision and Context Recall of the Vector Search.
    *   **Toxicity/Bias:** Automated checks to ensure the LLM responses remain neutral, empathetic, and strictly aligned with government data.