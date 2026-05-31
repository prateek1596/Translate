import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useSpeechRecognition } from './use-speech-recognition';

function TestComp() {
  const { recognitionAvailable, transcript } = useSpeechRecognition();
  return (
    <div>
      <span data-testid="avail">{recognitionAvailable ? '1' : '0'}</span>
      <span data-testid="t">{transcript}</span>
    </div>
  );
}

describe('useSpeechRecognition', () => {
  it('shows recognition available when global constructor exists', async () => {
    // Provide a dummy constructor on window
    // @ts-ignore
    window.SpeechRecognition = function () {} as any;

    render(<TestComp />);

    await waitFor(() => expect(screen.getByTestId('avail').textContent).toBe('1'));
  });
});
