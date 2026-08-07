# ai-chat-footer Specification

## Purpose
TBD - created by archiving change ai-chat-footer-component. Update Purpose after archive.
## Requirements
### Requirement: Backend-free AI chat footer component
The package SHALL provide a React component that renders a footer section inviting visitors to ask popular AI assistants about the product, with no backend, no API keys, no analytics, and no cookies.

#### Scenario: Default usage
- **WHEN** a consumer renders `<AIChatFooter companyName="Acme" companyUrl="https://acme.com" />`
- **THEN** it displays a label and a row of clickable provider icons that open the visitor's chosen AI chat interface with a pre-filled prompt about Acme

#### Scenario: Consumer overrides the prompt
- **WHEN** a consumer passes a `prompt` prop or template string
- **THEN** the component substitutes `{companyName}` and `{companyUrl}` placeholders and uses the result for every provider link

#### Scenario: Consumer selects providers
- **WHEN** a consumer passes a `providers` array
- **THEN** only those providers are rendered, in the supplied order

### Requirement: Inline, dependency-free SVG provider icons
The package SHALL ship inline SVG icons for Claude, ChatGPT, Gemini, Perplexity, and Grok. It SHALL NOT depend on icon fonts, image CDNs, or runtime icon libraries.

#### Scenario: Icon renders
- **WHEN** the component mounts
- **THEN** each provider icon is rendered as an inline SVG with a unique, deterministic title/aria-label

#### Scenario: No external requests
- **WHEN** the component is used on a page
- **THEN** no additional network request is made for icons or styles

### Requirement: Accessible markup
The component SHALL be keyboard-focusable, expose ARIA labels, and provide screen-reader text for each provider link.

#### Scenario: Keyboard navigation
- **WHEN** a visitor tabs through the footer
- **THEN** each provider link receives focus and opens in a new tab via Enter

#### Scenario: Screen reader usage
- **WHEN** a screen reader announces a provider link
- **THEN** it reads a descriptive label such as "Ask Claude about Acme"

### Requirement: Customizable theming
The package SHALL support light, dark, and auto color schemes and allow consumers to override styles via CSS custom properties and an optional `className`.

#### Scenario: Auto theme
- **WHEN** `theme="auto"` is set and the user's system prefers dark mode
- **THEN** the component applies dark-themed styles

#### Scenario: Style overrides
- **WHEN** a consumer passes a `className` or targets the documented CSS selectors
- **THEN** the rendered output accepts those overrides without specificity battles

### Requirement: Provider deep-link correctness
Each provider icon SHALL link to the canonical chat/new-conversation URL for that service with the prompt passed as a query parameter where supported.

#### Scenario: Claude
- **WHEN** a visitor clicks the Claude icon
- **THEN** the browser opens `https://claude.ai/new?q={encodedPrompt}` in a new tab

#### Scenario: ChatGPT
- **WHEN** a visitor clicks the ChatGPT icon
- **THEN** the browser opens `https://chat.openai.com/?q={encodedPrompt}` or the current canonical equivalent

#### Scenario: Gemini
- **WHEN** a visitor clicks the Gemini icon
- **THEN** the browser opens `https://gemini.google.com/app?is_sa=1&is_sa_p={encodedPrompt}` or the current canonical equivalent

#### Scenario: Perplexity
- **WHEN** a visitor clicks the Perplexity icon
- **THEN** the browser opens `https://www.perplexity.ai/?q={encodedPrompt}`

#### Scenario: Grok
- **WHEN** a visitor clicks the Grok icon
- **THEN** the browser opens `https://grok.com/?q={encodedPrompt}`

### Requirement: TypeScript-first public API
The package SHALL export typed props, provider identifiers, and prompt builders. Consumers SHALL get autocomplete and compile-time validation.

#### Scenario: TypeScript consumer
- **WHEN** a TypeScript project imports the component
- **THEN** `companyName` and `companyUrl` are required, `providers` is typed as `AIChatProvider[]`, and invalid props produce type errors

### Requirement: Build and quality parity with `@saas-maker/feedback`
The package SHALL use `tsup` for ESM/CJS/types output, `biome` for linting, Node's built-in test runner, and a `pnpm check` script that runs typecheck, lint, build, tests, and pack verification.

#### Scenario: Continuous integration
- **WHEN** `pnpm check` runs in the package directory
- **THEN** it exits zero only if types, lint, build, tests, and dry-run pack all pass

### Requirement: No secret or provider-specific configuration
The package SHALL NOT read environment variables, API keys, provider tokens, or project-specific configuration. All behavior is driven by props and documented defaults.

#### Scenario: Public package
- **WHEN** the package is published or consumed
- **THEN** it contains no hardcoded Fleet secrets, no `.env` handling, and no network calls

