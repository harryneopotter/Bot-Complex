# AI Mini-Arcade — Product Requirements Document (PRD)

## 1. Strategy

| Item | Details |
|------|---------|
| **Product** | "AI Mini-Arcade" — a lightweight, 3‑page site where visitors discover and chat with quirky AI agents. |
| **Problem** | Non‑technical users struggle to test bespoke AI bots without installing anything or sharing long API keys up‑front. |
| **Goal** | Deliver a friction‑free showcase that (1) explains the concept, (2) lets users pick a bot, and (3) provides a chat sandbox that can convert to BYO‑API‑key when free credits expire. |
| **Primary Metric** | ≥ 40 % of unique visitors send ≥ 3 chat messages to any bot within one session. |
| **Secondary Metrics** | • Avg. time on site ≥ 3 min  • ≥ 15 % of free‑tier exhaustions convert to BYO‑key  • Error rate < 0.5 % |

## 2. Scope (MVP)

| Page | Core Features | Must‑Have | Nice‑to‑Have |
|------|---------------|-----------|--------------|
| **Home (`/`)** | Hero text, origin story, “How it works”, CTA to bots | Responsive layout, ≤ 3 s FCP | Embedded explainer video |
| **Bots Gallery (`/bots`)** | Grid of bot cards, hover micro‑interactions, filter by category | Custom logo, color & tagline per bot | Search box, “New” badge |
| **Chat (`/chat/{botId}`)** | Two‑pane chat (messages & bot bio), token counter, free‑tier meter, BYO key modal | Streaming responses, copy‑code button | Dark mode toggle, emoji reactions |

## 3. User Personas & Stories

| Persona | Story ID | Narrative |
|---------|----------|-----------|
| Curious Visitor | **UV‑1** | “As a first‑timer I want a quick intro so I know why these bots are interesting.” |
| Tinkerer | **UV‑2** | “As a hobbyist I want to pick a bot that suits my mood and chat instantly without signup.” |
| Power User | **UV‑3** | “When I hit the free limit I want to drop in my own OpenAI key and continue seamlessly.” |

## 4. Functional Requirements

### 4.1 Home Page (`/`)

| Req‑ID | Requirement |
|--------|-------------|
| **H‑1** | Hero section with value prop (max 15 words). |
| **H‑2** | “Origin Story” block with 3 bullet anecdotes (pull from CMS / markdown). |
| **H‑3** | “How to Use” timeline: *Pick → Chat → Upgrade* illustrated in 3 steps. |
| **H‑4** | Primary CTA button “Meet the Bots” → `/bots`. |

### 4.2 Bots Gallery (`/bots`)

| Req‑ID | Requirement |
|--------|-------------|
| **B‑1** | Fetch bot catalog from `/api/bots`. |
| **B‑2** | Render each bot as a Card: logo (128×128 px SVG), name, one‑line pitch, theme color. |
| **B‑3** | Clicking a card routes to `/chat/{botId}` *and wakes the agent* (init call to `/api/bots/{id}/warm`). |
| **B‑4** | Keyboard navigation & ARIA labels for accessibility. |

### 4.3 Chat Page (`/chat/{botId}`)

| Req‑ID | Requirement |
|--------|-------------|
| **C‑1** | Panel A: Chat log with streaming messages (Markdown render, code block copy). |
| **C‑2** | Panel B: Bot “About” card (logo, persona, capabilities, limitations). |
| **C‑3** | Free‑tier meter showing remaining tokens; updates every response. |
| **C‑4** | On limit reached, non‑blocking modal:  \n • Explains cost, privacy (*“Key stored only in session memory”*)  \n • Input field with masked key  \n • Validation ping to OpenAI before enabling “Continue”. |
| **C‑5** | If user declines, disable input with info banner “Limit reached — add API key to continue”. |

## 5. Non‑Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | FCP ≤ 3 s @ 3G; Lighthouse perf ≥ 90 |
| **Security** | No API key persisted in DB/localStorage; held only in memory for session. |
| **Compliance** | Honor `robots.txt`; GDPR cookie banner if analytics used. |
| **Tech Stack** | Next.js 14, React Server Components, TailwindCSS, Vercel Edge Functions for /lambda APIs. |
| **Accessibility** | WCAG 2.1 AA; focus traps in modals. |

## 6. Analytics & Instrumentation

| Event | Payload |
|-------|---------|
| `bot_card_click` | botId, timestamp |
| `chat_message_sent` | botId, tokenCount |
| `free_tier_exhausted` | botId |
| `api_key_added` | hashedKeyPrefix, plan=BYO |

## 7. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|-----------|
| High OpenAI latency | Medium | Medium | Use streaming, show typing dots |
| Abuse of BYO key | Low | High | Warn user, rate‑limit per IP |
| Token overshoot vs. meter | Low | Medium | Pre‑count prompt, add 10 % buffer |

## 8. Milestones

| Date | Deliverable |
|------|-------------|
| **T‑0 + 1 wk** | UX wireframes & content draft |
| **T‑0 + 3 wk** | MVP pages functional, internal QA |
| **T‑0 + 4 wk** | Beta launch, telemetry check |
| **T‑0 + 5 wk** | Public release v1.0 |

## 9. Open Questions

1. What is the free‑tier token cap per user (1 K? 2 K?)
2. Will bots share a single system prompt template or per‑bot file?
3. Need SSO / email capture for future phases?

---

*Generated: 31 Aug 2025 (Europe/London)*

