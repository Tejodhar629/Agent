"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BhashiniService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BhashiniService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
let BhashiniService = BhashiniService_1 = class BhashiniService {
    constructor() {
        this.logger = new common_1.Logger(BhashiniService_1.name);
        this.apiKey = process.env.BHASHINI_API_KEY || '';
        this.userId = process.env.BHASHINI_USER_ID || '';
        this.pipelineId = process.env.BHASHINI_PIPELINE_ID || '64392f708e330e0d0b000001';
        this.gatewayUrl = process.env.BHASHINI_GATEWAY_URL || 'https://meity.bhashini.gov.in';
        this.inferenceUrl = process.env.BHASHINI_INFERENCE_URL || 'https://dhruva.bhashini.gov.in/services/inference/pipeline';
    }
    async getPipelineConfig(taskType, sourceLang, targetLang) {
        if (!this.apiKey || !this.userId) {
            this.logger.warn('Bhashini API credentials not configured. Returning fallback configurations.');
            return {
                serviceId: taskType === 'translation' ? 'ai4bharat/indictrans-v2-all-to-all' :
                    taskType === 'asr' ? `ai4bharat/whisper-medium-${sourceLang}` : `ai4bharat/indic-tts-coqui-${sourceLang}`,
                modelId: `mock-model-${taskType}-${sourceLang}`,
            };
        }
        try {
            const pipelineTasks = [];
            if (taskType === 'asr') {
                pipelineTasks.push({
                    taskType: 'asr',
                    config: { language: { sourceLanguage: sourceLang } }
                });
            }
            else if (taskType === 'translation') {
                pipelineTasks.push({
                    taskType: 'translation',
                    config: { language: { sourceLanguage: sourceLang, targetLanguage: targetLang || 'en' } }
                });
            }
            else if (taskType === 'tts') {
                pipelineTasks.push({
                    taskType: 'tts',
                    config: { language: { sourceLanguage: sourceLang } }
                });
            }
            const response = await axios_1.default.post(`${this.gatewayUrl}/ulca/apis/v1/model/getModelsPipeline`, {
                pipelineTasks,
                pipelineRequestConfig: { pipelineId: this.pipelineId }
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'ulcaApiKey': this.apiKey,
                    'userID': this.userId
                }
            });
            const pipelineResponseConfig = response.data?.pipelineResponseConfig?.[0];
            const modelConfig = pipelineResponseConfig?.config?.[0];
            return {
                serviceId: modelConfig?.serviceId || '',
                modelId: modelConfig?.modelId || '',
                inferenceApiKey: response.data?.pipelineInferenceAPIEndPoint?.inferenceApiKey?.value || '',
                inferenceUrl: response.data?.pipelineInferenceAPIEndPoint?.callbackUrl || this.inferenceUrl
            };
        }
        catch (error) {
            this.logger.error(`Failed to fetch Bhashini pipeline config for ${taskType}: ${error.message}`);
            throw new Error(`Bhashini config retrieval failed: ${error.message}`);
        }
    }
    async translate(sourceLang, targetLang, text) {
        const startTime = Date.now();
        this.logger.log(`Translating text from ${sourceLang} to ${targetLang} (length: ${text.length})...`);
        if (sourceLang === targetLang) {
            return {
                translatedText: text,
                sourceLanguage: sourceLang,
                targetLanguage: targetLang,
                latencyMs: 0,
                characterCount: text.length
            };
        }
        if (!this.apiKey) {
            this.logger.warn('Bhashini API keys not present. Utilizing development localization fallback mock.');
            const mockTranslations = {
                'गेहूं की फसल नुकसान का बीमा कैसे मिलेगा उन्नाव में': 'How to get crop insurance for wheat loss in Unnao?',
                'मुझे व्यवसाय शुरू करने के लिए मुद्रा लोन चाहिए।': 'I want a MUDRA loan to start a business.',
                'Please tell me the eligibility for Pradhan Mantri Kisan Samman Nidhi Yojana.': 'कृपया मुझे प्रधानमंत्री किसान सम्मान निधि योजना की पात्रता बताएं।',
                'You are eligible for MUDRA loan. Please enter your PAN to proceed.': 'आप मुद्रा ऋण के लिए पात्र हैं। आगे बढ़ने के लिए कृपया अपना पैन दर्ज करें।',
            };
            const translatedText = mockTranslations[text]?.[targetLang] ||
                mockTranslations[text] ||
                `[Translated ${sourceLang}->${targetLang}]: ${text}`;
            return {
                translatedText: typeof translatedText === 'string' ? translatedText : JSON.stringify(translatedText),
                sourceLanguage: sourceLang,
                targetLanguage: targetLang,
                latencyMs: 150,
                characterCount: text.length
            };
        }
        try {
            const config = await this.getPipelineConfig('translation', sourceLang, targetLang);
            const payload = {
                pipelineTasks: [
                    {
                        taskType: 'translation',
                        config: {
                            language: {
                                sourceLanguage: sourceLang,
                                targetLanguage: targetLang
                            },
                            serviceId: config.serviceId
                        }
                    }
                ],
                inputData: {
                    input: [{ source: text }]
                }
            };
            const response = await axios_1.default.post(config.inferenceUrl || this.inferenceUrl, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': config.inferenceApiKey || this.apiKey
                }
            });
            const translatedText = response.data?.pipelineResponse?.[0]?.output?.[0]?.target || '';
            const latencyMs = Date.now() - startTime;
            this.logger.log(`Translation completed successfully in ${latencyMs}ms.`);
            return {
                translatedText,
                sourceLanguage: sourceLang,
                targetLanguage: targetLang,
                latencyMs,
                characterCount: text.length
            };
        }
        catch (error) {
            this.logger.error(`Bhashini NMT API Call Failed: ${error.message}`);
            throw new Error(`Bhashini Translation API execution failed: ${error.message}`);
        }
    }
    async asr(sourceLang, audioContentBase64, audioFormat = 'wav', samplingRate = 16000) {
        const startTime = Date.now();
        this.logger.log(`Transcribing speech audio stream in ${sourceLang} with Bhashini ASR...`);
        if (!this.apiKey) {
            this.logger.warn('Bhashini API credentials not found. Serving mock ASR response.');
            return {
                transcribedText: 'गेहूं की फसल नुकसान का बीमा कैसे मिलेगा उन्नाव में',
                sourceLanguage: sourceLang,
                confidenceScore: 0.95,
                latencyMs: 380
            };
        }
        try {
            const config = await this.getPipelineConfig('asr', sourceLang);
            const payload = {
                pipelineTasks: [
                    {
                        taskType: 'asr',
                        config: {
                            language: { sourceLanguage: sourceLang },
                            serviceId: config.serviceId,
                            audioFormat: audioFormat,
                            samplingRate: samplingRate
                        }
                    }
                ],
                inputData: {
                    audio: [{ audioContent: audioContentBase64 }]
                }
            };
            const response = await axios_1.default.post(config.inferenceUrl || this.inferenceUrl, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': config.inferenceApiKey || this.apiKey
                }
            });
            const transcribedText = response.data?.pipelineResponse?.[0]?.output?.[0]?.source || '';
            const latencyMs = Date.now() - startTime;
            this.logger.log(`ASR transcription completed successfully in ${latencyMs}ms.`);
            return {
                transcribedText,
                sourceLanguage: sourceLang,
                confidenceScore: response.data?.pipelineResponse?.[0]?.output?.[0]?.confidence || 0.90,
                latencyMs
            };
        }
        catch (error) {
            this.logger.error(`Bhashini ASR API Call Failed: ${error.message}`);
            throw new Error(`Bhashini ASR API execution failed: ${error.message}`);
        }
    }
    async tts(targetLang, text, gender = 'female') {
        const startTime = Date.now();
        this.logger.log(`Synthesizing text of length ${text.length} into continuous speech stream for ${targetLang}...`);
        if (!this.apiKey) {
            this.logger.warn('Bhashini API credentials missing. Returning static mock base64 audio stream.');
            const mockWavBase64 = 'UklGRiYAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAA';
            return {
                audioContent: mockWavBase64,
                targetLanguage: targetLang,
                audioFormat: 'wav',
                latencyMs: 200
            };
        }
        try {
            const config = await this.getPipelineConfig('tts', targetLang);
            const payload = {
                pipelineTasks: [
                    {
                        taskType: 'tts',
                        config: {
                            language: { sourceLanguage: targetLang },
                            serviceId: config.serviceId,
                            gender: gender
                        }
                    }
                ],
                inputData: {
                    input: [{ source: text }]
                }
            };
            const response = await axios_1.default.post(config.inferenceUrl || this.inferenceUrl, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': config.inferenceApiKey || this.apiKey
                }
            });
            const audioContent = response.data?.pipelineResponse?.[0]?.output?.[0]?.audioContent || '';
            const audioFormat = response.data?.pipelineResponse?.[0]?.output?.[0]?.audioFormat || 'wav';
            const latencyMs = Date.now() - startTime;
            this.logger.log(`TTS synthesis completed successfully in ${latencyMs}ms.`);
            return {
                audioContent,
                targetLanguage: targetLang,
                audioFormat,
                latencyMs
            };
        }
        catch (error) {
            this.logger.error(`Bhashini TTS API Call Failed: ${error.message}`);
            throw new Error(`Bhashini TTS API execution failed: ${error.message}`);
        }
    }
};
exports.BhashiniService = BhashiniService;
exports.BhashiniService = BhashiniService = BhashiniService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], BhashiniService);
//# sourceMappingURL=bhashini.service.js.map