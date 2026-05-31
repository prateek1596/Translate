export type TranslateInput = {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  provider?: string;
};

export type TranslateOutput = {
  translatedText: string;
  provider: string;
};
