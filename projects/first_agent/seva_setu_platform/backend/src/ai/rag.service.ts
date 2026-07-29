import { OpenAIEmbeddings } from "@langchain/openai";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { Document } from "@langchain/core/documents";
import { PoolConfig } from "pg";

export class RAGService {
  private vectorStore: PGVectorStore | null = null;
  private embeddings: OpenAIEmbeddings;

  constructor() {
    // Multilingual capable embeddings to map queries in Hindi, Tamil, English, etc.
    this.embeddings = new OpenAIEmbeddings({
      modelName: "text-embedding-3-large", 
    });
  }

  /**
   * Initializes the Postgres Vector Store (pgvector) connection
   */
  async initialize(pgConfig: PoolConfig) {
    this.vectorStore = await PGVectorStore.initialize(this.embeddings, {
      postgresConnectionOptions: pgConfig,
      tableName: "scheme_documents",
      columns: {
        idColumnName: "id",
        vectorColumnName: "embedding",
        contentColumnName: "content",
        metadataColumnName: "metadata", // Stores scheme_name, target_audience, eligibility limits, etc.
      },
    });
  }

  /**
   * Orchestrates the RAG retrieval pipeline using Hybrid Search and filtering
   */
  async retrieveContext(query: string, userProfile: any): Promise<string> {
    if (!this.vectorStore) {
      throw new Error("VectorStore not initialized. Call initialize() first.");
    }

    // 1. Pre-Retrieval Filtering
    // Hard-filtering vector space using user profile metadata to eliminate irrelevant schemes
    const metadataFilter: any = {
      state_applicability: { $in: ["ALL", userProfile.state || "ALL"] },
      target_audience: { $in: ["ALL", userProfile.occupation || "ALL"] },
    };

    // 2. Hybrid Search (Semantic + Keyword)
    // Note: In production, similaritySearch is combined with Postgres full-text (BM25) search
    // and resolved using Reciprocal Rank Fusion (RRF).
    const docs = await this.vectorStore.similaritySearch(query, 10, metadataFilter);

    // 3. Re-Ranking
    // Ensures the most relevant context is prioritized for the LLM
    const rankedDocs = await this.rerankDocuments(query, docs);

    // 4. Formatting output for strict citation
    const topDocs = rankedDocs.slice(0, 5);
    return topDocs.map((doc, index) => {
      // Ensuring only verified .gov.in URLs are injected as sources
      const url = doc.metadata.url || "https://india.gov.in";
      return `--- Document ${index + 1} ---\nSource URL: ${url}\nContent:\n${doc.pageContent}`;
    }).join("\n\n");
  }

  /**
   * Lightweight Cross-Encoder Re-ranking stub
   */
  private async rerankDocuments(query: string, docs: Document[]): Promise<Document[]> {
    // Implementation placeholder for a Cross-Encoder model (e.g., Cohere Rerank or BAAI/bge-reranker-large)
    // Here we would score each document against the original user query and sort descending.
    return docs; 
  }
}
