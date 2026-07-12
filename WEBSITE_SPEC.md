# SIVP Website — Build Spec

The AI engine (10 agents + NEXUS) is built in n8n and exposed as a webhook:
`POST http://localhost:5678/webhook/validate-idea` → returns a structured JSON report.
This document specifies the **website** that wraps that engine.

## UI design style: **Brutalist base + hybrid accents** (deliberately not AI-generated)
Per-element style assignment (strict):
- **Brutalism = overall site/layout.** Canvas cream `#F2EEE3` (dark sections `#4A3DFF`), ink `#141414`,
  2px black borders, hard offset shadows `5px 5px 0 #141414` (no blur), oversized UPPERCASE headings
  (weight 800, letter-spacing negative), monospace `// eyebrow labels` (Courier). Accent electric blue
  `#4A3DFF`; highlight yellow `#FFD84D`. Corners square (radius 0) for brutalist blocks.
- **Skeuomorphism = buttons.** Beveled/tactile: vertical gradient fill, 2–2.5px black border,
  inner top highlight `inset 0 2px 0 rgba(255,255,255,.5)`, hard bottom edge `0 6px 0 <darker>` that
  visually depresses on `:active`. Slight radius (8–10px). Primary = blue gradient; secondary = white→cream.
- **Neumorphism = charts, score panels, images.** Soft extruded clay: same-tone bg `#ECE7DA`, dual shadow
  `7px 7px 15px #c8c3b4, -7px -7px 15px #ffffff`, no border, radius 18–20px. Bar tracks are inset
  (`inset` shadows); fills use the blue accent.
- **Glassmorphism = floating navbar, report tab bar, burger menu, any floating overlay.** Frosted:
  `rgba(255,255,255,.5) + backdrop-blur(14px)`, thin border, detached with margin, soft drop shadow.
- Fonts: Helvetica/Arial-grotesque display + Courier mono for labels. Motion (Framer Motion): restrained
  — fade-up on scroll, button press depress; no blobs/parallax/glow.

## Tech stack (free-tier) — 3-tier, matches README
- **Frontend:** **Vite + React + TypeScript**, **Tailwind CSS** (glassmorphism), **Framer Motion** (animations), **React Router**, **Lucide React** (icons), **Recharts** (charts). Dark mode.
- **Backend:** **Spring Boot** — thin bridge that receives the idea and calls the n8n webhook (plays to Java strength; matches README).
- **Engine:** **n8n webhook** (`/webhook/validate-idea`) — the 10 agents.
- **Auth/DB:** **Supabase** (Auth + Postgres) — Phase 2.
- Deploy: Vercel/Netlify (static frontend) + Spring Boot host + hosted/tunnelled n8n.

## Design language
Reference feel: Stripe · Linear · Notion · Anthropic — light minimalism (see UI design style above).
The 16-section landing structure from the user's design brief still applies (nav, hero, trusted-by,
how-it-works, pipeline visualization, agent team, features, dashboard preview, roles, comparison,
reports showcase, testimonials, pricing, FAQ, final CTA, footer) — restyled minimalist.

## Locked decisions
1. **Frontend = Vite React SPA** (React Router). **Backend = Spring Boot** bridge to n8n (matches README).
2. **Auth later** — Phase 1 ships landing + idea→report flow, no login.
3. **n8n stays local** for now; frontend→Spring Boot→n8n (backend avoids browser CORS).
4. **Synchronous MVP** — submit → "analyzing… (30–90s)" → show report. Async job+polling later.
5. **Build the landing page first** (this design brief), then the functional idea-form + report, then backend bridge, then auth.

## Requirements

### A. Landing Page
- Navbar, 5 routes: **Home · How It Works · Features · Pricing · Get Started**.
- Brand: 🚀 "SIVP" wordmark.
- Hero: *"Validate your startup idea before you build it,"* + CTA **"Validate My Idea"** + glass dashboard-preview visual.

### B. Idea Submission (core feature)
- 7-field form: Startup Name, Industry, Problem Statement, Solution, Target Audience, Geographic Market, Description.
- Submit → POST to n8n webhook → "Analyzing… (30–90s)" → report.

### C. Validation Functionality
- On submit, create a report record → redirect to **`/report/[id]`** (dynamic route) rendering the pipeline JSON.
- Phase 1: report held in client state / sessionStorage. Phase 2: persisted in Supabase.

### D. Report / Dashboard Page
- Header: startup name, industry, **Investor Readiness Score** (0–100 gauge + category).
- Sections (one per agent): Validation/PMF · Market TAM/SAM/SOM · Competitors · Business Model/MVP · SWOT · Growth/GTM · Financials/Funding/Valuation · Ecosystem (mentors/grants/legal) · Progress tracker · Executive Summary.
- Charts (Recharts): score gauge, TAM/SAM/SOM bar, score-breakdown radar, growth trend.
- Export: PDF · DOCX · Markdown.

### E. Auth & Roles (Phase 2)
- Supabase Auth; roles: Founder · Mentor · Incubator Admin · Super Admin, each with its own dashboard.

### F. Production expectations
- Scalable architecture, clean structure, proper API design, DB schema, dynamic routing,
  rate-limit handling (Gemini/n8n 429s), deployment readiness, error handling (pipeline timeouts/partial failures), maintainable code.

## Build phases
- **Phase 1 (MVP):** landing → idea form → API route → n8n → report page with charts. No auth, no DB.
- **Phase 2:** Supabase auth + roles + persist ideas/reports + founder dashboard/history.
- **Phase 3:** exports (PDF/DOCX/MD), async job+polling, deploy (Vercel + hosted n8n).
