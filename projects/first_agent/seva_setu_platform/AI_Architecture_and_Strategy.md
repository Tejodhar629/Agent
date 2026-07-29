# AI Architecture, Prompt Engineering Strategy, and RAG Pipeline Design

This document outlines the technical design of the AI components for the **Seva Setu** platform, focusing on the conversational agent, prompt management, and the Retrieval-Augmented Generation (RAG) ecosystem.

## 1. AI System Architecture Overview

The Seva Setu AI Architecture is designed as a modular, scalable, and voice-first ecosystem to handle multilingual queries efficiently while maintaining strict adherence to factual, `.gov.in` sources.

### 1.1 Core Components
*   **Voice Processing Layer (STT / TTS):** 
    *   **Implementation:** Integration with Bhashini (for accurate Indic language processing) or OpenAI Whisper for Speech-to-Text (STT) and native Text-to-Speech (TTS).
    *   **Function:** Captures voice queries from rural/unorganized users (Ramesh, Sunita) and translates them to text, returning localized audio responses.
*   **AI Orchestrator (LangChain / LlamaIndex):** 
    *   **Implementation:** A Python/Node-based middleware that routes requests, manages tool execution, and builds the execution graph.
    *   **Function:** Handles query translation, orchestrates RAG retrieval, updates user memory, and formats the output.
*   **Memory & Context Layer:**
    *   **Implementation:** Redis for short-term conversational context (Session Memory) and PostgreSQL for long-term user profile attributes (Demographics, Business type).
*   **LLM Engine:**
    *   **Implementation:** GPT-4o / Claude 3.5 Sonnet (for high-reasoning tasks) with streaming (SSE - Server-Sent Events) for sub-2-second Time-To-First-Token (TTFT).

---

## 2. RAG Pipeline Design (Retrieval-Augmented Generation)

To ensure zero-hallucination and provide dynamic, proactive recommendations, the RAG pipeline is built using a **Hybrid Search** approach combined with **Metadata Filtering**.

### 2.1 Ingestion & Processing Pipeline
1.  **Data Sourcing:** Scheduled scrapers/API ingestors that pull data exclusively from verified `.gov.in` portals (India.gov.in, State portals, GST guidelines).
2.  **Chunking Strategy:** 
    *   Documents are chunked logically based on markdown headers or paragraphs using a Recursive Character Text Splitter (Chunk size: 500-800 tokens, Overlap: 100 tokens) to keep contextual boundaries intact.
3.  **Metadata Tagging:** Every chunk is enriched with structured metadata before vectorization: 
    *   `scheme_name`, `target_audience` (e.g., Micro-Entrepreneur, Farmer), `eligibility_criteria` (Income limit, Gender, Age), `state_applicability`.
4.  **Embedding:** Using a multilingual embedding model like `BGE-M3` or OpenAI `text-embedding-3-large` to accurately map queries in Hindi, Tamil, English, etc.
5.  **Vector Store:** **pgvector** (integrated directly into the existing PostgreSQL infrastructure to simplify deployment and maintain relational links).

### 2.2 Retrieval Pipeline
1.  **Query Formulation:** The orchestrator takes the user's raw input (e.g., "I need a loan for my shop") + User Profile (Vikram, Tier-2, Retail) to rewrite an optimized search query.
2.  **Hybrid Search:** 
    *   *Semantic Search:* Finds concepts matching the query.
    *   *Keyword Search (BM25):* Ensures exact matches for scheme names (e.g., "PM SVANidhi", "MUDRA").
3.  **Pre-Retrieval Filtering:** Hard-filtering vector space using user profile metadata (e.g., `WHERE income_limit >= user_income AND state IN ('ALL', user_state)`).
4.  **Re-Ranking:** A lightweight Cross-Encoder model re-ranks the top 10 retrieved chunks to ensure the most relevant context is fed to the LLM.

---

## 3. Prompt Engineering Strategy

Prompts are designed with strict guardrails to enforce accessibility (Flesch-Kincaid standards), native language output, and accurate citations.

### 3.1 System Prompt Architecture
```text
[ROLE & PERSONA]
You are Seva Setu, an empathetic, highly knowledgeable, and multilingual AI assistant for Indian citizens. Your goal is to help users discover and apply for government schemes and compliance tasks.

[TONE & ACCESSIBILITY]
- Speak clearly and simply. Use an 8th-grade reading level (Flesch-Kincaid).
- Be extremely empathetic and reassuring.
- When generating action steps, use bullet points and bold text for easy reading.

[RULES & GUARDRAILS]
1. ANTI-HALLUCINATION: You MUST ONLY use the information provided in the <retrieved_context>. Do not invent schemes, deadlines, or benefits. 
2. CITATION: You must cite your sources at the end of the response using ONLY the `.gov.in` URLs provided in the context.
3. ELIGIBILITY TRANSPARENCY: Always briefly explain *why* the user is eligible based on their <user_profile>.
4. IF UNKNOWN: If the answer is not in the context, politely state: "I currently do not have this information. Please visit your nearest Common Service Centre (CSC) or check india.gov.in."

[INPUT DATA]
<user_profile>
{Dynamic JSON of user: Name, Age, Occupation, Income, Location}
</user_profile>

<retrieved_context>
{Injected Markdown chunks from pgvector with source URLs}
</retrieved_context>
```

### 3.2 Dynamic Few-Shot Prompting
For complex tasks (e.g., creating the Actionable Checklist for Vikram's GST filing), the orchestrator injects 2-3 dynamic few-shot examples into the prompt to strictly enforce the JSON/Markdown output structure required by the UI frontend to render the interactive checklist components.

---

## 4. Performance, Security & Edge Cases

*   **Semantic Caching:** Implement **Redis / GPTCache** to store embeddings of common queries (e.g., "What are the benefits of Ayushman Bharat?"). If a user asks a similar query, the system serves the cached LLM response instantly, reducing API costs and latency.
*   **Graceful Degradation:** 
    *   If the primary LLM API experiences downtime, the orchestrator automatically falls back to a locally hosted or secondary cloud model (e.g., Llama-3 8B via Groq) to maintain the 99.9% SLA.
    *   If Voice-to-Text fails due to extreme background noise, the UI gracefully prompts the user to use the text input or select predefined quick-reply chips.
*   **PII & DPDP Act Compliance:** 
    *   Before sending chat history to the LLM or Vector DB, a Data Loss Prevention (DLP) middleware strips or masks sensitive PII (like Aadhaar numbers or bank account details) that are not strictly necessary for scheme matching.