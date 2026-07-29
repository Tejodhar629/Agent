import { PoolConfig } from "pg";
export declare class RAGService {
    private vectorStore;
    private embeddings;
    constructor();
    initialize(pgConfig: PoolConfig): Promise<void>;
    retrieveContext(query: string, userProfile: any): Promise<string>;
    private rerankDocuments;
}
