export interface BhashiniTranslationResult {
    translatedText: string;
    sourceLanguage: string;
    targetLanguage: string;
    latencyMs: number;
    characterCount: number;
}
export interface BhashiniAsrResult {
    transcribedText: string;
    sourceLanguage: string;
    confidenceScore: number;
    latencyMs: number;
}
export interface BhashiniTtsResult {
    audioContent: string;
    targetLanguage: string;
    audioFormat: string;
    latencyMs: number;
}
export declare class BhashiniService {
    private readonly logger;
    private readonly apiKey;
    private readonly userId;
    private readonly pipelineId;
    private readonly gatewayUrl;
    private readonly inferenceUrl;
    constructor();
    getPipelineConfig(taskType: 'asr' | 'translation' | 'tts', sourceLang: string, targetLang?: string): Promise<any>;
    translate(sourceLang: string, targetLang: string, text: string): Promise<BhashiniTranslationResult>;
    asr(sourceLang: string, audioContentBase64: string, audioFormat?: string, samplingRate?: number): Promise<BhashiniAsrResult>;
    tts(targetLang: string, text: string, gender?: 'male' | 'female'): Promise<BhashiniTtsResult>;
}
