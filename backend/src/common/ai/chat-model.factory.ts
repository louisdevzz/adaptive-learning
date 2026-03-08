import { BadRequestException } from '@nestjs/common';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOpenAI } from '@langchain/openai';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export type SupportedAiProvider = 'openai' | 'gemini' | 'kimi-code';

export interface CreateChatModelOptions {
  provider?: string;
  model?: string;
  temperature?: number;
}

interface ChatModelLike {
  invoke(messages: unknown[]): Promise<{ content: string }>;
}

type BasicChatRole = 'system' | 'user' | 'assistant';

class KimiChatModel implements ChatModelLike {
  private readonly client: OpenAI;

  constructor(
    private readonly model: string,
    private readonly temperature: number,
    apiKey: string,
    baseURL: string,
    userAgent: string,
  ) {
    this.client = new OpenAI({
      apiKey,
      baseURL,
      defaultHeaders: {
        'User-Agent': userAgent,
      },
    });
  }

  async invoke(messages: unknown[]): Promise<{ content: string }> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      temperature: this.temperature,
      messages: this.toOpenAIMessages(messages),
    });

    return {
      content: response.choices[0]?.message?.content ?? '',
    };
  }

  private toOpenAIMessages(messages: unknown[]): ChatCompletionMessageParam[] {
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new BadRequestException('Kimi request messages are empty');
    }

    return messages.map((message) => {
      const role = this.resolveRole(message);
      const content = this.resolveContent(message);

      return {
        role,
        content,
      };
    });
  }

  private resolveRole(message: unknown): BasicChatRole {
    const roleValue =
      typeof message === 'object' && message !== null
        ? (message as { role?: unknown }).role
        : undefined;

    if (typeof roleValue === 'string') {
      const normalizedRole = roleValue.toLowerCase();
      if (
        normalizedRole === 'system' ||
        normalizedRole === 'user' ||
        normalizedRole === 'assistant'
      ) {
        return normalizedRole;
      }
      if (normalizedRole === 'human') {
        return 'user';
      }
      if (normalizedRole === 'ai') {
        return 'assistant';
      }
    }

    const getType =
      typeof message === 'object' &&
      message !== null &&
      typeof (message as { _getType?: unknown })._getType === 'function'
        ? (message as { _getType: () => string })._getType
        : undefined;
    const messageType = getType ? getType().toLowerCase() : '';

    if (messageType === 'system') {
      return 'system';
    }
    if (messageType === 'ai' || messageType === 'assistant') {
      return 'assistant';
    }

    return 'user';
  }

  private resolveContent(message: unknown): string {
    if (typeof message !== 'object' || message === null) {
      return this.stringifyValue(message);
    }

    const rawContent = (message as { content?: unknown }).content;
    if (typeof rawContent === 'string') {
      return rawContent;
    }
    if (Array.isArray(rawContent)) {
      return rawContent
        .map((part) => {
          if (typeof part === 'string') {
            return part;
          }
          if (typeof part !== 'object' || part === null) {
            return '';
          }
          const text = (part as { text?: unknown }).text;
          if (typeof text === 'string') {
            return text;
          }
          const content = (part as { content?: unknown }).content;
          return typeof content === 'string' ? content : '';
        })
        .filter((part) => part.length > 0)
        .join('\n')
        .trim();
    }
    if (rawContent == null) {
      return '';
    }
    if (typeof rawContent === 'object') {
      const text = (rawContent as { text?: unknown }).text;
      if (typeof text === 'string') {
        return text;
      }
    }

    return this.stringifyValue(rawContent);
  }

  private stringifyValue(value: unknown): string {
    if (value == null) {
      return '';
    }
    if (typeof value === 'string') {
      return value;
    }
    if (
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      typeof value === 'bigint'
    ) {
      return String(value);
    }
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return '';
      }
    }
    return '';
  }
}

const DEFAULT_MODEL_BY_PROVIDER: Record<SupportedAiProvider, string> = {
  openai: 'gpt-4o-mini',
  gemini: 'gemini-1.5-flash',
  'kimi-code': 'kimi-coding',
};

function normalizeProvider(provider?: string): SupportedAiProvider {
  const providerFromEnv = process.env.PROVIDER?.trim();
  const normalizedProvider = (
    provider ||
    providerFromEnv ||
    'openai'
  ).toLowerCase();

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
  const requestedModel = model?.trim();
  if (requestedModel) {
    return requestedModel;
  }

  const sharedModel = process.env.MODEL?.trim();
  if (sharedModel) {
    return sharedModel;
  }

  if (provider === 'openai') {
    return process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL_BY_PROVIDER.openai;
  }

  if (provider === 'gemini') {
    return process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL_BY_PROVIDER.gemini;
  }

  return (
    process.env.KIMI_MODEL?.trim() || DEFAULT_MODEL_BY_PROVIDER['kimi-code']
  );
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
      }) as unknown as ChatModelLike,
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
      }) as unknown as ChatModelLike,
    };
  }

  const apiKey = process.env.KIMI_API_KEY?.trim();
  if (!apiKey) {
    throw new BadRequestException('Kimi API key is not configured');
  }

  const baseURL =
    process.env.KIMI_BASE_URL?.trim() || 'https://api.kimi.com/coding/v1';
  const userAgent = process.env.KIMI_USER_AGENT?.trim() || 'KimiCLI/0.77';

  return {
    provider,
    model,
    chatModel: new KimiChatModel(
      model,
      temperature,
      apiKey,
      baseURL,
      userAgent,
    ),
  };
}
