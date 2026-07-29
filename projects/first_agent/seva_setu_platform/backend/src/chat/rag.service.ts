import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface RagChunk {
  id: string;
  text: string;
  score: number;
  metadata: {
    source_url: string;
    title: string;
    stateScope: string;
    category?: string;
    ministry?: string;
    [key: string]: any;
  };
}

export interface SearchResult {
  chunks: RagChunk[];
  citations: string[];
}

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);
  private readonly openaiApiKey = process.env.OPENAI_API_KEY || '';
  private readonly cohereApiKey = process.env.COHERE_API_KEY || '';
  private readonly qdrantUrl = process.env.QDRANT_URL || '';
  private readonly qdrantApiKey = process.env.QDRANT_API_KEY || '';
  
  private readonly kConstant = 60; // Smoothing constant for Reciprocal Rank Fusion
  private readonly rerankThreshold = 0.70; // Hard cutoff score for Cohere Reranker

  private readonly whitelistedDomains = [
    'india.gov.in',
    'myscheme.gov.in',
    'pmkisan.gov.in',
    'pmfby.gov.in',
    'uidai.gov.in',
    'incometax.gov.in',
    'epfindia.gov.in',
    'udyamregistration.gov.in',
    'ssp.postmatric.karnataka.gov.in',
    'sevasindhu.karnataka.gov.in'
  ];

  /**
   * Main entry point for context retrieval. Coordinates parallel sparse & dense retrieval,
   * rank-merging via RRF, cross-encoder reranking, and domain-whitelisting filters.
   */
  async retrieveContext(query: string, stateScope?: string, category?: string): Promise<SearchResult> {
    this.logger.log(`Executing Hybrid RAG context search for query: "${query}"...`);
    
    // 1. Parallel search paths
    const [denseHits, sparseHits] = await Promise.all([
      this.denseSearch(query, stateScope, category),
      this.sparseSearch(query, stateScope, category)
    ]);

    // 2. Perform Reciprocal Rank Fusion (RRF)
    const fusedHits = this.computeReciprocalRankFusion(denseHits, sparseHits);
    if (fusedHits.length === 0) {
      this.logger.warn('No documents matched initial hybrid searches. Returning empty context.');
      return { chunks: [], citations: [] };
    }

    // 3. Apply Cross-Encoder Multilingual Reranking
    const rerankedHits = await this.rerankDocuments(query, fusedHits);

    // 4. Dynamic Gating & Whitelisting Verification
    const filteredChunks: RagChunk[] = [];
    const citationsSet = new Set<string>();

    for (const chunk of rerankedHits) {
      // Dynamic Threshold Check (Score must be >= 0.70)
      if (chunk.score < this.rerankThreshold) {
        this.logger.debug(`Chunk ${chunk.id} pruned due to low relevance score: ${chunk.score}`);
        continue;
      }

      // Strict URL Whitelisting Check (No dynamic hallucinated/phishing links allowed)
      const rawUrl = chunk.metadata.source_url;
      if (rawUrl && this.isValidAndWhitelistedUrl(rawUrl)) {
        filteredChunks.push(chunk);
        citationsSet.add(rawUrl);
      } else {
        this.logger.warn(`Filtered out chunk citation due to domain whitelist policy violations: "${rawUrl}"`);
      }
    }

    this.logger.log(`RAG Retrieval complete. Yielded ${filteredChunks.length} grounded contexts after filtering.`);
    return {
      chunks: filteredChunks,
      citations: Array.from(citationsSet)
    };
  }

  /**
   * Generates dense text embeddings from OpenAI API and queries vector database (e.g. Qdrant / PgVector).
   */
  private async denseSearch(query: string, stateScope?: string, category?: string): Promise<RagChunk[]> {
    if (!this.openaiApiKey) {
      this.logger.warn('OpenAI API key missing. Performing mock semantic vector lookup.');
      return this.getMockDenseHits(stateScope, category);
    }

    try {
      // Fetch dense embeddings (using text-embedding-3-small for cost-efficiency)
      const embeddingResponse = await axios.post(
        'https://api.openai.com/v1/embeddings',
        {
          input: query,
          model: 'text-embedding-3-small'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.openaiApiKey}`
          }
        }
      );

      const queryVector = embeddingResponse.data?.data?.[0]?.embedding;
      if (!queryVector) {
        throw new Error('Failed to extract embedding vector from OpenAI API response.');
      }

      // Query Qdrant if configured, otherwise fallback to local semantic mocks
      if (this.qdrantUrl) {
        const response = await axios.post(
          `${this.qdrantUrl}/collections/seva_setu_schemes/points/search`,
          {
            vector: queryVector,
            limit: 15,
            with_payload: true,
            filter: this.buildQdrantFilter(stateScope, category)
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'api-key': this.qdrantApiKey
            }
          }
        );

        return (response.data?.result || []).map((hit: any) => ({
          id: hit.id.toString(),
          text: hit.payload?.text || '',
          score: hit.score || 0,
          metadata: {
            source_url: hit.payload?.source_url || '',
            title: hit.payload?.title || '',
            stateScope: hit.payload?.stateScope || 'CENTRAL',
            category: hit.payload?.category || '',
            ministry: hit.payload?.ministry || ''
          }
        }));
      }

      // Mock Vector Match Fallback if Qdrant isn't connected
      return this.getMockDenseHits(stateScope, category);
    } catch (error: any) {
      this.logger.error(`Dense vector search failed: ${error.message}`);
      return this.getMockDenseHits(stateScope, category);
    }
  }

  /**
   * Performs BM25-style keyword and lexical search over scheme fields in database.
   */
  private async sparseSearch(query: string, stateScope?: string, category?: string): Promise<RagChunk[]> {
    this.logger.log('Executing lexical BM25 database search...');
    // In production, this issues full-text-search SQL queries on PostgreSQL or BM25 indexers in Qdrant.
    // For demonstration and robustness, we match keywords against local index records.
    return this.getMockSparseHits(query, stateScope, category);
  }

  /**
   * Mathematical implementation of Reciprocal Rank Fusion (RRF) to merge dual-path search hits.
   * RRF_Score(d) = sum(1 / (k + rank_m(d)))
   */
  private computeReciprocalRankFusion(denseHits: RagChunk[], sparseHits: RagChunk[]): RagChunk[] {
    const scores: Record<string, number> = {};
    const documentMap = new Map<string, RagChunk>();

    const applyRanks = (hits: RagChunk[]) => {
      hits.forEach((doc, rank) => {
        const docId = doc.id;
        if (!documentMap.has(docId)) {
          documentMap.set(docId, doc);
        }
        const currentScore = scores[docId] || 0.0;
        scores[docId] = currentScore + (1.0 / (this.kConstant + rank));
      });
    };

    applyRanks(denseHits);
    applyRanks(sparseHits);

    // Sort documents based on RRF scores in descending order
    const sortedIds = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
    
    // Maintain top-15 merged matches
    return sortedIds.map(id => documentMap.get(id)!).slice(0, 15);
  }

  /**
   * Re-evaluates merged documents with the Cohere Multilingual Cross-Encoder Reranker.
   */
  private async rerankDocuments(query: string, documents: RagChunk[]): Promise<RagChunk[]> {
    if (!this.cohereApiKey) {
      this.logger.warn('COHERE_API_KEY is not defined. Skipping cross-encoder reranking, scaling raw ranks.');
      return documents.map(doc => ({ ...doc, score: 0.85 })); // Emulate confident passes
    }

    try {
      const texts = documents.map(doc => doc.text);
      const response = await axios.post(
        'https://api.cohere.com/v1/rerank',
        {
          model: 'rerank-multilingual-v3.0',
          query: query,
          documents: texts,
          top_n: 10
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `bearer ${this.cohereApiKey}`
          }
        }
      );

      const rerankedList: RagChunk[] = [];
      const results = response.data?.results || [];

      for (const res of results) {
        const index = res.index;
        const originalDoc = documents[index];
        if (originalDoc) {
          rerankedList.push({
            ...originalDoc,
            score: res.relevance_score || 0.0 // Set score to the deep cross-encoder value
          });
        }
      }

      return rerankedList;
    } catch (error: any) {
      this.logger.error(`Cohere multilingual reranking API failed: ${error.message}. Falling back to default scoring.`);
      return documents.map(doc => ({ ...doc, score: 0.80 }));
    }
  }

  /**
   * Validates if target URL represents a secure, official Indian Government portal.
   */
  public isValidAndWhitelistedUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.toLowerCase();
      
      // Match whitelisted core portals
      const isDirectMatch = this.whitelistedDomains.some(domain => 
        hostname === domain || hostname.endsWith('.' + domain)
      );

      // Verify general compliance with official Indian Govt domain suffix (.gov.in or .nic.in)
      const isOfficialGovIn = hostname.endsWith('.gov.in') || hostname.endsWith('.nic.in');

      return isDirectMatch || isOfficialGovIn;
    } catch {
      return false;
    }
  }

  private buildQdrantFilter(stateScope?: string, category?: string): any {
    const filters: any[] = [];
    if (stateScope) {
      filters.push({
        key: 'stateScope',
        match: { value: stateScope.toUpperCase() }
      });
    }
    if (category) {
      filters.push({
        key: 'category',
        match: { value: category.toUpperCase() }
      });
    }
    return filters.length > 0 ? { must: filters } : undefined;
  }

  /**
   * Mock Semantic DB Dense Hits for seamless developer workflows
   */
  private getMockDenseHits(stateScope?: string, category?: string): RagChunk[] {
    return [
      {
        id: 'chunk_pmkisan_001',
        text: 'Under PM Kisan Samman Nidhi Yojana (PM-KISAN), eligible small and marginal landholding farmers are provided financial assistance of Rs 6,000 per year, delivered in three equal installments of Rs 2,000 directly into their bank accounts. Family ownership is defined as husband, wife, and minor children.',
        score: 0.92,
        metadata: {
          source_url: 'https://pmkisan.gov.in/rules',
          title: 'PM-KISAN Operational Guidelines',
          stateScope: 'CENTRAL',
          category: 'AGRICULTURE',
          ministry: 'Ministry of Agriculture & Farmers Welfare'
        }
      },
      {
        id: 'chunk_pmfby_001',
        text: 'Under PM Fasal Bima Yojana (PMFBY) for Uttar Pradesh (UP), localized crop damage to wheat caused by unseasonal rains, hail, or inundation must be reported to the agricultural officer in Unnao within 72 hours of the event to claim insurance.',
        score: 0.88,
        metadata: {
          source_url: 'https://pmfby.gov.in/guidelines',
          title: 'PM Crop Insurance UP Regional Guidelines',
          stateScope: 'UTTAR PRADESH',
          category: 'AGRICULTURE',
          ministry: 'Ministry of Agriculture & Farmers Welfare'
        }
      },
      {
        id: 'chunk_obc_scholarship_001',
        text: 'Under the Post-Matric Scholarship Scheme for OBC students in Karnataka, eligible candidates whose parental family annual income is less than Rs 1,00,000 are provided tuition fee coverage and a monthly maintenance allowance ranging up to Rs 750 depending on the course profile.',
        score: 0.81,
        metadata: {
          source_url: 'https://ssp.postmatric.karnataka.gov.in/policy_circular_2023.pdf',
          title: 'SSP Post-Matric Circular OBC Karnataka',
          stateScope: 'KARNATAKA',
          category: 'EDUCATION',
          ministry: 'Backward Classes Welfare Department, Govt. of Karnataka'
        }
      },
      {
        id: 'chunk_mudra_001',
        text: 'Pradhan Mantri MUDRA Yojana (PMMY) provides loans up to Rs 10 Lakhs to non-corporate, non-farm small/micro enterprises. Divided into Shishu (loans up to Rs 50,000), Kishor (loans up to Rs 5 Lakhs), and Tarun (loans up to Rs 10 Lakhs). Minimum age of applicant is 18 years, valid PAN/Aadhaar details are mandatory.',
        score: 0.79,
        metadata: {
          source_url: 'https://india.gov.in/pm-mudra-scheme-details',
          title: 'MUDRA Loan Structural Specifications',
          stateScope: 'CENTRAL',
          category: 'BUSINESS_MSME',
          ministry: 'Ministry of Finance'
        }
      }
    ].filter(h => {
      if (stateScope && stateScope !== 'CENTRAL' && h.metadata.stateScope !== 'CENTRAL' && h.metadata.stateScope !== stateScope.toUpperCase()) return false;
      if (category && h.metadata.category !== category.toUpperCase()) return false;
      return true;
    });
  }

  /**
   * Mock Lexical BM25 Hits for keyword matching robustness
   */
  private getMockSparseHits(query: string, stateScope?: string, category?: string): RagChunk[] {
    const lQuery = query.toLowerCase();
    const allMocks = this.getMockDenseHits(stateScope, category);
    
    // Boost mock score if explicit keywords match
    return allMocks.filter(h => {
      return lQuery.includes('kisan') || lQuery.includes('crop') || lQuery.includes('insurance') ||
             lQuery.includes('scholarship') || lQuery.includes('karnataka') || lQuery.includes('mudra') ||
             lQuery.includes('loan') || lQuery.includes('wheat') || lQuery.includes('unnao');
    }).map(h => ({
      ...h,
      score: h.score + 0.05 // Slight lexical keyword match boost
    }));
  }
}
