"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const openai_1 = require("@langchain/openai");
const prompts_1 = require("@langchain/core/prompts");
const output_parsers_1 = require("@langchain/core/output_parsers");
const runnables_1 = require("@langchain/core/runnables");
const prompt_1 = require("./prompt");
const pii_masking_1 = require("./pii_masking");
class ChatService {
    constructor(ragService) {
        this.ragService = ragService;
        this.primaryLlm = new openai_1.ChatOpenAI({
            modelName: "gpt-4o",
            temperature: 0.1,
            streaming: true,
            maxRetries: 1,
        });
        this.fallbackLlm = new openai_1.ChatOpenAI({
            modelName: "llama3-8b-8192",
            configuration: { baseURL: "https://api.groq.com/openai/v1" },
            temperature: 0.1,
            streaming: true,
        });
    }
    async generateChatResponseStream(userQuery, userProfile, chatHistory = []) {
        const safeQuery = (0, pii_masking_1.maskPII)(userQuery);
        const context = await this.ragService.retrieveContext(safeQuery, userProfile);
        const prompt = prompts_1.ChatPromptTemplate.fromMessages([
            prompts_1.SystemMessagePromptTemplate.fromTemplate(prompt_1.SYSTEM_PROMPT),
            new prompts_1.MessagesPlaceholder("chat_history"),
            prompts_1.HumanMessagePromptTemplate.fromTemplate("{query}")
        ]);
        const chain = runnables_1.RunnableSequence.from([
            prompt,
            this.primaryLlm.withFallbacks({ fallbacks: [this.fallbackLlm] }),
            new output_parsers_1.StringOutputParser(),
        ]);
        const stream = await chain.stream({
            user_profile: JSON.stringify(userProfile, null, 2),
            retrieved_context: context,
            chat_history: chatHistory,
            query: safeQuery
        });
        return stream;
    }
}
exports.ChatService = ChatService;
//# sourceMappingURL=chat.service.js.map