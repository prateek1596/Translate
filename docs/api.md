# API Endpoints

## `GET /api/health`

Returns a lightweight health payload for uptime checks.

Response:

```json
{
  "status": "ok",
  "timestamp": "2026-05-27T00:00:00.000Z"
}
```

## `GET /api/languages`

Returns the built-in language catalog used by the UI.

## `POST /api/translate`

Translates a text segment or full transcript from one language to another.

If `sessionId` is provided, the translation is appended to that persisted session. If omitted, the server creates a new session and returns its id.

Request body:

```json
{
  "sessionId": "clx123abc456",
  "text": "Hola, ¿cómo estás?",
  "sourceLanguage": "Spanish",
  "targetLanguage": "English"
}
```

Response:

```json
{
  "sessionId": "clx123abc456",
  "translatedText": "Hi, how are you?",
  "sourceLanguage": "Spanish",
  "targetLanguage": "English",
  "provider": "openai",
  "latencyMs": 412
}
```

## Error model

Validation and provider errors are returned as JSON with a message and a status code. The UI treats these errors as recoverable and keeps the transcript intact so the user can retry.