"use client";

import { useCallback, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }

  interface SpeechRecognitionConstructor {
    new (): SpeechRecognition;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    start(): void;
    stop(): void;
    abort(): void;
  }

  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionResultList {
    readonly length: number;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    readonly length: number;
    [index: number]: SpeechRecognitionAlternative;
    isFinal: boolean;
  }

  interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
  }
}

type SpeechRecognitionState = {
  transcript: string;
  interimTranscript: string;
  finalSegments: string[];
  isListening: boolean;
  recognitionAvailable: boolean;
  error: string | null;
};

export function useSpeechRecognition() {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [state, setState] = useState<SpeechRecognitionState>({
    transcript: "",
    interimTranscript: "",
    finalSegments: [],
    isListening: false,
    recognitionAvailable: false,
    error: null
  });

  useEffect(() => {
    const available = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
    setState((current) => ({ ...current, recognitionAvailable: available }));
  }, []);

  const clearTranscript = useCallback(() => {
    recognitionRef.current?.abort();
    setState((current) => ({
      ...current,
      transcript: "",
      interimTranscript: "",
      finalSegments: [],
      error: null,
      isListening: false
    }));
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setState((current) => ({ ...current, isListening: false }));
  }, []);

  const startListening = useCallback((locale: string) => {
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) {
      setState((current) => ({ ...current, error: "Speech recognition is not available in this browser." }));
      return;
    }

    recognitionRef.current?.abort();

    const recognition = new Recognition();
    recognition.lang = locale;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const finalParts: string[] = [];
      let interimText = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result[0]?.transcript?.trim() ?? "";

        if (!transcript) {
          continue;
        }

        if (result.isFinal) {
          finalParts.push(transcript);
        } else {
          interimText = transcript;
        }
      }

      if (finalParts.length > 0) {
        setState((current) => {
          const finalSegments = [...current.finalSegments, ...finalParts];
          return {
            ...current,
            finalSegments,
            transcript: finalSegments.join(" "),
            interimTranscript: interimText,
            error: null
          };
        });
      } else {
        setState((current) => ({
          ...current,
          interimTranscript: interimText,
          error: null
        }));
      }
    };

    recognition.onerror = (event) => {
      setState((current) => ({
        ...current,
        error: event.error === "not-allowed" ? "Microphone access was denied." : event.message || event.error,
        isListening: false
      }));
    };

    recognition.onend = () => {
      setState((current) => ({ ...current, isListening: false }));
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      setState((current) => ({ ...current, isListening: true, error: null }));
    } catch (error) {
      setState((current) => ({
        ...current,
        isListening: false,
        error: error instanceof Error ? error.message : "Unable to start speech recognition."
      }));
    }
  }, []);

  return {
    transcript: state.transcript,
    interimTranscript: state.interimTranscript,
    finalSegments: state.finalSegments,
    isListening: state.isListening,
    recognitionAvailable: state.recognitionAvailable,
    error: state.error,
    startListening,
    stopListening,
    clearTranscript
  };
}