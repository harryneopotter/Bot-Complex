## 2024-11-20 - [Input Validation] Prevent System Prompt Injection
**Vulnerability:** The `/api/chat` endpoint accepts an array of messages directly from the user without validating the `role` property. This allows a malicious user to inject messages with the `system` role, potentially overriding the bot's carefully crafted persona and constraints.
**Learning:** Even if the frontend only sends `user` messages, the API must independently validate the structure and content of all incoming payload fields, specifically restricting roles for messages coming from the client.
**Prevention:** Add explicit validation to ensure that any `messages` supplied in the request only use allowed roles (e.g., `user` or `assistant`), and reject requests with invalid roles or malformed structures.
