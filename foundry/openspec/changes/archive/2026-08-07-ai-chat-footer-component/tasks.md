## 1. Package Scaffold

- [x] 1.1 Create `foundry/packages/ai-chat-footer` with `package.json`, `tsconfig.json`, `biome.json`, `.gitignore`, and `LICENSE` matching `@saas-maker/feedback` conventions
- [x] 1.2 Add `AGENTS.md` scoped to the package boundary
- [x] 1.3 Configure `tsup` build for ESM, CJS, and types with `react` and `react-dom` as external

## 2. Core Implementation

- [x] 2.1 Define TypeScript types: `AIChatProvider`, `AIChatFooterProps`, `PromptContext`, `Theme`
- [x] 2.2 Implement provider URL builders for Claude, ChatGPT, Gemini, Perplexity, and Grok
- [x] 2.3 Implement inline SVG icon components for each provider with `aria-hidden` and configurable `className`
- [x] 2.4 Implement `AIChatFooter` React component with prompt templating, provider filtering, theme handling, and accessible markup
- [x] 2.5 Ship `index.css` using CSS custom properties for colors, spacing, and icon sizing, with light/dark/auto support

## 3. Testing and Quality

- [x] 3.1 Add Node built-in tests for URL builders (correct domains, query encoding, prompt interpolation)
- [x] 3.2 Add type-level contract tests for public exports
- [x] 3.3 Add Biome lint configuration and ensure `pnpm lint` passes
- [x] 3.4 Verify `pnpm check` (typecheck + lint + build + test + dry-run pack) exits zero

## 4. Documentation

- [x] 4.1 Write `README.md` with installation, usage examples, props table, customization guide, and supported providers
- [x] 4.2 Document prompt placeholders and provider deep-link behavior
- [x] 4.3 Note that the package is backend-free and opens links in a new tab

## 5. Integration Verification

- [x] 5.1 Run a local pack-and-install smoke test via `pnpm pack --dry-run`
- [x] 5.2 Confirm build outputs include ESM, CJS, types, and CSS
- [x] 5.3 Confirm no runtime dependencies beyond React peer dependencies

## 6. Archive and Status Update

- [x] 6.1 Run OpenSpec archive after verification passes
- [x] 6.2 Update `PROJECT_STATUS.md` to list the new `@saas-maker/ai-chat-footer` package
