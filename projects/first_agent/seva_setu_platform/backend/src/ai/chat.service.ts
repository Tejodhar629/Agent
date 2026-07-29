import { ChatOpenAI } from "@langchain/openai";
import { 
  ChatPromptTemplate, 
  SystemMessagePromptTemplate, 
  HumanMessagePromptTemplate, 
  MessagesPlaceholder 
} from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { RAGService } from "./rag.service";
import { SYSTEM_PROMPT } from "./prompt";
import { maskPII } from "./pii_masking";

export class ChatService {
  private primaryLlm: ChatOpenAI;
  private fallbackLlm: ChatOpenAI;
  private ragService: RAGService;

  constructor(ragService: RAGService) {
    this.ragService = ragService;
    
    // Primary LLM Engine: GPT-4o / Claude 3.5 Sonnet
    // Strict temperature and SSE Streaming for sub-2-second Time-To-First-Token (TTFT)
    this.primaryLlm = new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: 0.1, // Low temp for factual accuracy / zero-hallucination
      streaming: true,
      maxRetries: 1, // Fail fast to trigger fallback
    });

    // Graceful Degradation: Secondary / Local Engine fallback for 99.9% SLA
    this.fallbackLlm = new ChatOpenAI({
      modelName: "llama3-8b-8192", // Groq endpoint or local deployment
      configuration: { baseURL: "https://api.groq.com/openai/v1" },
      temperature: 0.1,
      streaming: true,
    });
  }

  /**
   * Main conversational orchestrator mapping inputs, context, and memory.
   * Returns a streaming response for the UI frontend.
   */
  async generateChatResponseStream(userQuery: string, userProfile: any, chatHistory: any[] = []) {
    // 1. Data Loss Prevention (DPDP Act Compliance)
    // Mask Aadhaar, PAN, and phone numbers before the query enters the pipeline
    const safeQuery = maskPII(userQuery);

    // 2. Retrieve Dynamic Proactive Recommendations & Context via RAG
    const context = await this.ragService.retrieveContext(safeQuery, userProfile);

    // 3. Assemble the Contextual Prompt
    const prompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(SYSTEM_PROMPT),
      new MessagesPlaceholder("chat_history"),
      HumanMessagePromptTemplate.fromTemplate("{query}")
    ]);

    // 4. Build Execution Graph with Fallbacks
    const chain = RunnableSequence.from([
      prompt,
      this.primaryLlm.withFallbacks({ fallbacks: [this.fallbackLlm] }),
      new StringOutputParser(),
    ]);

    // 5. Execute AI Generation as a Stream (SSE)
    // Note: Semantic Caching via Redis (GPTCache) can be evaluated here to bypass LLM generation
    const stream = await chain.stream({
      user_profile: JSON.stringify(userProfile, null, 2),
      retrieved_context: context,
      chat_history: chatHistory, // Short-term session memory
      query: safeQuery
    });

    return stream;
  }
}
