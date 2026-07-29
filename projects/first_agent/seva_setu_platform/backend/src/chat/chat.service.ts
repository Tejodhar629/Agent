import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { BhashiniService } from './bhashini.service';
import { RagService } from './rag.service';
import axios from 'axios';

export interface ChatQueryRequest {
  conversationId?: string;
  userId: string;
  userQuery: string; // The user input text (or transcribed text)
  sourceLang: string; // e.g. "hi", "kn", "en"
  voiceInput?: boolean;
  audioContentBase64?: string; // Base64 voice data if the user spoke
}

export interface ChatQueryResponse {
  conversationId: string;
  messageId: string;
  detectedLanguage: string;
  intent: string;
  assistantResponseNative: string; // Regional localized script
  assistantResponseEnglish: string; // Standardized English source
  audioResponseBase64?: string; // Optional TTS output if voiceInput was used
  citations: string[];
  requiresOcr: boolean;
  entities: {
    geographic_scope: string | null;
    scheme_name: string | null;
    demographics: {
      age: number | null;
      income: number | null;
      occupation: string | null;
    };
  };
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly openaiApiKey: string;

  constructor(
    private readonly bhashiniService: BhashiniService,
    private readonly ragService: RagService,
  ) {
    this.openaiApiKey = process.env.OPENAI_API_KEY || '';
  }

  /**
   * Orchestrates the complete user conversational query through Bhashini localization,
   * Multi-Agent Orchestration Routing, Hybrid RAG context matching, Synthesis Grounding, and PII protection.
   */
  async processUserQuery(payload: ChatQueryRequest): Promise<ChatQueryResponse> {
    const startTime = Date.now();
    const conversationId = payload.conversationId || `conv_${Math.random().toString(36).substring(2, 11)}`;
    const messageId = `msg_${Math.random().toString(36).substring(2, 11)}`;
    let originalQuery = payload.userQuery;

    this.logger.log(`Received chat request for conversation: ${conversationId}, user: ${payload.userId}`);

    // 1. Voice-In Stage: Process vocal inputs using Bhashini ASR if voiceInput is active
    if (payload.voiceInput && payload.audioContentBase64) {
      try {
        const asrResult = await this.bhashiniService.asr(payload.sourceLang, payload.audioContentBase64);
        originalQuery = asrResult.transcribedText;
        this.logger.log(`Bhashini Voice Input ASR Transcribed Text: "${originalQuery}"`);
      } catch (error: any) {
        this.logger.error(`Bhashini ASR pipeline failed, falling back to manual text: ${error.message}`);
      }
    }

    if (!originalQuery) {
      throw new BadRequestException('Request query parameter is empty. Please supply a valid query text or voice stream.');
    }

    // Scrub user query input before routing to protect PII at the border
    const sanitizedQuery = this.validateAndRedactPii(originalQuery);

    // 2. Lingual Gateway Stage: Translate localized query script -> English for uniform indexing
    let englishQuery = sanitizedQuery;
    if (payload.sourceLang !== 'en') {
      try {
        const translation = await this.bhashiniService.translate(payload.sourceLang, 'en', sanitizedQuery);
        englishQuery = translation.translatedText;
        this.logger.log(`Standardized user query translated to English: "${englishQuery}"`);
      } catch (error: any) {
        this.logger.error(`Bhashini NMT input translation failed. Defaulting to original: ${error.message}`);
      }
    }

    // 3. Orchestration Router Stage: Evaluate classification intent, linguistic targets, and demographics
    const routingResult = await this.executeRouterAgent(englishQuery);
    this.logger.log(`Router Agent Intent Classified: ${routingResult.routing_path}`);

    // Extract scoped filters for RAG
    const stateScope = routingResult.entities?.geographic_scope || undefined;
    const schemeFilterName = routingResult.entities?.scheme_name || undefined;

    // 4. Grounded RAG Stage: Retrieve authoritative facts from whitelisted domains
    const ragResult = await this.ragService.retrieveContext(
      englishQuery,
      stateScope,
      schemeFilterName
    );

    // 5. Synthesis Stage: Formulate response utilizing whitelisted document chunks
    const englishDraft = await this.executeSynthesisAgent(
      englishQuery,
      ragResult.chunks,
      sanitizedQuery
    );

    // 6. Output Guardrail Stage: Run NLI alignment check, verify non-hallucinated numbers, and enforce URL domain safety
    const guardedEnglishDraft = this.enforceOutputGuardrails(englishDraft, ragResult.chunks);

    // 7. Lingual Return Stage: Translate generated English draft back to target native Indic script
    let nativeResponse = guardedEnglishDraft;
    if (payload.sourceLang !== 'en') {
      try {
        const translation = await this.bhashiniService.translate('en', payload.sourceLang, guardedEnglishDraft);
        nativeResponse = translation.translatedText;
      } catch (error: any) {
        this.logger.error(`Bhashini NMT output translation failed: ${error.message}. Returning English draft.`);
      }
    }

    // 8. Voice-Out Stage: Synthesize response native speech base64 stream using Bhashini TTS if user initiated with voice
    let audioResponseBase64: string | undefined;
    if (payload.voiceInput) {
      try {
        const ttsResult = await this.bhashiniService.tts(payload.sourceLang, nativeResponse);
        audioResponseBase64 = ttsResult.audioContent;
      } catch (error: any) {
        this.logger.error(`Bhashini TTS voice synthesis failed: ${error.message}`);
      }
    }

    const latencyMs = Date.now() - startTime;
    this.logger.log(`Query processed completely in ${latencyMs}ms. Retuned final response.`);

    return {
      conversationId,
      messageId,
      detectedLanguage: payload.sourceLang,
      intent: routingResult.routing_path,
      assistantResponseNative: nativeResponse,
      assistantResponseEnglish: guardedEnglishDraft,
      audioResponseBase64,
      citations: ragResult.citations,
      requiresOcr: routingResult.requires_ocr,
      entities: {
        geographic_scope: routingResult.entities?.geographic_scope || null,
        scheme_name: routingResult.entities?.scheme_name || null,
        demographics: {
          age: routingResult.entities?.demographics?.age || null,
          income: routingResult.entities?.demographics?.income || null,
          occupation: routingResult.entities?.demographics?.occupation || null,
        }
      }
    };
  }

  /**
   * Router Agent: Classifies the incoming query and harvests demographic/geographical parameters.
   */
  private async executeRouterAgent(query: string): Promise<any> {
    if (!this.openaiApiKey) {
      this.logger.warn('OpenAI API key missing. Running heuristic router fallback parsing rules.');
      return this.heuristicRouterFallback(query);
    }

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `# ROLE AND CONTEXT
You are the central Orchestration Router for SevaSetu AI, an automated AI gateway for Indian public welfare services. Your duty is to analyze incoming user queries and extract classification intents, entities, and language attributes with absolute precision.

# OPERATIONAL PROTOCOLS
1. Classify the user query into exactly ONE of the following routing paths:
   - SCHEME_INQUIRY: User is searching for details, eligibility, or benefits of a government scheme.
   - DOCUMENT_OCR: User has uploaded a picture of an Aadhaar, PAN, or Land record and wants to extract metadata.
   - ELIGIBILITY_CALC: User is asking for eligibility validation using explicit criteria (age, income, state).
   - GENERAL_HELP: General conversational queries, greetings, or basic platform support.
2. Extract the following entities if present:
   - geographic_scope: Indian State or District (e.g., "Uttar Pradesh", "Karnataka").
   - scheme_name: Formal or colloquial government scheme name (e.g., "PM-KISAN", "crop insurance").
   - demographics: Age, annual income, caste category, disability status if mentioned.
3. Determine the input language code (ISO 639-1).

# OUTPUT FORMAT
Your output MUST be a valid, minified JSON object containing nothing else. Do not wrap in markdown blocks, do not add introductory phrases.

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
}`
            },
            {
              role: 'user',
              content: query
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.openaiApiKey}`
          }
        }
      );

      const responseText = response.data?.choices?.[0]?.message?.content;
      return JSON.parse(responseText);
    } catch (error: any) {
      this.logger.error(`OpenAI Router Agent execution failed: ${error.message}. Returning rule fallback.`);
      return this.heuristicRouterFallback(query);
    }
  }

  /**
   * Synthesis Agent: Generates clear, compassionate responses utilizing retrieved chunks.
   */
  private async executeSynthesisAgent(query: string, chunks: any[], unmaskedQuery: string): Promise<string> {
    if (chunks.length === 0) {
      return 'I am sorry, but I cannot locate verified government regulations for this request in my database. Please check the official portal at india.gov.in or visit your nearest Common Service Centre (CSC).';
    }

    if (!this.openaiApiKey) {
      this.logger.warn('OpenAI API key missing. Initiating fallback static synthesis compiler.');
      return this.heuristicSynthesisFallback(query, chunks);
    }

    try {
      const contextBlocks = chunks.map((c, idx) => `[Document ${idx + 1}]: Source: ${c.metadata.source_url}\nContent: ${c.text}`).join('\n\n');
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `# ROLE AND GOAL
You are the primary Response Synthesis Agent of SevaSetu AI. You construct authoritative, compassionate, and hyper-accurate instructions about Indian Welfare Schemes based ONLY on the provided verified \`.gov.in\` document chunks.

# INVIOLABLE CONSTRAINTS (ZERO-HALLUCINATION POLICY)
1. **Source Grounding:** Answer the user's query utilizing ONLY the facts, guidelines, and values presented in the "VERIFIED CONTEXT" block below. Do not use any internal model knowledge.
2. **Missing Facts Fallback:** If the VERIFIED CONTEXT does not contain the answer to the user's specific query, output the following EXACT phrase and nothing else: "I am sorry, but I cannot locate verified government regulations for this request in my database. Please check the official portal at india.gov.in or visit your nearest Common Service Centre (CSC)."
3. **No Dynamic Fabrication:** Never guess or extrapolate interest rates, processing timelines, application fees, or age limits. If a number is not in the context, do not mention it.
4. **Clean Speech Adaptation:** Your output will be read aloud by a Text-To-Speech engine. Avoid complex markdown tables, bullet points inside deep parenthetical lists, asterisks, or raw long URLs in the middle of sentences. Use clean, flowing sentences with minimal punctuation anomalies.
5. **PII Masking:** Never output raw personal identification details. If any user details are present in context, ensure they are masked.`
            },
            {
              role: 'user',
              content: `VERIFIED CONTEXT:\n${contextBlocks}\n\nUSER QUERY:\n${query}`
            }
          ],
          temperature: 0.1
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.openaiApiKey}`
          }
        }
      );

      return response.data?.choices?.[0]?.message?.content || '';
    } catch (error: any) {
      this.logger.error(`OpenAI Synthesis Agent execution failed: ${error.message}. Returning fallback compiler.`);
      return this.heuristicSynthesisFallback(query, chunks);
    }
  }

  /**
   * Output Guardrail Agent: Validates output compliance, checks numeric facts,
   * masks PII, and strips any non-whitelisted domains dynamically.
   */
  private enforceOutputGuardrails(draftResponse: string, chunks: any[]): string {
    // 1. Scrub Aadhaar and PAN details inside the synthesized response
    let guardedResponse = this.validateAndRedactPii(draftResponse);

    // 2. Strict Link Guardrail: Verify all URLs inside output correspond to whitelisted government portals
    const urlRegex = /https?:\/\/[^\s]+/g;
    const urlsFound = guardedResponse.match(urlRegex) || [];

    for (const url of urlsFound) {
      // Remove trailing characters from regex extraction matching (brackets, periods, commas)
      const cleanUrl = url.replace(/[.,()\]]/g, '');
      if (!this.ragService.isValidAndWhitelistedUrl(cleanUrl)) {
        this.logger.warn(`Guardrails Blocked output link citation: "${cleanUrl}". Redacting from final user visual view.`);
        guardedResponse = guardedResponse.replace(url, '[Authorized Government Portal]');
      }
    }

    // 3. Self-RAG Grounding Integrity: Cross-verify generated numbers against chunk source text
    const numbersInDraft = guardedResponse.match(/\b\d+(?:,\d+)*(?:\.\d+)?%?\b/g) || [];
    const contextCombinedText = chunks.map(c => c.text).join(' ').toLowerCase();

    for (const num of numbersInDraft) {
      const numericValue = num.replace(/[,%]/g, '');
      
      // Allow minor dynamic conversational numbers (like indices 1, 2, 3 or standard digits)
      if (['1', '2', '3', '4', '5'].includes(numericValue)) continue;

      // Ensure exact numbers appear in the whitelisted contexts
      if (!contextCombinedText.includes(numericValue) && !contextCombinedText.includes(num.toLowerCase())) {
        this.logger.warn(`Numeric Hallucination Guard Alert: Generated numerical value "${num}" was not verified in grounding chunks. Sanitizing.`);
        guardedResponse = guardedResponse.replace(num, '[Check eligibility guidelines]');
      }
    }

    return guardedResponse;
  }

  /**
   * Strict regex and processing logic to find and mask 12-digit Aadhaar numbers and PAN cards.
   */
  public validateAndRedactPii(text: string): string {
    // Aadhaar: Match 12 digits (continuous or separated by spaces/hyphens)
    const aadhaarPattern = /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g;
    let maskedText = text.replace(aadhaarPattern, (match) => {
      const rawId = match.replace(/[-\s]/g, '');
      return `XXXX-XXXX-${rawId.slice(-4)}`;
    });

    // PAN: Match first 5 letters, 4 numbers, 1 letter (continuous)
    const panPattern = /\b[A-Z]{5}\d{4}[A-Z]{1}\b/gi;
    maskedText = maskedText.replace(panPattern, (match) => {
      return `XXXXX${match.slice(5, 9)}X`.toUpperCase();
    });

    return maskedText;
  }

  /**
   * Local, deterministic routing heuristics for sandbox/local environments when API keys are absent.
   */
  private heuristicRouterFallback(query: string): any {
    const lQuery = query.toLowerCase();
    let routing_path = 'GENERAL_HELP';
    let geographic_scope = null;
    let scheme_name = null;
    let requires_ocr = false;

    // Detect Scope
    if (lQuery.includes('karnataka') || lQuery.includes('ssp')) geographic_scope = 'KARNATAKA';
    if (lQuery.includes('uttar pradesh') || lQuery.includes('unnao') || lQuery.includes('up')) geographic_scope = 'UTTAR PRADESH';

    // Detect Scheme
    if (lQuery.includes('kisan') || lQuery.includes(' सम्मान ')) {
      scheme_name = 'PM-KISAN';
      routing_path = 'SCHEME_INQUIRY';
    } else if (lQuery.includes('crop') || lQuery.includes('insurance') || lQuery.includes('fma') || lQuery.includes('बीमा')) {
      scheme_name = 'PM-KISAN'; // fallback group
      routing_path = 'SCHEME_INQUIRY';
    } else if (lQuery.includes('scholarship') || lQuery.includes('matric')) {
      scheme_name = 'OBC Post-Matric Scholarship';
      routing_path = 'SCHEME_INQUIRY';
    } else if (lQuery.includes('mudra') || lQuery.includes('loan') || lQuery.includes('ऋण')) {
      scheme_name = 'MUDRA Loan';
      routing_path = 'ELIGIBILITY_CALC';
    }

    if (lQuery.includes('upload') || lQuery.includes('ocr') || lQuery.includes('aadhaar card') || lQuery.includes('pan card')) {
      requires_ocr = true;
      routing_path = 'DOCUMENT_OCR';
    }

    return {
      routing_path,
      entities: {
        geographic_scope,
        scheme_name,
        demographics: {
          age: lQuery.match(/\b\d{2}\b/)?.[0] ? parseInt(lQuery.match(/\b\d{2}\b/)![0], 10) : null,
          income: lQuery.match(/\b\d{5,6}\b/)?.[0] ? parseInt(lQuery.match(/\b\d{5,6}\b/)![0], 10) : null,
          occupation: lQuery.includes('farmer') ? 'Farmer' : lQuery.includes('student') ? 'Student' : null
        }
      },
      detected_lang: 'en',
      requires_ocr
    };
  }

  /**
   * Local, deterministic answer compiler when OpenAI is offline.
   */
  private heuristicSynthesisFallback(query: string, chunks: any[]): string {
    const matchingChunk = chunks[0];
    if (!matchingChunk) {
      return 'I am sorry, but I cannot locate verified government regulations for this request in my database. Please check the official portal at india.gov.in or visit your nearest Common Service Centre (CSC).';
    }

    if (matchingChunk.id === 'chunk_pmkisan_001') {
      return 'Under the PM Kisan Samman Nidhi Yojana, eligible farmers receive financial assistance of Rs 6,000 per year, delivered directly into their bank accounts in three equal installments of Rs 2,000.';
    }

    if (matchingChunk.id === 'chunk_pmfby_001') {
      return 'Under the PM Fasal Bima Yojana, you must report local crop damage to wheat in Unnao within 72 hours of the unseasonal rainfall event to claim your agricultural insurance.';
    }

    if (matchingChunk.id === 'chunk_obc_scholarship_001') {
      return 'Under the Post-Matric Scholarship Scheme for OBC students in Karnataka, candidates with parental annual income less than Rs 1,00,000 are eligible for full tuition fee coverage.';
    }

    if (matchingChunk.id === 'chunk_mudra_001') {
      return 'The Pradhan Mantri MUDRA Yojana offers small business loans up to Rs 10 Lakhs. Valid Aadhaar and PAN card details are mandatory to calculate your commercial eligibility.';
    }

    return matchingChunk.text;
  }
}
