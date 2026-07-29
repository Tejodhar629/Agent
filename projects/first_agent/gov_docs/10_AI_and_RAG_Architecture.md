# AI Agent Architecture, Prompt Engineering Strategy, and RAG Pipeline Design

This document details the production-ready AI Agent Architecture, Prompt Engineering Strategy, and Retrieval-Augmented Generation (RAG) Pipeline for **SevaSetu AI** (Project *Jan Seva AI*). Designed to bridge the digital divide for over 1.4 billion citizens, this system ensures linguistic inclusivity, cognitive accessibility, high performance, and absolute regulatory compliance (DPDP 2023, UIDAI, and GIGW 3.0).

---

## 1. Executive Summary

SevaSetu AI operates as an intelligent, conversational Gateway to Indian Government Services. To serve a population characterized by diverse literacy levels, multi-dialect linguistic structures, and varying connectivity constraints, the platform's AI subsystem is built on three core pillars:

1. **Zero-Hallucination Retrieval-Augmented Generation (RAG):** Multi-stage validation featuring Hybrid Search, Dense Embeddings, BM25 Lexical Scoring, and Cohere Multilingual Reranking. Responses are strictly grounded in a verified corpus sourced exclusively from whitelisted `.gov.in` domains.
2. **Linguistic AI via MeitY Bhashini:** A complete multi-modal translation and transcription workflow enabling speech-in/speech-out capabilities across 22 scheduled Indian languages, optimizing for spoken regional dialects over formal translations.
3. **Multi-Agent Orchestration:** A decoupled multi-agent architecture utilizing specialized micro-agents for routing, document parsing (with UIDAI-compliant automated Aadhaar masking), rule-based eligibility computation, and safety guardrails.

```
       +--------------------------------------------------------------+
       |                  Citizen Speech / Text Input                |
       +--------------------------------------------------------------+
                                      |
                                      v
       +--------------------------------------------------------------+
       |             Bhashini Multi-modal STT & MT Pipeline           |
       |     (Translates regional dialects -> Normalized English)     |
       +--------------------------------------------------------------+
                                      |
                                      v
       +--------------------------------------------------------------+
       |                     Orchestration Router                     |
       +--------------------------------------------------------------+
             |                        |                        |
             v                        v                        v
+------------------------+ +------------------------+ +------------------------+
|   Document OCR Agent   | |  Eligibility Analyzer  | |   RAG Retrieval Agent  |
|  (Aadhaar/PAN Masker)  | | (Static Rule Executor) | | (Dense + Sparse Hybrid)|
+------------------------+ +------------------------+ +------------------------+
             |                        |                        |
             +------------------------+------------------------+
                                      |
                                      v
       +--------------------------------------------------------------+
       |               Grounding & Synthesis Engine                   |
       |            (Self-RAG & Hallucination Filter)                 |
       +--------------------------------------------------------------+
                                      |
                                      v
       +--------------------------------------------------------------+
       |                    Output Guardrail Agent                    |
       |      (PII Verification, Prompt Injection, Fact Validation)   |
       +--------------------------------------------------------------+
                                      |
                                      v
       +--------------------------------------------------------------+
       |             Bhashini MT & TTS Conversion Engine              |
       |    (English/Hindi Synthesis -> High-Fidelity Regional Audio) |
       +--------------------------------------------------------------+
                                      |
                                      v
       +--------------------------------------------------------------+
       |                  Citizen Voice / Text Output                 |
       +--------------------------------------------------------------+
```

---

## 2. AI Multi-Agent System Architecture

The conversational engine of SevaSetu AI is structured as a decoupled multi-agent system. Instead of relying on a single monolithic model to handle extraction, retrieval, translation, and compliance, responsibilities are delegated to five specialized, lightweight micro-agents coordinated by an Orchestration Router.

### 2.1 Multi-Agent Specifications and Roles

| Agent Name | Primary Responsibility | Input Payload | Output Payload | Backend LLM/Model |
| :--- | :--- | :--- | :--- | :--- |
| **Orchestration Router** | Directs input to specific agents, extracts linguistic metadata, parses conversation history. | Raw User Query, Active User Session State. | Target Agent ID, Extracted Query Intent, Language Code. | Llama-3-8B-Instruct / GPT-4o-mini |
| **RAG Retrieval Agent** | Generates search queries, executes Hybrid Vector search, manages document retrieval. | User Intent, Session Context, Location Metadata. | Filtered Reference Chunks, Source URLs, Relevancy Scores. | Custom Bi-Encoder + BM25 Sparse Index |
| **Document OCR Agent** | Extracts data from uploaded Aadhaar, PAN, or land documents; applies UIDAI redaction rules. | Scanned Document Image / PDF. | Masked Image, Extracted JSON Metadata (Name, DOB, Land Area). | LayoutLMv3 + Fine-tuned paddleOCR |
| **Eligibility Analyzer** | Evaluates user profile attributes against welfare scheme rules stored in Postgres JSON. | User Profile Metadata, Target Scheme Rules. | Boolean Eligibility Status, Missing Criteria, Next Steps. | Rule-Engine (Deterministic Python) + GPT-4o-mini (Fallback) |
| **Output Guardrail Agent** | Executes self-correction loops, checks for hallucinated citations, validates PII protection. | Synthesized Response, Original Retrieved Context. | Validated Final Response, Citation URLs. | Llama-3-8B-Instruct (local) / Guardrails-LLM |

### 2.2 Agent Interaction Sequence

For a user seeking crop insurance eligibility (e.g., Ramesh Kumar querying about *PM Fasal Bima Yojana* in Hindi):

1. **Intake & Transcription:** The user uploads a voice memo in the Awadhi dialect of Hindi. The **Bhashini Localization Gateway** transcribes the speech to Hindi text and translates it to English: *"Is my crop insurance money coming for the wheat crop ruined by rains in Unnao?"*
2. **Routing:** The **Orchestration Router** classifies the intent as `SCHEME_INQUIRY` with specific entity tags: `Scheme: PM Fasal Bima Yojana`, `Crop: Wheat`, `Location: Unnao, Uttar Pradesh`.
3. **Retrieval:** The **RAG Retrieval Agent** issues a hybrid query to the PostgreSQL (pgvector) vector database, fetching official guidelines for PM Fasal Bima Yojana in Uttar Pradesh.
4. **Verification & Analysis:** If the user has uploaded land papers, the **Document OCR Agent** parses the crop area (Khasra No.) and masks PII. The **Eligibility Analyzer** compares the land records and the district notification dates against the retrieval context.
5. **Synthesis & Guardrails:** The context-grounded response is drafted in English. The **Output Guardrail Agent** performs a triple check:
   * **NLI Entailment Check:** Does the response contain any claim not backed by the retrieved `.gov.in` document?
   * **Fact Check:** Are dynamic variables (dates, payouts) identical to the raw source values?
   * **Compliance:** Are any PII fields (Aadhaar/PAN) leaked?
6. **Linguistic Re-generation:** The validated response is translated back to natural Hindi (Awadhi dialect optimized) and converted to a friendly, high-quality audio stream via **Bhashini TTS**.

---

## 3. Advanced RAG Pipeline Design

Retrieving bureaucratic policies across 29 states in multiple languages requires an exceptionally robust Retrieval-Augmented Generation pipeline. Lexical matching alone fails due to localized naming variations, while dense vector search struggles with fine-grained numerical guidelines and ministry acronyms. SevaSetu AI solves this with a **Two-Tier Hybrid Search & Reranking Architecture**.

```
                           +------------------------+
                           |  User Normalized Query |
                           +------------------------+
                                        |
                   +--------------------+--------------------+
                   |                                         |
                   v                                         v
     +---------------------------+             +---------------------------+
     |      Sparse Retriever     |             |      Dense Retriever      |
     |  (BM25 on Scheme Acronyms,|             | (Multilingual E5 Embeds   |
     |   Ministry Names, IDs)    |             |  on Semantic Meanings)    |
     +---------------------------+             +---------------------------+
                   |                                         |
                   |  Top-K Lexical Results                  |  Top-K Semantic Results
                   v                                         v
                   +-----------------------------------------+
                   |       Reciprocal Rank Fusion (RRF)      |
                   +-----------------------------------------+
                                        |
                                        v
                   +-----------------------------------------+
                   |       Multilingual Cross-Encoder        |
                   |       Reranking (Cohere Rerank v3)      |
                   +-----------------------------------------+
                                        |
                                        v
                   +-----------------------------------------+
                   |     Dynamic Threshold Filtering (>0.7)  |
                   +-----------------------------------------+
                                        |
                                        v
                   +-----------------------------------------+
                   |     LLM Context Injection & Synthesis   |
                   +-----------------------------------------+
```

### 3.1 Data Ingestion & Whitelisted Scraping

To guarantee 100% authoritative answers, the RAG corpus is continuously synced from a strict whitelist of official Indian Government domains (`*.gov.in`, `*.nic.in`). 

```python
WHITELISTED_DOMAINS = [
    "india.gov.in",       # National Portal
    "myscheme.gov.in",    # Unified Scheme Portal
    "pmkisan.gov.in",     # PM-KISAN Agriculture
    "pmfby.gov.in",       # PM Crop Insurance
    "uidai.gov.in",       # Aadhaar Authority
    "incometax.gov.in",   # Income Tax Department
    "epfindia.gov.in",    # Employees' Provident Fund
    "udyamregistration.gov.in", # MSME Registration
]
```

#### Document Processing pipeline:
1. **Scraping & Normalization:** Daily cron jobs scrape active pages, PDFs, and official gazettes from whitelisted domains.
2. **Metadata Injection:** Every chunk is heavily enriched with a standardized metadata header:
   ```json
   {
     "doc_id": "scheme_pmfby_up_2024",
     "source_url": "https://pmfby.gov.in/admin-uploads/guidelines_2024.pdf",
     "originating_ministry": "Ministry of Agriculture & Farmers Welfare",
     "geographic_scope": "IN-UP",
     "target_demographics": {
       "occupation": "Farmer",
       "income_limit_annual": null,
       "crop_type": ["Wheat", "Paddy", "Mustard"]
     },
     "last_updated": "2024-01-15T00:00:00Z"
   }
   ```
3. **Semantic Chunking:** Text is split using recursive character chunking, but with layout-aware boundary markers (e.g., maintaining table structures, list elements, and rule clauses intact). Typical chunk sizes: 1,024 tokens with a 256-token overlap.

### 3.2 The Hybrid Retrieval Strategy

#### Tier 1: Sparse (BM25) and Dense Vector Parallel Search
The platform executes two concurrent queries on the target database (e.g., Qdrant or PGVector running on AWS RDS):
* **Sparse Indexing:** An inverted index utilizing **BM25** on specialized keyword-boosted fields (such as acronyms, state names, and application IDs). This prevents the semantic model from confusing similar-sounding but legally separate schemes (e.g., "PM-KISAN" vs. "PM-KMY").
* **Dense Indexing:** A dense vector search utilizing a multilingual embedding model (**Multilingual E5 Large** or **Cohere Embed v3 Multilingual**), converting queries in any language into a shared 1024-dimensional space.

#### Tier 2: Reciprocal Rank Fusion (RRF)
The parallel lists of retrieved documents are combined mathematically using **Reciprocal Rank Fusion (RRF)** to construct a unified ranked set.

The score for document $d$ within a pool of retrieval runs $M$ is calculated as:

$$RRF\_Score(d \in D) = \sum_{m \in M} \frac{1}{k + r_m(d)}$$

Where:
* $M$ represents the search methods (1 = BM25, 2 = Multilingual Dense Vector).
* $r_m(d)$ is the zero-based rank of document $d$ in the output of search method $m$.
* $k$ is a smoothing constant, typically configured to $60$.

This rank fusion ensures that chunks ranking highly in *both* semantic meaning and exact structural phrasing are pushed to the top of the collection.

#### Tier 3: Multilingual Reranking Engine
The top 20 candidate chunks generated from RRF are passed to a high-capacity cross-encoder: **Cohere Multilingual Rerank v3** or **BGE-Reranker-Large**.
* The reranker calculates a deep, bidirectional attention score of the user's localized query against each individual document chunk.
* **Dynamic Confidence Gating:** Chunks returning a score below $0.70$ are instantly purged.
* If no chunks score above $0.70$, the pipeline interrupts generation and triggers a clean fallback path: *"I could not locate an official rule in my whitelisted database. Let me direct you to the nearest Common Service Centre (CSC) or check the official national portal."* This acts as an immediate shield against hallucinations.

---

## 4. Linguistic AI & Bhashini API Orchestration

To break down the literacy barrier, SevaSetu AI integrates with **MeitY's Bhashini ULCA** (Universal Language Contribution API). This dynamic integration converts speech in regional dialects into standardized text, routes it to the RAG backend, and synthesizes high-fidelity natural spoken responses.

### 4.1 Real-Time Conversational Flow Architecture

```
[Citizen Dialect Voice] 
         |
         v (WebSockets Audio Stream)
[Bhashini ASR Service]  --> Generates Regional Transcribed Text (e.g., Awadhi)
         |
         v
[Bhashini NMT Service]  --> Translates Regional Text to Base English
         |
         v
[RAG Engine Processing] --> Retrieves whitelisted context & synthesizes response in English/Hindi
         |
         v
[Bhashini NMT Service]  --> Translates synthesized response back to target Regional Language
         |
         v
[Bhashini TTS Service]  --> Generates high-fidelity audio stream with correct local intonations
         |
         v
[Citizen Localized Audio]
```

### 4.2 Bhashini Integration API Contracts

The following JSON structures define the unified API contracts for communicating with the Bhashini orchestration endpoints, showcasing custom speech-to-text, translation, and text-to-speech transactions.

#### 4.2.1 Unified Bhashini Pipeline Config Request
Before calling individual services, the application fetches active model IDs from the Bhashini directory based on language parameters.

* **Endpoint:** `POST https://meity.bhashini.gov.in/ulca/apis/v1/model/getModelsPipeline`
* **Request Payload:**
```json
{
  "pipelineTasks": [
    {
      "taskType": "asr",
      "config": {
        "language": {
          "sourceLanguage": "hi"
        }
      }
    },
    {
      "taskType": "translation",
      "config": {
        "language": {
          "sourceLanguage": "hi",
          "targetLanguage": "en"
        }
      }
    },
    {
      "taskType": "tts",
      "config": {
        "language": {
          "sourceLanguage": "en"
        }
      }
    }
  ],
  "pipelineRequestConfig": {
    "pipelineId": "64392f708e330e0d0b000001"
  }
}
```

#### 4.2.2 Real-time Automated Speech Recognition (ASR)
Used to translate continuous voice audio into text.

* **Endpoint:** `POST https://dhruva.bhashini.gov.in/services/inference/pipeline`
* **Request Payload:**
```json
{
  "pipelineTasks": [
    {
      "taskType": "asr",
      "config": {
        "language": {
          "sourceLanguage": "hi"
        },
        "serviceId": "ai4bharat/whisper-medium-hi",
        "audioFormat": "wav",
        "samplingRate": 16000
      }
    }
  ],
  "inputData": {
    "audio": [
      {
        "audioContent": "UklGRiYAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAA..."
      }
    ]
  }
}
```
* **Response Payload:**
```json
{
  "pipelineResponse": [
    {
      "taskType": "asr",
      "output": [
        {
          "source": "गेहूं की फसल नुकसान का बीमा कैसे मिलेगा उन्नाव में"
        }
      ]
    }
  ]
}
```

#### 4.2.3 Neural Machine Translation (NMT)
Used to normalize regional text to English before sending it to the RAG model, and to translate the final answer back to the user's tongue.

* **Request Payload (Hindi to English):**
```json
{
  "pipelineTasks": [
    {
      "taskType": "translation",
      "config": {
        "language": {
          "sourceLanguage": "hi",
          "targetLanguage": "en"
        },
        "serviceId": "ai4bharat/indictrans-v2-all-to-all"
      }
    }
  ],
  "inputData": {
    "input": [
      {
        "source": "गेहूं की फसल नुकसान का बीमा कैसे मिलेगा उन्नाव में"
      }
    ]
  }
}
```
* **Response Payload:**
```json
{
  "pipelineResponse": [
    {
      "taskType": "translation",
      "output": [
        {
          "source": "गेहूं की फसल नुकसान का बीमा कैसे मिलेगा उन्नाव में",
          "target": "How will I get insurance for wheat crop damage in Unnao?"
        }
      ]
    }
  ]
}
```

#### 4.2.4 Neural Text-To-Speech (TTS)
Generates high-fidelity regional audio with natural intonations.

* **Request Payload:**
```json
{
  "pipelineTasks": [
    {
      "taskType": "tts",
      "config": {
        "language": {
          "sourceLanguage": "hi"
        },
        "serviceId": "ai4bharat/indic-tts-coqui-hi",
        "gender": "female"
      }
    }
  ],
  "inputData": {
    "input": [
      {
        "source": "उन्नाव जिले में गेहूं की फसल के नुकसान के लिए, आप पीएम फसल बीमा योजना के तहत आवेदन कर सकते हैं। इसकी अंतिम तिथि १५ दिसंबर है।"
      }
    ]
  }
}
```
* **Response Payload:**
```json
{
  "pipelineResponse": [
    {
      "taskType": "tts",
      "output": [
        {
          "audioContent": "UklGRiYAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAA...",
          "audioFormat": "wav"
        }
      ]
    }
  ]
}
```

---

## 5. Prompt Engineering Strategy & System Instructions

System prompts are structured strictly to enforce grounding, compliance, structural formatting suitable for synthetic text-to-speech systems, and dialect adaptation.

### 5.1 System Instruction: Orchestration Router Agent

```markdown
# ROLE AND CONTEXT
You are the central Orchestration Router for SevaSetu AI, an automated AI gateway for Indian public welfare services. Your duty is to analyze incoming user queries and extract classification intents, entities, and language attributes with absolute precision.

# OPERATIONAL PROTOCOLS
1. Classify the user query into exactly ONE of the following routing paths:
   - SCHEME_INQUIRY: User is searching for details, eligibility, or benefits of a government scheme.
   - DOCUMENT_OCR: User has uploaded a picture of an Aadhaar, PAN, or Land record and wants to extract metadata.
   - ELIGIBILITY_CALC: User is asking for eligibility validation using explicit criteria (age, income, state).
   - GENERAL_HELP: General conversational queries, greetings, or basic platform support.
2. Extract the following entities if present:
   - geographic_scope: Indian State or District (e.g., "Uttar Pradesh", "Unnao").
   - scheme_name: Formal or colloquial government scheme name (e.g., "PM-KISAN", "crop insurance").
   - demographics: Age, annual income, caste category, disability status if mentioned.
3. Determine the input language code (ISO 639-1) and detect if Hinglish or code-switching is present.

# OUTPUT FORMAT
Your output MUST be a valid, minified JSON object containing nothing else. Do not wrap in markdown blocks unless requested, do not add introductory phrases.

{
  "routing_path": "SCHEME_INQUIRY" | "DOCUMENT_OCR" | "ELIGIBILITY_CALC" | "GENERAL_HELP",
  "entities": {
    "geographic_scope": string | null,
    "scheme_name": string | null,
    "demographics": {
      "age": integer | null,
      "income": integer | null,
      "occupation": string | null
    }
  },
  "detected_lang": string,
  "requires_ocr": boolean
}
```

### 5.2 System Instruction: RAG Response Synthesis Agent (Grounding Champion)

```markdown
# ROLE AND GOAL
You are the primary Response Synthesis Agent of SevaSetu AI. You construct authoritative, compassionate, and hyper-accurate instructions about Indian Welfare Schemes based ONLY on the provided verified `.gov.in` document chunks.

# INVIOLABLE CONSTRAINTS (ZERO-HALLUCINATION POLICY)
1. **Source Grounding:** Answer the user's query utilizing ONLY the facts, guidelines, and values presented in the "VERIFIED CONTEXT" block below. Do not use any internal model knowledge.
2. **Missing Facts Fallback:** If the VERIFIED CONTEXT does not contain the answer to the user's specific query, output the following EXACT phrase and nothing else: "I am sorry, but I cannot locate verified government regulations for this request in my database. Please check the official portal at india.gov.in or visit your nearest Common Service Centre (CSC)."
3. **No Dynamic Fabrication:** Never guess or extrapolate interest rates, processing timelines, application fees, or age limits. If a number is not in the context, do not mention it.
4. **Clean Speech Adaptation:** Your output will be read aloud by a Text-To-Speech engine. Avoid complex markdown tables, bullet points inside deep parenthetical lists, asterisks, or raw long URLs in the middle of sentences. Use clean, flowing sentences with minimal punctuation anomalies.
5. **PII Masking:** Never output raw personal identification details. If any user details are present in context, ensure they are masked.
6. **Citation Requirement:** At the absolute end of your response, append a clean citations array in the specified JSON format.

# VERIFIED CONTEXT
{context_chunks}

# USER CONVERSATION HISTORY
{history}

# USER QUERY
{query}

# OUTPUT STRUCTURE
Write your response in two sections separated by a "---" boundary line:
[Section 1: Spoken-Optimized Clear Answer]
---
[Section 2: Citations JSON]
```

### 5.3 System Instruction: Document OCR & Redaction Agent (UIDAI Guard)

```markdown
# ROLE
You are the Document OCR & Redaction Agent. Your core objective is to extract structured administrative metrics from scanned official identification or land documents, while enforcing strict Indian data privacy compliances (DPDP 2023 & UIDAI Guidelines).

# INVIOLABLE SECURITY COMPLIANCE (AADHAAR MASKING)
1. **Aadhaar Masking Rule:** If the uploaded document is identified as an Aadhaar Card, you MUST verify that any 12-digit sequence resembling an Aadhaar Number (XXXX XXXX XXXX or XXXXXXXXXXXX) is completely masked. Retain only the LAST 4 digits.
   - Example Input: "3489 8274 0192"
   - Output Masking: "XXXX-XXXX-0192"
2. **PAN Masking Rule:** Mask the first five characters and the last character of any PAN Card numbers (e.g., "ABCDE1234F" -> "XXXXX1234X").

# METADATA EXTRACTION PROTOCOL
Parse the document layout and compile the following attributes into clean JSON:
- document_type: "AADHAAR" | "PAN" | "KHASRA_LAND_RECORD" | "UNKNOWN"
- extracted_name: string | null (Full legal name)
- unique_identifier_masked: string | null (masked ID)
- state_origin: string | null
- specific_metrics: (e.g., plot_area_hectares, survey_number for Khasra land records)

# OUTPUT FORMAT
Return a single JSON object. Do not include markdown code block syntax. Ensure PII data masking has been applied prior to compilation.
```

---

## 6. Hallucination Prevention, Safety, and Compliance (DPDP & UIDAI)

To achieve enterprise-grade reliability suitable for public administration, SevaSetu AI deploys a dual-evaluation loop combining programmatic assertions with specialized LLM evaluator checks.

```
       +--------------------------------------------------------------+
       |                  Candidate LLM Response                     |
       +--------------------------------------------------------------+
                                      |
                                      v
       +--------------------------------------------------------------+
       |            NLI Faithfulness Evaluator (DeBERTa-v3)           |
       |     (Is candidate response strictly entailed by context?)    |
       +--------------------------------------------------------------+
                                      |
                 +--------------------+--------------------+
                 | Entailed (Score >= 0.85)                | Not Entailed (Score < 0.85)
                 v                                         v
       +-----------------------------------+     +-----------------------------------+
       |    Self-RAG Fact Match Check      |     |  Log Refusal & Request Refined    |
       |  (Strict match on numbers/dates)  |     |  Search Chunk Injection           |
       +-----------------------------------+     +-----------------------------------+
                 |                                                 |
                 v (Pass)                                          v (Retrieve new chunks)
       +-----------------------------------+             +-----------------------------------+
       |        PII Redaction Guard        |             |  Execute Fallback Safe Refusal    |
       |  (Masks Aadhaar, PAN, Mobile)     |             +-----------------------------------+
       +-----------------------------------+
                 |
                 v (Secure Output)
       +-----------------------------------+
       |     Validated Output Synthesis     |
       +-----------------------------------+
```

### 6.1 Dual-Evaluation Grounding Loop (Self-RAG)

1. **Natural Language Inference (NLI) Entailment Filter:**
   * After the Synthesis Agent constructs a candidate response, it is passed along with the raw retrieved text chunks to a local, high-speed classification model (e.g., `DeBERTa-v3-Base-NLI`).
   * The NLI model assigns an entailment probability score $P_{entail}$ representing whether the candidate response's factual claims are fully supported by the reference texts.
   * If $P_{entail} < 0.85$, the response is rejected, and a secondary retrieval process is triggered or the system switches to the safe fallback message.
2. **Dynamic Fact Extraction & Verification (Self-RAG Check):**
   * A regex and entity-parser scans both the retrieved chunks and the synthesized answer to match all numeric figures, financial percentages, dates, and geographic tags.
   * If any numeric mismatch is discovered (for example, the retrieved text lists an interest rate of `"4%"` but the candidate response claims `"2.5%"`), the response is discarded and re-queued for generation with a strict penalty.

### 6.2 Regulatory Compliance Architecture

* **UIDAI Aadhaar Vault & Ephemeral Processing:**
  * Raw uploaded images of identity cards are processed entirely within isolated, memory-only execution environments (AWS Firecracker Sandboxes).
  * The image is parsed, relevant metadata is harvested, masked, and the raw file is permanently erased from memory within 120 seconds of session initialization.
  * No raw Aadhaar number is ever stored in database logs, transactional storage, or cached files.
* **DPDP Act 2023 Consent Flow:**
  * No user interaction or data extraction is initiated until an explicit, affirmative **Consent Manager Modal** is confirmed by the user.
  * The consent request is delivered both in writing and in high-fidelity audio in the citizen’s chosen language, clearly communicating what data is being parsed (e.g., "We will read your land records to check your eligibility for PM Fasal Bima").
  * **Absolute Right to Erasure:** A prominent "Delete My Profile & Data" button is provided in the Citizen Dashboard, executing cascade deletions across database entries, log tracks, and active cache blocks.

---

## 7. Production Implementation Blueprint & API Specifications

To demonstrate the viability of this design, the following reference implementation combines hybrid retrieval, reranking, and safety validation in a production-ready python layout.

### 7.1 Real-Time Hybrid RAG Retrieval Engine

```python
import os
import re
from typing import Dict, Any, List
import numpy as np

# Mocking internal clients for PGVector, BM25, and Cohere
class QdrantVectorClient:
    def search(self, vector: List[float], limit: int) -> List[Dict[str, Any]]:
        # Returns semantic chunks with metadata
        return [
            {
                "id": 101,
                "text": "Under PM Fasal Bima Yojana for Uttar Pradesh, wheat crop damage due to unseasonal rains must be reported within 72 hours of the event to the agricultural officer in Unnao.",
                "score": 0.89,
                "metadata": {"source_url": "https://pmfby.gov.in/guidelines", "state": "UP"}
            },
            {
                "id": 102,
                "text": "PM-KISAN provides Rs 6000 yearly in three equal installments of Rs 2000 each directly to the bank accounts of small and marginal landholders.",
                "score": 0.65,
                "metadata": {"source_url": "https://pmkisan.gov.in/rules", "state": "IN"}
            }
        ]

class BM25SearchEngine:
    def search(self, query: str, limit: int) -> List[Dict[str, Any]]:
        # Returns lexical chunks
        return [
            {
                "id": 101,
                "text": "Under PM Fasal Bima Yojana for Uttar Pradesh, wheat crop damage due to unseasonal rains must be reported within 72 hours of the event to the agricultural officer in Unnao.",
                "score": 12.4,
                "metadata": {"source_url": "https://pmfby.gov.in/guidelines", "state": "UP"}
            }
        ]

class CohereRerankClient:
    def rerank(self, query: str, documents: List[str], top_n: int) -> List[Dict[str, Any]]:
        # Mock high-capacity multilingual cross-encoder reranker scores
        return [
            {"index": 0, "relevance_score": 0.94},
            {"index": 1, "relevance_score": 0.21}
        ]

class SevaSetuRAGEngine:
    def __init__(self):
        self.vector_db = QdrantVectorClient()
        self.bm25_db = BM25SearchEngine()
        self.rerank_client = CohereRerankClient()
        self.k_constant = 60

    def compute_rrf(self, dense_results: List[Dict[str, Any]], sparse_results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Executes Reciprocal Rank Fusion on Sparse and Dense results.
        """
        rrf_scores = {}
        document_map = {}

        # Process dense ranks
        for rank, doc in enumerate(dense_results):
            doc_id = doc["id"]
            document_map[doc_id] = doc
            rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + (1.0 / (self.k_constant + rank))

        # Process sparse ranks
        for rank, doc in enumerate(sparse_results):
            doc_id = doc["id"]
            document_map[doc_id] = doc
            rrf_scores[doc_id] = rrf_scores.get(doc_id, 0.0) + (1.0 / (self.k_constant + rank))

        # Sort documents based on aggregated RRF scores
        sorted_docs = sorted(rrf_scores.items(), key=lambda item: item[1], reverse=True)
        return [document_map[doc_id] for doc_id, score in sorted_docs]

    def validate_and_redact_pii(self, text: str) -> str:
        """
        Strict regex masker for Aadhaar numbers and standard credentials.
        """
        # Match Aadhaar (12 digits with optional spaces or hyphens)
        aadhaar_pattern = r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b'
        def mask_aadhaar(match):
            raw_id = match.group(0).replace(" ", "").replace("-", "")
            return f"XXXX-XXXX-{raw_id[-4:]}"
        
        return re.sub(aadhaar_pattern, mask_aadhaar, text)

    def retrieve_context(self, query: str, user_state: str) -> List[Dict[str, Any]]:
        # 1. Fetch dense embeddings query matches (Mock 384 dimensional vector)
        mock_embedding = [0.012] * 384
        dense_hits = self.vector_db.search(mock_embedding, limit=10)
        
        # 2. Fetch sparse lexical matches
        sparse_hits = self.bm25_db.search(query, limit=10)
        
        # 3. Apply Reciprocal Rank Fusion
        fused_documents = self.compute_rrf(dense_hits, sparse_hits)
        
        # 4. Multilingual Reranking
        doc_texts = [doc["text"] for doc in fused_documents]
        reranked_results = self.rerank_client.rerank(query, doc_texts, top_n=3)
        
        final_chunks = []
        for res in reranked_results:
            if res["relevance_score"] >= 0.70:
                target_doc = fused_documents[res["index"]]
                final_chunks.append(target_doc)
                
        return final_chunks

# Execution Demonstration
if __name__ == "__main__":
    engine = SevaSetuRAGEngine()
    user_query = "What is crop insurance process in Unnao after rainfall for wheat?"
    
    # Context Retrieval
    retrieved_context = engine.retrieve_context(user_query, "UP")
    print("----- RETRIEVED GROUNDED CONTEXTS -----")
    for chunk in retrieved_context:
        print(f"[{chunk['metadata']['source_url']}] -> {chunk['text']}\n")
        
    # PII Verification Demo
    unmasked_submission = "My Aadhaar card is 5293 8472 0192 and I am a farmer in Unnao."
    safe_submission = engine.validate_and_redact_pii(unmasked_submission)
    print("----- MASKING COMPLIANCE AUDIT -----")
    print(f"Raw Input:  {unmasked_submission}")
    print(f"Masked Output: {safe_submission}")
```

### 7.2 Unified Conversational RAG Endpoints (FastAPI Contract)

The transactional REST API contract manages full conversational queries, combining dynamic session history, translation targets, and regional localized overrides.

#### 7.2.1 Conversational Scheme Inquiry API
* **Endpoint:** `POST /api/v1/chat/query`
* **Headers:**
  * `Content-Type: application/json`
  * `Authorization: Bearer <JWT_TOKEN>`
* **Request Schema:**
```json
{
  "session_id": "sess-9082-pk2",
  "language_preference": "hi",
  "dialect_override": "awadhi",
  "voice_input": false,
  "query_text": "Is there any financial help for small wheat farmers in Uttar Pradesh?",
  "user_profile": {
    "age": 42,
    "state": "Uttar Pradesh",
    "annual_income": 45000,
    "occupation": "Farmer"
  }
}
```

* **Response Schema:**
```json
{
  "session_id": "sess-9082-pk2",
  "detected_language": "hi",
  "translated_query": "Is there any financial help for small wheat farmers in Uttar Pradesh?",
  "response_text": "हाँ, उत्तर प्रदेश के छोटे गेहूं किसानों के लिए 'पीएम-किसान सम्मान निधि योजना' के तहत वित्तीय सहायता उपलब्ध है। इसके अंतर्गत पात्र किसानों को सालाना ६००० रुपये की राशि २000 रुपये की तीन बराबर किस्तों में सीधे उनके बैंक खातों में दी जाती है।",
  "audio_response_url": "https://cdn.sevasetu.gov.in/audio/response_sess_9082.wav",
  "is_voice_generated": true,
  "sources": [
    {
      "title": "PM-KISAN Guidelines, Department of Agriculture",
      "url": "https://pmkisan.gov.in/rules",
      "relevancy_score": 0.94
    }
  ],
  "eligibility_estimate": {
    "scheme_name": "PM-KISAN",
    "eligible": true,
    "reasons": [
      "Income is below the regional threshold",
      "Landholding fits marginal definition (<2 hectares)"
    ]
  }
}
```

---

## 8. Summary of AI Architecture Alignment

This technical blueprint represents the structural core of **SevaSetu AI**, transforming complex, bilingual, and localized bureaucratic requirements into a reliable conversational flow. By aligning specialized agents, deep hybrid vector search scoring, automated safety guardrails, and MeitY's Bhashini, the platform achieves:
* **Zero Fragmented Translations:** Processing regional requests via the central Bhashini STT-NMT stack guarantees consistent, localized updates.
* **Bulletproof Compliance:** Automatically stripping PII data at the border before pushing queries to LLMs maintains total DPDP 2023 alignment.
* **Flawless Fact Extraction:** The dual-evaluation NLI pipeline locks in verified data, driving down AI hallucinations and fostering citizen trust in digital public infrastructure.
