# AI Mini-Arcade — Visual Design Spec (Glassmorphism)

> **Design goal**: evoke a playful, futuristic "quantum arcade" vibe that echoes the glossy, cyan‑blue branding of **qpanda.bluepanda.cloud**, while keeping interfaces light, airy, and legible.

## 1. Core Aesthetic

| Principle | Application |
|-----------|-------------|
| **Glassmorphism** | All primary containers (cards, modals, chat panes) use a translucent “frosted glass” background (`backdrop-filter: blur(20px)`, `background: rgba(255,255,255,0.12)`) sitting over a subtle animated gradient. |
| **Depth & Layering** | Soft 24‑40 px inner shadows + 1 px white highlights on top edges to simulate glass thickness. Cards hover +6 px (shadow `0 6px 20px rgba(0,0,0,.15)`). |
| **Neon Accents** | Key interactive elements glow with the brand accent (#21D4FD → #B721FF gradient) on focus/hover. |
| **Minimal Chrome** | Keep borders invisible; rely on spacing & blur to separate sections. |

## 2. Color Palette (derived from qpanda.bluepanda.cloud)  
_Pulled via browser sampling_ — adjust if brand updates.

| Role | Hex | Notes |
|------|-----|-------|
| **Primary Gradient‑Start** | `#21D4FD` | Sky‑cyan (matches QPanda hero buttons) ([qpanda.bluepanda.cloud](https://qpanda.bluepanda.cloud/)) |
| **Primary Gradient‑End** | `#B721FF` | Electric violet |
| **Background Base** | `#0B0E13` | Near‑black canvas to let glass panels pop |
| **Surface Glass** | `rgba(255,255,255,0.10)` | White @10 % opacity + blur 20 px |
| **Text High** | `#FFFFFF` | 100 % white |
| **Text Muted** | `#C2C8D0` | 60 % white |
| **Success** | `#3BF5AE` | Optional tokens meter ok state |
| **Warning** | `#FFC978` | Approaching token limit |
| **Error** | `#FF6666` | Free tier exhausted banner |

> **Accessibility note**: On glass panels, overlay a 40 % linear‑gradient darkening mask to maintain WCAG 2.1 AA contrast for text.

## 3. Typography

| Style | Font | Size/Weight |
|-------|------|-------------|
| Headline (H1) | **"Inter"**, 700 | clamp(2.4rem,6vw,4rem) |
| Section Title (H2) | Inter 600 | 1.75rem |
| Body | Inter 400 | 1rem / 1.6 |
| Caption | Inter 400 | 0.875rem, 60 % opacity |

Google Font **Inter** is used site‑wide to match BluePanda aesthetic.

## 4. Layout & Components

### 4.1 Grid
* **12‑col fluid grid** with 80 px max content width per column @ ≥1280 px.
* Gutters: 24 px desktop, 16 px tablet, 12 px mobile.

### 4.2 Components

| Component | Key Specs |
|-----------|-----------|
| **Hero Pane** (Home) | Full‑width gradient background, glass card centered (max‑width 720 px) with drop shadow `0 40px 80px rgba(33,212,253,.25)`. CTA buttons glass‑pill with inner neon ring. |
| **Bot Card** | 280 × 320 px; glass background; top‑center 96 px circular logo (SVG). Card color accent ring uses bot.themeColor @ 50 % opacity. Hover: scale 1.04 + glow shadow. |
| **Chat Window** | Two columns: 70 % messages, 30 % bot bio. Each message bubble = mini‑glass chip (blur 12 px). User bubbles right‑aligned with accent gradient border‑left 4 px. |
| **Token Meter** | Thin glass pill (height 8 px) with gradient fill; animates width via CSS `transition: width .4s ease`. When ≤10 % tokens, gradient shifts to warning. |
| **BYO‑Key Modal** | Centered 480 × auto panel; glass background; enters with `scale(0.9) → scale(1)` & `opacity 0→1` in 180 ms. |

## 5. Motion & Interaction

| Trigger | Animation |
|---------|-----------|
| Card hover | `transform: translateY(-4px)` + shadow intensify + subtle 3 ° rotateX to mimic parallax. |
| Page route | Fade‑through + upward slide of hero glass panel (`200 ms` ease‑out). |
| Chat stream | Typing dots pulse opacity 0.3→1 every `500 ms`; message bubble slide‑in from bottom `translateY(12px)→0`. |

## 6. Assets

* **Logo template**: create in Figma with 3‑layer glass circles + bot icon glyph. Color each logo by overriding gradient with bot.themeColor set.
* **Icons**: Lucide‑react line icons – 24 px.
* **Background animation**: Canvas/WebGL shader swirling the primary gradient; fallback to static SVG gradient for low‑power devices.

---

*Version 1.0 — 31 Aug 2025 (Europe/London)*

