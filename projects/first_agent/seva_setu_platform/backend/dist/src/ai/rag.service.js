"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RAGService = void 0;
const openai_1 = require("@langchain/openai");
const pgvector_1 = require("@langchain/community/vectorstores/pgvector");
class RAGService {
    constructor() {
        this.vectorStore = null;
        this.embeddings = new openai_1.OpenAIEmbeddings({
            modelName: "text-embedding-3-large",
        });
    }
    async initialize(pgConfig) {
        this.vectorStore = await pgvector_1.PGVectorStore.initialize(this.embeddings, {
            postgresConnectionOptions: pgConfig,
            tableName: "scheme_documents",
            columns: {
                idColumnName: "id",
                vectorColumnName: "embedding",
                contentColumnName: "content",
                metadataColumnName: "metadata",
            },
        });
    }
    async retrieveContext(query, userProfile) {
        if (!this.vectorStore) {
            throw new Error("VectorStore not initialized. Call initialize() first.");
        }
        const metadataFilter = {
            state_applicability: { $in: ["ALL", userProfile.state || "ALL"] },
            target_audience: { $in: ["ALL", userProfile.occupation || "ALL"] },
        };
        const docs = await this.vectorStore.similaritySearch(query, 10, metadataFilter);
        const rankedDocs = await this.rerankDocuments(query, docs);
        const topDocs = rankedDocs.slice(0, 5);
        return topDocs.map((doc, index) => {
            const url = doc.metadata.url || "https://india.gov.in";
            return `--- Document ${index + 1} ---\nSource URL: ${url}\nContent:\n${doc.pageContent}`;
        }).join("\n\n");
    }
    async rerankDocuments(query, docs) {
        return docs;
    }
}
exports.RAGService = RAGService;
//# sourceMappingURL=rag.service.js.map