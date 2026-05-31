# UI Architecture

The interface is designed as a single focused translation workspace.

## Regions

- Top status bar: app name, provider health, and listening state.
- Control panel: source language, target language, listening controls, and speech toggles.
- Live transcript panel: shows the current recognized text in real time.
- Translation stream: shows translated segments as they arrive.
- Action row: clear, translate now, and speak translation actions.

## Interaction model

- Start listening to capture speech from the browser microphone.
- Final speech segments are sent to the translation API automatically.
- The translated text is read aloud through browser speech synthesis.
- Manual translation remains available for the full transcript when a user wants to review before speaking.

## Visual direction

The UI uses a dark, cinematic canvas with bright accent gradients, large type, and a layered card layout. It is intentionally not generic SaaS chrome.