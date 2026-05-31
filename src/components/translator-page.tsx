"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { LANGUAGE_OPTIONS } from "@/lib/languages";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";

type TranslationItem = {
  source: string;
  translated: string;
};

const DEFAULT_SOURCE_LANGUAGE = "auto";
const DEFAULT_TARGET_LANGUAGE = "es-ES";

export function TranslatorPage() {
  const [sourceLanguage, setSourceLanguage] = useState(DEFAULT_SOURCE_LANGUAGE);
  const [customSourceLanguage, setCustomSourceLanguage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState(DEFAULT_TARGET_LANGUAGE);
  const [customTargetLanguage, setCustomTargetLanguage] = useState("");
  const [translations, setTranslations] = useState<TranslationItem[]>([]);
  const [manualText, setManualText] = useState("");
  const [provider, setProvider] = useState("openai");
  const [status, setStatus] = useState<"idle" | "listening" | "translating" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const processedSegmentsRef = useRef(0);

  const {
    finalSegments,
    interimTranscript,
    transcript,
    isListening,
    startListening,
    stopListening,
    clearTranscript,
    recognitionAvailable
  } = useSpeechRecognition();

  const { speak, stop: stopSpeaking, isSpeaking, voicesAvailable } = useSpeechSynthesis();

  useEffect(() => {
    const storedSessionId = window.localStorage.getItem("speakflow-session-id");
    if (storedSessionId) {
      sessionIdRef.current = storedSessionId;
      setSessionId(storedSessionId);
    }
  }, []);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    sessionIdRef.current = sessionId;
    window.localStorage.setItem("speakflow-session-id", sessionId);
  }, [sessionId]);

  function getOrCreateSessionId() {
    const currentSessionId = sessionIdRef.current;
    if (currentSessionId) {
      return currentSessionId;
    }

    const nextSessionId = crypto.randomUUID();
    sessionIdRef.current = nextSessionId;
    setSessionId(nextSessionId);
    window.localStorage.setItem("speakflow-session-id", nextSessionId);
    return nextSessionId;
  }

  const sourceLanguageLabel = useMemo(() => {
    if (sourceLanguage === "auto") {
      return customSourceLanguage.trim() || "Auto-detect";
    }

    if (sourceLanguage === "custom") {
      return customSourceLanguage.trim() || "Custom source";
    }

    return LANGUAGE_OPTIONS.find((option) => option.value === sourceLanguage)?.label ?? sourceLanguage;
  }, [customSourceLanguage, sourceLanguage]);

  const targetLanguageLabel = useMemo(() => {
    if (targetLanguage === "custom") {
      return customTargetLanguage.trim() || "Custom target";
    }

    return LANGUAGE_OPTIONS.find((option) => option.value === targetLanguage)?.label ?? targetLanguage;
  }, [customTargetLanguage, targetLanguage]);

  const listeningLabel = isListening ? "Listening" : "Ready";

  useEffect(() => {
    setStatus(isListening ? "listening" : "idle");
  }, [isListening]);

  useEffect(() => {
    if (finalSegments.length <= processedSegmentsRef.current) {
      return;
    }

    const nextSegment = finalSegments[finalSegments.length - 1];
    processedSegmentsRef.current = finalSegments.length;

    if (!nextSegment.trim()) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        setError(null);
        setStatus("translating");
        const result = await translateSegment(
          nextSegment,
          sourceLanguageLabel,
          targetLanguageLabel,
          getOrCreateSessionId()
        );

        if (cancelled) {
          return;
        }

        setTranslations((current) => [...current, { source: nextSegment, translated: result }]);

        if (autoSpeak) {
          speak(result, resolveTargetSpeechLocale(targetLanguage));
        }

        setStatus(isListening ? "listening" : "idle");
      } catch (translationError) {
        if (cancelled) {
          return;
        }

        setStatus("error");
        setError(translationError instanceof Error ? translationError.message : "Translation failed");
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [autoSpeak, finalSegments, isListening, speak, sourceLanguageLabel, targetLanguage, targetLanguageLabel]);

  async function translateSegment(
    text: string,
    currentSourceLanguage?: string,
    currentTargetLanguage?: string,
    currentSessionId?: string
  ) {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sessionId: currentSessionId ?? getOrCreateSessionId(),
        text,
        sourceLanguage: currentSourceLanguage ?? sourceLanguageLabel,
        targetLanguage: currentTargetLanguage ?? targetLanguageLabel,
        provider
      })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(payload?.error ?? "Unable to translate right now");
    }

    const payload = (await response.json()) as { translatedText?: string; sessionId?: string };
    if (!payload.translatedText) {
      throw new Error("Translation service returned an empty response");
    }

    if (payload.sessionId && payload.sessionId !== sessionIdRef.current) {
      sessionIdRef.current = payload.sessionId;
      setSessionId(payload.sessionId);
    }

    return payload.translatedText;
  }

  async function handleTranslateNow() {
    const text = (manualText.trim() || transcript.trim());
    if (!text) {
      setError("Speak or type something first or enter text to translate.");
      return;
    }

    try {
      setStatus("translating");
      setError(null);
      const translatedText = await translateSegment(text, undefined, undefined, getOrCreateSessionId());
      setTranslations([{ source: text, translated: translatedText }]);

      if (autoSpeak) {
        speak(translatedText, resolveTargetSpeechLocale(targetLanguage));
      }

      setStatus("idle");
    } catch (translationError) {
      setStatus("error");
      setError(translationError instanceof Error ? translationError.message : "Translation failed");
    }
  }

  function exportSession() {
    const payload = {
      sessionId: sessionIdRef.current,
      sourceLanguage: sourceLanguageLabel,
      targetLanguage: targetLanguageLabel,
      provider,
      translations,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `translation-session-${sessionIdRef.current ?? "new"}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function handleStartListening() {
    setError(null);
    processedSegmentsRef.current = 0;
    getOrCreateSessionId();
    clearTranscript();
    setTranslations([]);
    startListening(resolveSourceSpeechLocale(sourceLanguage));
  }

  function handleStopListening() {
    stopListening();
    if (transcript.trim()) {
      void handleTranslateNow();
    }
  }

  function handleReset() {
    stopListening();
    stopSpeaking();
    clearTranscript();
    setTranslations([]);
    setError(null);
    processedSegmentsRef.current = 0;
    setStatus("idle");
    setSessionId(null);
    window.localStorage.removeItem("speakflow-session-id");
  }

  const selectedSourceIsCustom = sourceLanguage === "custom";
  const selectedTargetIsCustom = targetLanguage === "custom";

  return (
    <main className="page">
      <section className="hero">
        <div className="hero-card stack">
          <div className="eyebrow">Startup MVP for live translation</div>
          <div>
            <h1 className="title">
              Speak in one language.
              <br />
              Translate to <span>any language.</span>
            </h1>
            <p className="lede">
              SpeakFlow captures your voice, translates it with an ML-backed server path, and reads the output back in the
              target language. The MVP uses browser speech APIs for speed, while the backend is ready for stronger ASR and TTS
              providers when you want to scale.
            </p>
          </div>

          <div className="pill-row">
            <span className="pill">
              <span className={`status-dot ${isListening ? "" : "idle"}`} />
              {listeningLabel}
            </span>
            <span className="pill">Provider: OpenAI-compatible translation</span>
            <span className="pill">ASR: Browser speech recognition</span>
            <span className="pill">TTS: Browser speech synthesis</span>
            <span className="pill">Session: {sessionId ? sessionId.slice(0, 8) : "new"}</span>
          </div>

          <div className="stats">
            <div className="stat">
              <span className="stat-value">{recognitionAvailable ? "Live mic ready" : "Mic unsupported"}</span>
              <span className="stat-label">Speech capture</span>
            </div>
            <div className="stat">
              <span className="stat-value">{voicesAvailable ? "Voices loaded" : "Loading voices"}</span>
              <span className="stat-label">Speech output</span>
            </div>
            <div className="stat">
              <span className="stat-value">{isSpeaking ? "Speaking now" : "Idle"}</span>
              <span className="stat-label">Playback</span>
            </div>
          </div>
        </div>

        <div className="panel stack">
          <div className="panel-grid">
            <div className="field">
              <label htmlFor="source-language">Source language</label>
              <select
                id="source-language"
                className="select"
                value={sourceLanguage}
                onChange={(event) => setSourceLanguage(event.target.value)}
              >
                <option value="auto">Auto-detect</option>
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
                <option value="custom">Custom...</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="target-language">Target language</label>
              <select
                id="target-language"
                className="select"
                value={targetLanguage}
                onChange={(event) => setTargetLanguage(event.target.value)}
              >
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
                <option value="custom">Custom...</option>
              </select>
            </div>
          </div>

          {selectedSourceIsCustom ? (
            <div className="field">
              <label htmlFor="custom-source-language">Custom source language</label>
              <input
                id="custom-source-language"
                className="input"
                value={customSourceLanguage}
                onChange={(event) => setCustomSourceLanguage(event.target.value)}
                placeholder="e.g. Swahili, Yoruba, Welsh"
              />
            </div>
          ) : null}

          {selectedTargetIsCustom ? (
            <div className="field">
              <label htmlFor="custom-target-language">Custom target language</label>
              <input
                id="custom-target-language"
                className="input"
                value={customTargetLanguage}
                onChange={(event) => setCustomTargetLanguage(event.target.value)}
                placeholder="e.g. Pashto, Xhosa, Icelandic"
              />
            </div>
          ) : null}

          <div className="field">
            <label htmlFor="manual-text">Or type text to translate</label>
            <textarea
              id="manual-text"
              className="textarea"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Type or paste text here and press \"Translate now\""
              rows={4}
            />
          </div>

          <div className="field">
            <label htmlFor="provider-select">Translation provider</label>
            <select
              id="provider-select"
              className="select"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
            >
              <option value="openai">OpenAI</option>
            </select>
          </div>

          <div className="controls">
            <button
              type="button"
              className="button button-primary"
              onClick={handleStartListening}
              disabled={!recognitionAvailable || isListening}
            >
              Start listening
            </button>
            <button type="button" className="button button-secondary" onClick={handleStopListening} disabled={!isListening}>
              Stop and translate
            </button>
            <button type="button" className="button button-secondary" onClick={handleTranslateNow} disabled={!(manualText.trim() || transcript.trim())}>
              Translate now
            </button>
            <button type="button" className="button button-danger" onClick={handleReset}>
              Reset
            </button>
            <button type="button" className="button button-secondary" onClick={exportSession} disabled={translations.length === 0}>
              Export session
            </button>
          </div>

          <div className="controls">
            <label className="pill toggle-pill">
              <input
                type="checkbox"
                checked={autoSpeak}
                onChange={(event) => setAutoSpeak(event.target.checked)}
              />
              Auto speak translation
            </label>
            <span className="pill">Listening locale: {resolveSourceSpeechLocale(sourceLanguage)}</span>
            <span className="pill">Target voice locale: {resolveTargetSpeechLocale(targetLanguage)}</span>
          </div>

          {error ? <p className="footer-note error-note">{error}</p> : null}
        </div>
      </section>

      <section className="grid-2 section-gap">
        <div className="panel stream">
          <div className="live-strip">
            <div>
              <div className="section-label">Live transcript</div>
              <h2 className="section-heading">
                What you are saying
              </h2>
            </div>
            <span className="pill">{sourceLanguageLabel}</span>
          </div>

          <div className="stream-card">
            <h3>Final transcript</h3>
            <p className="stream-text">{transcript || "Start speaking to see your transcript here."}</p>
          </div>

          <div className="stream-card">
            <h3>Interim text</h3>
            <p className="stream-text">{interimTranscript || "The browser will show partial speech results here."}</p>
          </div>
        </div>

        <div className="panel stream">
          <div className="live-strip">
            <div>
              <div className="section-label">Translation stream</div>
              <h2 className="section-heading">
                {targetLanguageLabel}
              </h2>
            </div>
            <span className="pill">{status}</span>
          </div>

          <div className="translation-list">
            {translations.length > 0 ? (
              translations.map((item, index) => (
                <div key={`${index}-${item.translated.slice(0, 24)}`} className="translation-item">
                  <span className="label">Segment {index + 1}</span>
                  <p>{item.translated}</p>
                </div>
              ))
            ) : (
              <div className="translation-item">
                <span className="label">Waiting</span>
                <p>Translated output will appear here after you speak.</p>
              </div>
            )}
          </div>

          <p className="footer-note">
            This MVP uses browser speech APIs for fast delivery. For broader device support at scale, swap the speech layer for
            a dedicated ASR/TTS provider without changing the product contract.
          </p>
        </div>
      </section>
    </main>
  );
}

function resolveSourceSpeechLocale(value: string) {
  if (value === "auto") {
    return typeof navigator !== "undefined" ? navigator.language : "en-US";
  }

  if (value === "custom") {
    return typeof navigator !== "undefined" ? navigator.language : "en-US";
  }

  return value;
}

function resolveTargetSpeechLocale(value: string) {
  if (value === "custom") {
    return typeof navigator !== "undefined" ? navigator.language : "en-US";
  }

  return value;
}