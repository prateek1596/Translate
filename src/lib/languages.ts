export type SupportedLanguage = {
  value: string;
  label: string;
  locale: string;
};

export const LANGUAGE_OPTIONS: SupportedLanguage[] = [
  { value: "en-US", label: "English (US)", locale: "en-US" },
  { value: "en-GB", label: "English (UK)", locale: "en-GB" },
  { value: "es-ES", label: "Spanish", locale: "es-ES" },
  { value: "fr-FR", label: "French", locale: "fr-FR" },
  { value: "de-DE", label: "German", locale: "de-DE" },
  { value: "it-IT", label: "Italian", locale: "it-IT" },
  { value: "pt-PT", label: "Portuguese", locale: "pt-PT" },
  { value: "pt-BR", label: "Portuguese (Brazil)", locale: "pt-BR" },
  { value: "hi-IN", label: "Hindi", locale: "hi-IN" },
  { value: "ar-SA", label: "Arabic", locale: "ar-SA" },
  { value: "bn-BD", label: "Bengali", locale: "bn-BD" },
  { value: "zh-CN", label: "Chinese (Simplified)", locale: "zh-CN" },
  { value: "zh-TW", label: "Chinese (Traditional)", locale: "zh-TW" },
  { value: "ja-JP", label: "Japanese", locale: "ja-JP" },
  { value: "ko-KR", label: "Korean", locale: "ko-KR" },
  { value: "ru-RU", label: "Russian", locale: "ru-RU" },
  { value: "tr-TR", label: "Turkish", locale: "tr-TR" },
  { value: "nl-NL", label: "Dutch", locale: "nl-NL" },
  { value: "pl-PL", label: "Polish", locale: "pl-PL" },
  { value: "sv-SE", label: "Swedish", locale: "sv-SE" },
  { value: "uk-UA", label: "Ukrainian", locale: "uk-UA" },
  { value: "vi-VN", label: "Vietnamese", locale: "vi-VN" },
  { value: "th-TH", label: "Thai", locale: "th-TH" },
  { value: "id-ID", label: "Indonesian", locale: "id-ID" },
  { value: "fil-PH", label: "Filipino", locale: "fil-PH" },
  { value: "sw-KE", label: "Swahili", locale: "sw-KE" },
  { value: "cs-CZ", label: "Czech", locale: "cs-CZ" },
  { value: "el-GR", label: "Greek", locale: "el-GR" },
  { value: "he-IL", label: "Hebrew", locale: "he-IL" },
  { value: "fa-IR", label: "Persian", locale: "fa-IR" },
  { value: "ro-RO", label: "Romanian", locale: "ro-RO" },
  { value: "hu-HU", label: "Hungarian", locale: "hu-HU" },
  { value: "da-DK", label: "Danish", locale: "da-DK" },
  { value: "fi-FI", label: "Finnish", locale: "fi-FI" },
  { value: "no-NO", label: "Norwegian", locale: "no-NO" },
  { value: "ms-MY", label: "Malay", locale: "ms-MY" },
  { value: "ta-IN", label: "Tamil", locale: "ta-IN" },
  { value: "te-IN", label: "Telugu", locale: "te-IN" },
  { value: "mr-IN", label: "Marathi", locale: "mr-IN" },
  { value: "ur-PK", label: "Urdu", locale: "ur-PK" }
];