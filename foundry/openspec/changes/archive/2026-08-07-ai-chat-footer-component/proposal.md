## Why

Most Fleet marketing and product surfaces already expose agent-readable context via `llms.txt`, `/api/ai`, and structured data. The missing piece is the human-facing call-to-action: a footer row that lets visitors ask Claude, ChatGPT, Gemini, Perplexity, or Grok about the company or product.

The npm packages that do this today (`ai-summary-footer`, `@ai-summary/react`, etc.) are hobby-grade, newly published, and lightly maintained. None match Fleet's quality bar or design conventions. Building an internal package gives us:

- Consistent branding and accessibility across Fleet sites.
- Full control over icon style, prompt wording, provider set, and theming.
- No third-party script dependency or external tracking.
- A reusable asset that any Vite + React or Astro-with-React-islands project can import.

## What Changes

Create a new Fleet package at `foundry/packages/ai-chat-footer` named `@saas-maker/ai-chat-footer`.

- A React component `<AIChatFooter />` that renders provider icons as links to each model's chat interface with a pre-filled prompt.
- Inline SVG icons for Claude, ChatGPT, Gemini, Perplexity, and Grok. No icon font or image asset dependencies.
- TypeScript types, customizable labels, prompt templates, provider filtering, and style overrides.
- Default accessible markup (ARIA labels, keyboard focus, screen-reader text).
- A matching CSS file and CSS custom properties for light/dark theming.
- Build output (ESM + CJS + types) via `tsup`, linting via Biome, tests via Node's built-in test runner.
- Package modeled on the existing `@saas-maker/feedback` package conventions.

## Capabilities

### New Capabilities

- `@saas-maker/ai-chat-footer` — backend-free React footer widget for redirecting visitors to popular AI chat interfaces with a pre-filled prompt.

### Modified Capabilities

- None.

## Impact

- Adds one new internal package under `foundry/packages/`.
- Adds no backend, no analytics, no secrets, no cookies, no third-party scripts, no deployment, no migration.
- Consumers import the component and CSS; all links open on the visitor's chosen AI platform in a new tab.
- Does not replace or duplicate the existing agent-surface infrastructure (`llms.txt`, `/api/ai`, JSON-LD). It complements it for human visitors.
