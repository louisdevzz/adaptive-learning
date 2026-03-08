import { BadRequestException } from '@nestjs/common';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOpenAI } from '@langchain/openai';

export type SupportedAiProvider = 'openai' | 'gemini' | 'kimi-code';

export interface CreateChatModelOptions {
  provider?: string;
  model?: string;
  temperature?: number;
}

const DEFAULT_MODEL_BY_PROVIDER: Record<SupportedAiProvider, string> = {
  openai: 'gpt-4o-mini',
  gemini: 'gemini-1.5-flash',
  'kimi-code': 'kimi-coding',
};

function normalizeProvider(provider?: string): SupportedAiProvider {
  const providerFromEnv = process.env.PROVIDER?.trim();
  const normalizedProvider = (providerFromEnv || provider || 'openai')
    .toLowerCase();

  if (normalizedProvider === 'kimi') {
    return 'kimi-code';
  }

  if (
    normalizedProvider === 'openai' ||
    normalizedProvider === 'gemini' ||
    normalizedProvider === 'kimi-code'
  ) {
    return normalizedProvider;
  }

  throw new BadRequestException(
    `Unsupported AI provider "${providerFromEnv || provider}". Supported providers: openai, gemini, kimi-code`,
  );
}

function resolveModel(provider: SupportedAiProvider, model?: string): string {
  const sharedModel = process.env.MODEL?.trim();
  if (sharedModel) {
    return sharedModel;
  }

  const requestedModel = model?.trim();
  if (requestedModel) {
    return requestedModel;
  }

  if (provider === 'openai') {
    return process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL_BY_PROVIDER.openai;
  }

  if (provider === 'gemini') {
    return process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL_BY_PROVIDER.gemini;
  }

  return process.env.KIMI_MODEL?.trim() || DEFAULT_MODEL_BY_PROVIDER['kimi-code'];
}

export function createChatModel(options: CreateChatModelOptions = {}) {
  const provider = normalizeProvider(options.provider);
  const model = resolveModel(provider, options.model);
  const temperature = options.temperature ?? 0.7;

  if (provider === 'openai') {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new BadRequestException('OpenAI API key is not configured');
    }

    return {
      provider,
      model,
      chatModel: new ChatOpenAI({
        model,
        temperature,
        apiKey,
      }),
    };
  }

  if (provider === 'gemini') {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new BadRequestException('Google API key is not configured');
    }

    return {
      provider,
      model,
      chatModel: new ChatGoogleGenerativeAI({
        model,
        temperature,
        apiKey,
      }),
    };
  }

  const apiKey = process.env.KIMI_API_KEY;
  if (!apiKey) {
    throw new BadRequestException('Kimi API key is not configured');
  }

  const baseURL =
    process.env.KIMI_BASE_URL?.trim() || 'https://api.kimi.com/coding/v1';
  const userAgent = process.env.KIMI_USER_AGENT?.trim() || 'KimiCLI/0.77';

  return {
    provider,
    model,
    chatModel: new ChatOpenAI({
      model,
      temperature,
      apiKey,
      configuration: {
        baseURL,
        defaultHeaders: {
          'User-Agent': userAgent,
        },
      },
    }),
  };
}
