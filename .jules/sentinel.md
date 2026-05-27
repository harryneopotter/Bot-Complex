## 2026-05-08 - Information Exposure via Error Messages
**Vulnerability:** Detailed internal error messages, including stack traces or upstream API error details, were being sent directly to the client in the event of a server error.
**Learning:** Returning raw error objects or `error.message` directly to the client can leak sensitive information about the server's internal state, dependencies, or upstream provider configurations.
**Prevention:** Always use generic error messages for client-facing responses and log the detailed error information server-side for debugging and auditing purposes.
