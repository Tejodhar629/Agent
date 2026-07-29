import { Injectable, Logger, Optional } from '@nestjs/common';
import axios from 'axios';

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
  audioContent: string; // Base64 WAV/MP3/OGG stream
  targetLanguage: string;
  audioFormat: string;
  latencyMs: number;
}

/**
 * Service to orchestrate MeitY Bhashini ULCA APIs for Speech-to-Text (ASR),
 * Neural Machine Translation (NMT), and Text-to-Speech (TTS).
 * Built with fallback mocks for sandbox/local environments when API keys are not supplied.
 */
@Injectable()
export class BhashiniService {
  private readonly logger = new Logger(BhashiniService.name);
  private readonly apiKey: string;
  private readonly userId: string;
  private readonly pipelineId: string;
  private readonly gatewayUrl: string;
  private readonly inferenceUrl: string;

  constructor() {
    this.apiKey = process.env.BHASHINI_API_KEY || '';
    this.userId = process.env.BHASHINI_USER_ID || '';
    this.pipelineId = process.env.BHASHINI_PIPELINE_ID || '64392f708e330e0d0b000001';
    this.gatewayUrl = process.env.BHASHINI_GATEWAY_URL || 'https://meity.bhashini.gov.in';
    this.inferenceUrl = process.env.BHASHINI_INFERENCE_URL || 'https://dhruva.bhashini.gov.in/services/inference/pipeline';
  }

  /**
   * Retrieves active model configurations for translation, ASR, or TTS pipelines.
   * This is part of the standard ULCA API contract.
   */
  async getPipelineConfig(taskType: 'asr' | 'translation' | 'tts', sourceLang: string, targetLang?: string): Promise<any> {
    if (!this.apiKey || !this.userId) {
      this.logger.warn('Bhashini API credentials not configured. Returning fallback configurations.');
      return {
        serviceId: taskType === 'translation' ? 'ai4bharat/indictrans-v2-all-to-all' : 
                   taskType === 'asr' ? `ai4bharat/whisper-medium-${sourceLang}` : `ai4bharat/indic-tts-coqui-${sourceLang}`,
        modelId: `mock-model-${taskType}-${sourceLang}`,
      };
    }

    try {
      const pipelineTasks: any[] = [];
      if (taskType === 'asr') {
        pipelineTasks.push({
          taskType: 'asr',
          config: { language: { sourceLanguage: sourceLang } }
        });
      } else if (taskType === 'translation') {
        pipelineTasks.push({
          taskType: 'translation',
          config: { language: { sourceLanguage: sourceLang, targetLanguage: targetLang || 'en' } }
        });
      } else if (taskType === 'tts') {
        pipelineTasks.push({
          taskType: 'tts',
          config: { language: { sourceLanguage: sourceLang } }
        });
      }

      const response = await axios.post(
        `${this.gatewayUrl}/ulca/apis/v1/model/getModelsPipeline`,
        {
          pipelineTasks,
          pipelineRequestConfig: { pipelineId: this.pipelineId }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'ulcaApiKey': this.apiKey,
            'userID': this.userId
          }
        }
      );

      const pipelineResponseConfig = response.data?.pipelineResponseConfig?.[0];
      const modelConfig = pipelineResponseConfig?.config?.[0];
      return {
        serviceId: modelConfig?.serviceId || '',
        modelId: modelConfig?.modelId || '',
        inferenceApiKey: response.data?.pipelineInferenceAPIEndPoint?.inferenceApiKey?.value || '',
        inferenceUrl: response.data?.pipelineInferenceAPIEndPoint?.callbackUrl || this.inferenceUrl
      };
    } catch (error: any) {
      this.logger.error(`Failed to fetch Bhashini pipeline config for ${taskType}: ${error.message}`);
      throw new Error(`Bhashini config retrieval failed: ${error.message}`);
    }
  }

  /**
   * Translates regional Indic language text into English, or English into a target regional language.
   */
  async translate(sourceLang: string, targetLang: string, text: string): Promise<BhashiniTranslationResult> {
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

    // Mock mode if key is not found
    if (!this.apiKey) {
      this.logger.warn('Bhashini API keys not present. Utilizing development localization fallback mock.');
      const mockTranslations: Record<string, any> = {
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

      const response = await axios.post(
        config.inferenceUrl || this.inferenceUrl,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': config.inferenceApiKey || this.apiKey
          }
        }
      );

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
    } catch (error: any) {
      this.logger.error(`Bhashini NMT API Call Failed: ${error.message}`);
      throw new Error(`Bhashini Translation API execution failed: ${error.message}`);
    }
  }

  /**
   * Converts user speech audio base64 content into transcribed text in standard Unicode.
   */
  async asr(sourceLang: string, audioContentBase64: string, audioFormat = 'wav', samplingRate = 16000): Promise<BhashiniAsrResult> {
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

      const response = await axios.post(
        config.inferenceUrl || this.inferenceUrl,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': config.inferenceApiKey || this.apiKey
          }
        }
      );

      const transcribedText = response.data?.pipelineResponse?.[0]?.output?.[0]?.source || '';
      const latencyMs = Date.now() - startTime;

      this.logger.log(`ASR transcription completed successfully in ${latencyMs}ms.`);
      return {
        transcribedText,
        sourceLanguage: sourceLang,
        confidenceScore: response.data?.pipelineResponse?.[0]?.output?.[0]?.confidence || 0.90,
        latencyMs
      };
    } catch (error: any) {
      this.logger.error(`Bhashini ASR API Call Failed: ${error.message}`);
      throw new Error(`Bhashini ASR API execution failed: ${error.message}`);
    }
  }

  /**
   * Generates continuous voice audio playback base64 content from text.
   */
  async tts(targetLang: string, text: string, gender: 'male' | 'female' = 'female'): Promise<BhashiniTtsResult> {
    const startTime = Date.now();
    this.logger.log(`Synthesizing text of length ${text.length} into continuous speech stream for ${targetLang}...`);

    if (!this.apiKey) {
      this.logger.warn('Bhashini API credentials missing. Returning static mock base64 audio stream.');
      // A valid small base64 wave mock
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

      const response = await axios.post(
        config.inferenceUrl || this.inferenceUrl,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': config.inferenceApiKey || this.apiKey
          }
        }
      );

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
    } catch (error: any) {
      this.logger.error(`Bhashini TTS API Call Failed: ${error.message}`);
      throw new Error(`Bhashini TTS API execution failed: ${error.message}`);
    }
  }
}
