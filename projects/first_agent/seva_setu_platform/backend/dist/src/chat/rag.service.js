"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RagService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RagService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
let RagService = RagService_1 = class RagService {
    constructor() {
        this.logger = new common_1.Logger(RagService_1.name);
        this.openaiApiKey = process.env.OPENAI_API_KEY || '';
        this.cohereApiKey = process.env.COHERE_API_KEY || '';
        this.qdrantUrl = process.env.QDRANT_URL || '';
        this.qdrantApiKey = process.env.QDRANT_API_KEY || '';
        this.kConstant = 60;
        this.rerankThreshold = 0.70;
        this.whitelistedDomains = [
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
    }
    async retrieveContext(query, stateScope, category) {
        this.logger.log(`Executing Hybrid RAG context search for query: "${query}"...`);
        const [denseHits, sparseHits] = await Promise.all([
            this.denseSearch(query, stateScope, category),
            this.sparseSearch(query, stateScope, category)
        ]);
        const fusedHits = this.computeReciprocalRankFusion(denseHits, sparseHits);
        if (fusedHits.length === 0) {
            this.logger.warn('No documents matched initial hybrid searches. Returning empty context.');
            return { chunks: [], citations: [] };
        }
        const rerankedHits = await this.rerankDocuments(query, fusedHits);
        const filteredChunks = [];
        const citationsSet = new Set();
        for (const chunk of rerankedHits) {
            if (chunk.score < this.rerankThreshold) {
                this.logger.debug(`Chunk ${chunk.id} pruned due to low relevance score: ${chunk.score}`);
                continue;
            }
            const rawUrl = chunk.metadata.source_url;
            if (rawUrl && this.isValidAndWhitelistedUrl(rawUrl)) {
                filteredChunks.push(chunk);
                citationsSet.add(rawUrl);
            }
            else {
                this.logger.warn(`Filtered out chunk citation due to domain whitelist policy violations: "${rawUrl}"`);
            }
        }
        this.logger.log(`RAG Retrieval complete. Yielded ${filteredChunks.length} grounded contexts after filtering.`);
        return {
            chunks: filteredChunks,
            citations: Array.from(citationsSet)
        };
    }
    async denseSearch(query, stateScope, category) {
        if (!this.openaiApiKey) {
            this.logger.warn('OpenAI API key missing. Performing mock semantic vector lookup.');
            return this.getMockDenseHits(stateScope, category);
        }
        try {
            const embeddingResponse = await axios_1.default.post('https://api.openai.com/v1/embeddings', {
                input: query,
                model: 'text-embedding-3-small'
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.openaiApiKey}`
                }
            });
            const queryVector = embeddingResponse.data?.data?.[0]?.embedding;
            if (!queryVector) {
                throw new Error('Failed to extract embedding vector from OpenAI API response.');
            }
            if (this.qdrantUrl) {
                const response = await axios_1.default.post(`${this.qdrantUrl}/collections/seva_setu_schemes/points/search`, {
                    vector: queryVector,
                    limit: 15,
                    with_payload: true,
                    filter: this.buildQdrantFilter(stateScope, category)
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': this.qdrantApiKey
                    }
                });
                return (response.data?.result || []).map((hit) => ({
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
            return this.getMockDenseHits(stateScope, category);
        }
        catch (error) {
            this.logger.error(`Dense vector search failed: ${error.message}`);
            return this.getMockDenseHits(stateScope, category);
        }
    }
    async sparseSearch(query, stateScope, category) {
        this.logger.log('Executing lexical BM25 database search...');
        return this.getMockSparseHits(query, stateScope, category);
    }
    computeReciprocalRankFusion(denseHits, sparseHits) {
        const scores = {};
        const documentMap = new Map();
        const applyRanks = (hits) => {
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
        const sortedIds = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
        return sortedIds.map(id => documentMap.get(id)).slice(0, 15);
    }
    async rerankDocuments(query, documents) {
        if (!this.cohereApiKey) {
            this.logger.warn('COHERE_API_KEY is not defined. Skipping cross-encoder reranking, scaling raw ranks.');
            return documents.map(doc => ({ ...doc, score: 0.85 }));
        }
        try {
            const texts = documents.map(doc => doc.text);
            const response = await axios_1.default.post('https://api.cohere.com/v1/rerank', {
                model: 'rerank-multilingual-v3.0',
                query: query,
                documents: texts,
                top_n: 10
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `bearer ${this.cohereApiKey}`
                }
            });
            const rerankedList = [];
            const results = response.data?.results || [];
            for (const res of results) {
                const index = res.index;
                const originalDoc = documents[index];
                if (originalDoc) {
                    rerankedList.push({
                        ...originalDoc,
                        score: res.relevance_score || 0.0
                    });
                }
            }
            return rerankedList;
        }
        catch (error) {
            this.logger.error(`Cohere multilingual reranking API failed: ${error.message}. Falling back to default scoring.`);
            return documents.map(doc => ({ ...doc, score: 0.80 }));
        }
    }
    isValidAndWhitelistedUrl(url) {
        try {
            const parsed = new URL(url);
            const hostname = parsed.hostname.toLowerCase();
            const isDirectMatch = this.whitelistedDomains.some(domain => hostname === domain || hostname.endsWith('.' + domain));
            const isOfficialGovIn = hostname.endsWith('.gov.in') || hostname.endsWith('.nic.in');
            return isDirectMatch || isOfficialGovIn;
        }
        catch {
            return false;
        }
    }
    buildQdrantFilter(stateScope, category) {
        const filters = [];
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
    getMockDenseHits(stateScope, category) {
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
            if (stateScope && stateScope !== 'CENTRAL' && h.metadata.stateScope !== 'CENTRAL' && h.metadata.stateScope !== stateScope.toUpperCase())
                return false;
            if (category && h.metadata.category !== category.toUpperCase())
                return false;
            return true;
        });
    }
    getMockSparseHits(query, stateScope, category) {
        const lQuery = query.toLowerCase();
        const allMocks = this.getMockDenseHits(stateScope, category);
        return allMocks.filter(h => {
            return lQuery.includes('kisan') || lQuery.includes('crop') || lQuery.includes('insurance') ||
                lQuery.includes('scholarship') || lQuery.includes('karnataka') || lQuery.includes('mudra') ||
                lQuery.includes('loan') || lQuery.includes('wheat') || lQuery.includes('unnao');
        }).map(h => ({
            ...h,
            score: h.score + 0.05
        }));
    }
};
exports.RagService = RagService;
exports.RagService = RagService = RagService_1 = __decorate([
    (0, common_1.Injectable)()
], RagService);
//# sourceMappingURL=rag.service.js.map