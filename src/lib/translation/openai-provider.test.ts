import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { translateWithOpenAI } from './openai-provider';

describe('translateWithOpenAI', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    process.env = { ...OLD_ENV, OPENAI_API_KEY: 'test-key', OPENAI_TRANSLATION_MODEL: 'test-model' };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env = OLD_ENV;
  });

  it('calls OpenAI and returns translated text', async () => {
    const mockResponse = {
      choices: [
        { message: { content: 'Hola mundo' } }
      ]
    };

    (globalThis.fetch as unknown as vi.Mock).mockResolvedValueOnce({ ok: true, json: async () => mockResponse });

    const result = await translateWithOpenAI({ text: 'Hello world', sourceLanguage: 'en', targetLanguage: 'es' });

    expect(result.translatedText).toBe('Hola mundo');
    expect(result.provider).toBe('openai');
    expect((globalThis.fetch as unknown as vi.Mock).mock.calls.length).toBeGreaterThan(0);
  });
});
