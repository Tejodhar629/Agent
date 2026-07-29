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
export declare class RagService {
    private readonly logger;
    private readonly openaiApiKey;
    private readonly cohereApiKey;
    private readonly qdrantUrl;
    private readonly qdrantApiKey;
    private readonly kConstant;
    private readonly rerankThreshold;
    private readonly whitelistedDomains;
    retrieveContext(query: string, stateScope?: string, category?: string): Promise<SearchResult>;
    private denseSearch;
    private sparseSearch;
    private computeReciprocalRankFusion;
    private rerankDocuments;
    isValidAndWhitelistedUrl(url: string): boolean;
    private buildQdrantFilter;
    private getMockDenseHits;
    private getMockSparseHits;
}
