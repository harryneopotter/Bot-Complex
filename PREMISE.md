# Premise: The Residents

## Synopsis
This project is a playful AI “apartment building.” Each bot (“resident”) occupies an apartment (card) and greets a visiting guest (the user). It is a character-first, ensemble experience — not productivity software. Day one includes all 21 residents so their voices can be experienced side-by-side like a sitcom’s first episodes.

## Goals
- Showcase persona craft: strong voice, constraints, and few-shots per resident.
- Delight over utility: short, funny, surprising responses; minimal friction.
- Consistency: each resident keeps format and tone across prompts.
- Transparency: surface provider/model in-stream; ephemeral session memory only.

## Non‑Goals (for now)
- Accounts, onboarding flows, invite codes, or paywalls.
- Curation or hiding residents; all 21 ship together.
- Deep tools, plugins, or long-term personal productivity.
- Persistent storage beyond lightweight, time-limited session history.

## Vocabulary
- Resident: a persona from `server/src/bots/registry.json`.
- Apartment: the card representing a resident; often referenced by id.
- Guest: the visiting user who chats with residents.

## Current Scope
- 21 residents in registry; UI shows those IDs from the server catalog.
- One-turn chats emphasized; streaming responses; simple “send → watch” loop.
- Provider ladder with sane defaults; safe, SFW constraints in prompts.

## Future Hooks (not implemented yet)
- Inter-resident features (“neighbors”) and ensemble interactions.
- Richer theming (floors, lobby), analytics, or rate limiting.
- Optional gating for broader releases if needed later.
