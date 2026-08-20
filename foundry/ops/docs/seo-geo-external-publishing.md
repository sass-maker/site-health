# Fleet external SEO/GEO publishing matrix

**Strategy reviewed:** 2026-08-20

**Coverage:** all P1 (4), all P2 (26), all eligible finished P4 (9)

**Source of truth:** `foundry/ops/config/seo-geo-publishing.json`

This is the current external publishing strategy, not a completion tracker or permission to mass-submit. External URLs and outcomes belong in the existing submission receipts or GitHub Issues. Actual P2 execution remains limited to at most five projects per work cycle.

## How to read execution and content ownership

| Execution | Boundary |
|---|---|
| Agent direct | After authentication and exact campaign approval, the agent can prepare, submit, verify, and receipt the action end to end. |
| Agent with unblock | The agent still owns execution; the owner intervenes only when authentication, CAPTCHA/2FA, payment, legal attestation, release authority, or an unexpected moderation gate requires it. |
| Owner only | Reserved for a destination that explicitly requires the owner to perform the action personally. No current channel is classified this way. |

| Content owner | Boundary |
|---|---|
| Agent | The agent can derive and adapt factual content from verified product evidence. |
| Shared | The agent drafts and adapts; the owner reviews identity-sensitive or first-person claims. |
| Owner | The content depends on the owner's personal experience, reputation, or judgment, but the agent can still execute the approved post. |

Authentication does not override venue rules, CAPTCHA/2FA, payment approval, or the requirement for an authentic human contribution. No channel guarantees rankings, followed links, acceptance, traffic, or LLM citations.

## Operating principles

- Publish a useful source asset first; adapt it to a venue instead of pasting the same promotion everywhere.
- A placement is a fit recommendation, not a promise of ranking, backlink value, acceptance, or AI citation.
- Respect each community's current rules and disclose the maker relationship where relevant.
- Keep completion and outcome evidence in GitHub Issues or existing submission receipts—not in this strategy file.
- Work on at most five P2 projects in one execution cycle even though this program covers every P2 identity.

## Channel registry

| Channel | Kind | Execution | Default content owner | Best use and current constraint | Reviewed |
|---|---|---|---|---|---|
| [Medium](https://help.medium.com/hc/en-us/articles/225168768-Writing-and-publishing-your-first-story) | long-form | Agent direct | Shared | Indexable long-form explanation and publication distribution. Publish an original story or submit a tailored draft to a relevant publication; use the original product article as canonical when republishing. | 2026-08-12 |
| [DEV Community](https://dev.to/help/getting-started) | long-form | Agent direct | Agent | Developer discovery, discussion, and indexable technical articles. Use only for developer-relevant material; preserve the original canonical URL for republished articles and avoid product-only copy. | 2026-08-12 |
| [Hashnode](https://docs.hashnode.com/blogs/editor/writing-a-blog-post) | long-form | Agent direct | Agent | Developer-focused articles with explicit SEO metadata and original-URL support. Use for technical tutorials or engineering case studies and set the original URL when republishing. | 2026-08-12 |
| [LinkedIn articles and newsletters](https://www.linkedin.com/help/linkedin/answer/a522525/linkedin-newsletters?lang=en) | professional-publishing | Agent with unblock | Owner | Founder authority, professional distribution, and publicly readable long-form pages. Use the founder's real experience and point of view; newsletters require a coherent recurring topic rather than one product feed per project. | 2026-08-12 |
| [Substack](https://support.substack.com/hc/en-us/articles/360037831771-How-do-I-publish-a-new-post-on-Substack) | newsletter | Agent direct | Owner | Durable essays and subscriber distribution around a coherent editorial theme. Publish portfolio-level themes or evidence-led series; do not create a thin newsletter for every product. | 2026-08-12 |
| [Quora answers and Spaces](https://help.quora.com/hc/en-us/articles/360061486651-About-Quora-Spaces) | question-answer | Agent with unblock | Owner | Answer-led discovery and topic pages that can surface in search and answer engines. Answer an existing question from experience before linking; a Space must have a narrow editorial mission and sustained useful content. | 2026-08-12 |
| [Notion Sites](https://www.notion.com/help/public-pages-and-web-publishing) | hosted-resource | Agent direct | Agent | Fast public supporting resources, datasets, templates, or media kits with optional indexing. Use only for a distinct supporting asset that the product site cannot host yet; review every subpage and contributor metadata before publishing. | 2026-08-12 |
| [Relevant Reddit communities](https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam) | community | Agent with unblock | Owner | High-context feedback and discovery when a contribution genuinely fits one community. Check each community's rules, participate authentically, disclose affiliation, and never repeat or mass-post product links. | 2026-08-12 |
| [Hacker News / Show HN](https://news.ycombinator.com/showhn.html) | community-launch | Agent with unblock | Owner | Technical founder feedback and discovery for substantial, directly usable work. Use Show HN only for something the maker built and users can try without a waitlist; use a normal submission for reading material and never solicit votes. | 2026-08-12 |
| [Indie Hackers](https://www.indiehackers.com/) | founder-community | Agent with unblock | Owner | Build narrative, decisions, metrics, and founder feedback. Lead with a concrete lesson, decision, or result and participate as the maker rather than dropping a listing. | 2026-08-12 |
| [Product Hunt](https://help.producthunt.com/en/articles/479557-how-to-post-a-product) | product-launch | Agent with unblock | Owner | Time-bounded product discovery and a durable product page. Use a personal account at least one week old for a live digital product; do not submit waitlists, directories, lists, reports, courses, newsletters, or other excluded formats. | 2026-08-12 |
| [AlternativeTo](https://alternativeto.net/faq/) | alternative-directory | Agent direct | Shared | Category-comparison discovery for eligible software applications. Suggest only an eligible English-language application after the account waiting period; exclusions include directories/lists, simple AI utilities, résumé builders, ATS checkers, and other categories in the current FAQ. | 2026-08-12 |
| [SaaSHub](https://www.saashub.com/) | software-directory | Agent direct | Shared | Software category and alternative discovery. Use only for a maintained software product with a stable public URL and accurate category comparison; review the listing after moderation. | 2026-08-12 |
| [DevHunt](https://devhunt.org/) | developer-launch | Agent direct | Shared | Launch discovery for tools built for developers. Use only for a developer-facing product with a working demo and concrete technical value. | 2026-08-12 |
| [Uneed](https://www.uneed.best/) | product-directory | Agent direct | Shared | General product discovery and a moderated listing. Use selectively for polished, public products; confirm the current free or paid submission route before proceeding. | 2026-08-12 |
| [There's An AI For That](https://theresanaiforthat.com/submit/) | ai-directory | Agent with unblock | Owner | AI-tool category discovery. Use only for a genuine AI product with a stable public experience; verify current pricing and editorial requirements before paying or submitting. | 2026-08-12 |
| [G2 and Capterra](https://sell.g2.com/create-free-profile) | review-directory | Agent with unblock | Owner | Buyer-intent category pages and verified customer reviews for established B2B software. Use only when the product has a stable commercial category, owner-managed vendor profile, and real users who can review without incentives or fabrication. | 2026-08-12 |
| [GitHub repository and organization profile](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository) | technical-source | Agent direct | Agent | Canonical source, documentation, releases, topics, and citable product identity. Keep the canonical repository README, description, homepage, topics, release notes, and organization profile accurate before seeking third-party links. | 2026-08-12 |
| [Relevant GitHub awesome lists](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request) | curated-contribution | Agent direct | Shared | High-context third-party citation inside maintained technical collections. Open one contribution per genuinely relevant list, follow its contribution guide, and explain category fit without promotional language. | 2026-08-12 |
| [Relevant GitHub Discussions](https://docs.github.com/en/discussions/quickstart) | technical-community | Agent direct | Owner | Transparent, citable conversation around an upstream ecosystem or project. Contribute only to an existing relevant conversation or a repository that explicitly welcomes the topic; do not use Discussions as a link-drop surface. | 2026-08-12 |
| [Hugging Face Hub](https://huggingface.co/docs/hub/en/index) | ml-artifact | Agent direct | Agent | Discoverable model, dataset, paper, or Space pages with reusable artifacts. Publish a real model, dataset, paper link, or working Space with a complete card; never use the Hub as a generic backlink page. | 2026-08-12 |
| [arXiv, Zenodo, OSF, and paper indexes](https://help.zenodo.org/docs/deposit/create-new-upload/) | research-publication | Agent with unblock | Owner | Stable scholarly identity, metadata, citations, and where applicable a DOI. Use only for an actual paper, dataset, or research artifact; preserve authorship, licenses, versions, and canonical project links. | 2026-08-12 |
| [npm, pkg.go.dev, and ecosystem registries](https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages/) | package-distribution | Agent with unblock | Agent | Canonical installable artifact pages and ecosystem search visibility. Use only for maintained installable packages; keep package metadata, repository, license, documentation, provenance, and versions accurate. | 2026-08-12 |
| [Apple App Store and relevant marketplaces](https://developer.apple.com/app-store/submissions/) | app-distribution | Agent with unblock | Owner | Canonical install surface, category discovery, and reviews for packaged applications. Use only after the distributable app, privacy disclosures, screenshots, support URL, and owner-controlled store account are ready. | 2026-08-12 |
| [Specialist newsletters, blogs, and podcasts](https://www.muckrack.com/blog/2020/07/16/how-to-pitch-journalists) | earned-media | Agent with unblock | Owner | Independent contextual mentions and domain-relevant referral traffic. Pitch a specific evidence-backed story to a named editor or host; avoid bulk outreach and never imply coverage is guaranteed. | 2026-08-12 |
| [YouTube](https://support.google.com/youtube/answer/57407) | video | Agent direct | Shared | Searchable demonstrations, transcripts, and product proof. Publish a real walkthrough, benchmark, or explanation with accurate chapters, description, disclosure, and canonical links. | 2026-08-12 |
| [Product-specific forums and communities](https://www.discourse.org/guidelines) | community | Agent with unblock | Owner | Highest topical fit when the project solves a real problem for an existing community. Name and verify the exact community before posting, follow its local rules, and contribute a useful artifact or answer rather than generic launch copy. | 2026-08-12 |

## P1 — 4

### CodeVetter — Publishable

**Canonical:** [https://codevetter.com](https://codevetter.com)

**Narrative:** A desktop-first, offline-capable workbench for reviewing and execution-verifying agent-generated changes with reproducible evidence.

**Source asset:** An engineering case study that preserves the task and agent change, runs authoritative checks, and packages the resulting evidence and verdict.

| Rank | Channel | Format | Execution | Content owner | Why this fits |
|---|---|---|---|---|---|
| Primary | [DEV Community](https://dev.to/help/getting-started) | Technical case study with executable verification evidence | Agent direct | Agent | Developer audience and reproducible task-to-evidence workflow. |
| Primary | [Relevant GitHub awesome lists](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request) | Contribution to maintained AI code-review and coding-agent verification lists | Agent direct | Shared | Direct category match and existing repository proof. |
| Secondary | [Hacker News / Show HN](https://news.ycombinator.com/showhn.html) | Show HN with a directly usable build | Agent with unblock | Owner | Substantial maker-built developer tool that can be tried. |
| Secondary | [Product Hunt](https://help.producthunt.com/en/articles/479557-how-to-post-a-product) | Desktop verification-product launch | Agent with unblock | Owner | Live digital product with a clear review and verification use case. |
| Secondary | [AlternativeTo](https://alternativeto.net/faq/) | Code-review and verification software listing | Agent direct | Shared | Eligible application positioned against established review tools. |

### HeyPace — Publishable

**Canonical:** [https://heypace.app](https://heypace.app)

**Narrative:** A local-only macOS voice agent that can reason about what is visible on screen without sending the interaction history to a hosted assistant.

**Source asset:** A privacy and latency walkthrough showing an on-device screen-aware task from voice request to result.

| Rank | Channel | Format | Execution | Content owner | Why this fits |
|---|---|---|---|---|---|
| Primary | [Relevant GitHub awesome lists](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request) | awesome-mac contribution | Agent direct | Shared | Native macOS utility with an already identified curated-list venue. |
| Primary | [YouTube](https://support.google.com/youtube/answer/57407) | Short screen-aware voice workflow demo | Agent direct | Shared | The interaction is easier to verify visually than through launch copy. |
| Primary | [Product-specific forums and communities](https://www.discourse.org/guidelines) | r/macapps or equivalent rules-compliant maker post | Agent with unblock | Owner | Direct audience for local macOS utilities. |
| Secondary | [Product Hunt](https://help.producthunt.com/en/articles/479557-how-to-post-a-product) | macOS app launch | Agent with unblock | Owner | A working downloadable digital product. |
| Secondary | [AlternativeTo](https://alternativeto.net/faq/) | Local voice assistant listing | Agent direct | Shared | Software alternative with distinct privacy and device constraints. |

### PostTrainLLM — Publishable

**Canonical:** [https://posttrainllm.com](https://posttrainllm.com)

**Narrative:** A Mac-local factory for training, evaluating, and running specialist language models.

**Source asset:** A reproducible specialist-model recipe containing data, evaluation, model card, and local performance evidence.

| Rank | Channel | Format | Execution | Content owner | Why this fits |
|---|---|---|---|---|---|
| Primary | [Hugging Face Hub](https://huggingface.co/docs/hub/en/index) | Model, dataset, and Space pages with complete cards | Agent direct | Agent | The product creates genuine reusable ML artifacts. |
| Primary | [Relevant GitHub awesome lists](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request) | Relevant MLX and local-LLM list contributions | Agent direct | Shared | Direct ecosystem fit with prior accepted submission targets. |
| Secondary | [Relevant Reddit communities](https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam) | Reproducible result post in r/LocalLLaMA | Agent with unblock | Owner | Community values local training details and measurable results. |
| Secondary | [DEV Community](https://dev.to/help/getting-started) | End-to-end local post-training tutorial | Agent direct | Agent | Developer education grounded in a working recipe. |
| Secondary | [Hacker News / Show HN](https://news.ycombinator.com/showhn.html) | Show HN with runnable local workflow | Agent with unblock | Owner | Substantial technical tool users can run. |

### Office OS — Publishable

**Canonical:** [https://office-os.sassmaker.com](https://office-os.sassmaker.com)

**Narrative:** A persistent office environment for coordinating agents and durable work.

**Source asset:** Use the verified informational site for an architecture walkthrough. Explain how local operation works, where employee authority stops, and how owners inspect the work. Do not suggest that the Mac app is publicly downloadable.

| Rank | Channel | Format | Execution | Content owner | Why this fits |
|---|---|---|---|---|---|
| Primary | [DEV Community](https://dev.to/help/getting-started) | Architecture case study grounded in the maintained informational site | Agent direct | Agent | Developer audience for local-first agent coordination and explicit authority boundaries. |
| Secondary | [Substack](https://support.substack.com/hc/en-us/articles/360037831771-How-do-I-publish-a-new-post-on-Substack) | Build note about durable, supervised AI employees | Agent direct | Owner | Founder narrative can link to the public system and privacy details without claiming binary availability. |

**Do not use:**

- **Hacker News / Show HN:** Explicitly excluded from the current campaign by the owner.
- **Product Hunt:** Do not launch until a trusted public Mac distribution channel exists.
- **Apple App Store and relevant marketplaces:** No signed, notarized, publicly distributed binary is currently claimed.

## P2 — 26

### Foundry — Preparation only

**Canonical:** [https://fleet.sassmaker.com](https://fleet.sassmaker.com)

**Narrative:** A private operating system for maintaining a portfolio of independent software products.

**Source asset:** A privacy-safe standards excerpt and verified operational case study.

**Catalog blocker:** Foundry is a private operational platform; its public directory is owned by the standalone SaaS Maker repository. (verified 2026-08-20)

**Before publishing:**

- Approve a public Fleet narrative that exposes no private operational data.

**Future candidates after re-verification:** DEV Community, GitHub repository and organization profile

### ChatGPT Connections — Preparation only

**Narrative:** A read-only MCP gateway that exposes bounded product data to ChatGPT and other compatible clients.

**Source asset:** A privacy-safe integration guide and public compatibility contract that does not expose private product data or credentials.

**Catalog blocker:** The read-only MCP gateway is live for configured integrations, but it is a private operational service rather than a general public product. (verified 2026-08-21)

**Before publishing:**

- Approve a public product and security narrative before treating the private integration service as shareable.

**Future candidates after re-verification:** None in the current campaign.

### SaaS Maker — Publishable

**Canonical:** [https://sassmaker.com](https://sassmaker.com)

**Narrative:** A public directory of focused products plus a small hosted Feedback package and service.

**Source asset:** The live product directory, package documentation, and transparent Feedback API contract.

| Rank | Channel | Format | Execution | Content owner | Why this fits |
|---|---|---|---|---|---|
| Primary | [DEV Community](https://dev.to/help/getting-started) | Building a focused feedback service and public product directory | Agent direct | Agent | The package and API contract are directly useful to developers. |
| Primary | [LinkedIn articles and newsletters](https://www.linkedin.com/help/linkedin/answer/a522525/linkedin-newsletters?lang=en) | Founder operating-system essay | Agent with unblock | Owner | Professional audience for operational lessons and trade-offs. |
| Secondary | [Substack](https://support.substack.com/hc/en-us/articles/360037831771-How-do-I-publish-a-new-post-on-Substack) | Recurring build-and-operate field notes | Agent direct | Owner | Portfolio-level narrative fits a coherent newsletter better than individual product promotion. |
| Secondary | [GitHub repository and organization profile](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository) | Organization profile and public standards excerpts | Agent direct | Agent | Citable source for the fleet method without exposing private internals. |

**Do not use:**

- **Product Hunt:** Wait for a separately approved Feedback release rather than launching the directory alone.

### GitStat — Preparation only

**Narrative:** A client-side explorer for aggregate GitHub contribution and line statistics across repositories and organizations.

**Source asset:** A committed, publicly testable build with a clear GitHub OAuth and local-caching privacy boundary.

**Catalog blocker:** The local implementation has no committed main revision or verified public deployment yet. (verified 2026-08-20)

**Before publishing:**

- Commit the initial product source and verify a usable public deployment before publication.

**Future candidates after re-verification:** DEV Community, GitHub repository and organization profile

### Reel Pipeline — Preparation only

**Narrative:** A private media production, review, and policy-gated distribution pipeline.

**Source asset:** A rights-safe public example and approved explanation that exposes no private production inputs, credentials, or unpublished media.

**Catalog blocker:** The standalone source and retained artifact Worker are current, but no public product surface is approved for sharing. (verified 2026-08-20)

**Before publishing:**

- Approve a public product surface and a rights-safe evidence package before any external publication.

**Future candidates after re-verification:** None in the current campaign.

### Memory Map — Publishable

**Canonical:** [https://chatgpt.significanthobbies.com](https://chatgpt.significanthobbies.com)

**Narrative:** A private, browser-computed map of recurring themes, facts, and conversations in a ChatGPT export.

**Source asset:** A privacy-safe sample export walkthrough showing how raw conversations become an inspectable memory map.

| Rank | Channel | Format | Execution | Content owner | Why this fits |
|---|---|---|---|---|---|
| Primary | [Relevant Reddit communities](https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam) | Educational post for ChatGPT data and privacy communities | Agent with unblock | Owner | Direct user problem, provided no personal export data is exposed. |
| Primary | [Medium](https://help.medium.com/hc/en-us/articles/225168768-Writing-and-publishing-your-first-story) | Guide to auditing what ChatGPT remembers about you | Agent direct | Shared | Search-led question with a visual, practical workflow. |
| Secondary | [Product Hunt](https://help.producthunt.com/en/articles/479557-how-to-post-a-product) | Privacy utility launch | Agent with unblock | Owner | Working interactive tool rather than a static report. |
| Secondary | [Quora answers and Spaces](https://help.quora.com/hc/en-us/articles/360061486651-About-Quora-Spaces) | Answers about inspecting ChatGPT export data | Agent with unblock | Owner | Directly answers recurring user questions with a transparent method. |

### High Signal — Publishable

**Canonical:** [https://highsignal.app](https://highsignal.app)

**Narrative:** Evidence-backed daily intelligence across technology, startups, finance, and public markets with a public track record.

**Source asset:** A weekly retrospective that links forecasts, sources, corrections, and measured hit rates.

| Rank | Channel | Format | Execution | Content owner | Why this fits |
|---|---|---|---|---|---|
| Primary | [Substack](https://support.substack.com/hc/en-us/articles/360037831771-How-do-I-publish-a-new-post-on-Substack) | Evidence-led weekly intelligence edition | Agent direct | Owner | Recurring editorial product with a coherent reader promise. |
| Primary | [LinkedIn articles and newsletters](https://www.linkedin.com/help/linkedin/answer/a522525/linkedin-newsletters?lang=en) | Data-backed market or technology briefing | Agent with unblock | Owner | Professional audience and founder analysis. |
| Secondary | [Quora answers and Spaces](https://help.quora.com/hc/en-us/articles/360061486651-About-Quora-Spaces) | Source-backed answers to current market questions | Agent with unblock | Owner | Answer format can cite the public evidence trail. |
| Secondary | [Specialist newsletters, blogs, and podcasts](https://www.muckrack.com/blog/2020/07/16/how-to-pitch-journalists) | Targeted pitch around the public forecasting track record | Agent with unblock | Owner | Independent coverage requires a differentiated data story. |

**Do not use:**

- **Product Hunt:** The current surface is too close to a report/news product, a format Product Hunt says it does not feature.

### Research Papers — Publishable

**Canonical:** [https://papers.highsignal.app](https://papers.highsignal.app)

**Narrative:** Semantic paper discovery across a structured academic corpus with citation and research metadata.

**Source asset:** A documented dataset card and benchmark query set showing corpus coverage, provenance, and retrieval quality.

| Rank | Channel | Format | Execution | Content owner | Why this fits |
|---|---|---|---|---|---|
| Primary | [Hugging Face Hub](https://huggingface.co/docs/hub/en/index) | Dataset and demo Space with cards | Agent direct | Agent | A genuine structured research dataset and discoverable demo. |
| Primary | [arXiv, Zenodo, OSF, and paper indexes](https://help.zenodo.org/docs/deposit/create-new-upload/) | Versioned dataset or methods artifact | Agent with unblock | Owner | Stable metadata and citation are more valuable than generic launch listings. |
| Secondary | [Relevant Reddit communities](https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam) | Methods and benchmark post for research communities | Agent with unblock | Owner | Technical audience can interrogate coverage and retrieval evidence. |
| Secondary | [DEV Community](https://dev.to/help/getting-started) | Engineering the paper-discovery pipeline | Agent direct | Agent | Strong technical case study with reproducible architecture. |

**Do not use:**

- **AlternativeTo:** AlternativeTo disallows directories and lists; position the research artifact through scholarly and ML repositories instead.

### Knowledge Base — Publishable

**Canonical:** [https://knowledgebase.sassmaker.com](https://knowledgebase.sassmaker.com)

**Narrative:** Private agent search over specialized corpora with ranked citations, provenance, and schema-aware retrieval.

**Source asset:** A public benchmark corpus and evaluation showing answer citations, provenance, and retrieval failure cases.

| Rank | Channel | Format | Execution | Content owner | Why this fits |
|---|---|---|---|---|---|
| Primary | [DEV Community](https://dev.to/help/getting-started) | RAG evaluation case study with citation failures | Agent direct | Agent | Developer audience and evidence-heavy technical subject. |
| Primary | [Hugging Face Hub](https://huggingface.co/docs/hub/en/index) | Evaluation dataset or safe demo Space | Agent direct | Agent | Appropriate only for a real reusable corpus or runnable demo. |
| Secondary | [Relevant GitHub awesome lists](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request) | Relevant RAG and knowledge-tool list contribution | Agent direct | Shared | Direct technical category when the public repository or docs support it. |
| Secondary | [Relevant Reddit communities](https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam) | Failure-analysis post for r/LocalLLaMA | Agent with unblock | Owner | Community values retrieval evidence more than product claims. |

### Significant Hobbies — Publishable

**Canonical:** [https://significanthobbies.com](https://significanthobbies.com)

**Narrative:** A system for planning meaningful hobbies, side quests, rituals, and life journeys.

**Source asset:** A concrete personal planning method with a reusable public template and examples from real use.

| Rank | Channel | Format | Execution | Content owner | Why this fits |
|---|---|---|---|---|---|
| Primary | [Medium](https://help.medium.com/hc/en-us/articles/225168768-Writing-and-publishing-your-first-story) | Personal method essay with reusable template | Agent direct | Owner | The product depends on an authentic life-planning point of view. |
| Primary | [Quora answers and Spaces](https://help.quora.com/hc/en-us/articles/360061486651-About-Quora-Spaces) | Answers about sustaining hobbies and side quests | Agent with unblock | Owner | Recurring questions can be answered with the actual method. |
| Secondary | [Product Hunt](https://help.producthunt.com/en/articles/479557-how-to-post-a-product) | Life-planning product launch | Agent with unblock | Owner | Interactive planning product rather than a content list. |
| Secondary | [Product-specific forums and communities](https://www.discourse.org/guidelines) | Template-first contribution to planning communities | Agent with unblock | Owner | Useful artifact can stand alone without product promotion. |

### Reader — Publishable

**Canonical:** [https://read.significanthobbies.com](https://read.significanthobbies.com)

**Narrative:** A private reading workflow for capturing, annotating, revisiting, and discussing saved material.

**Source asset:** A complete read-later workflow comparison using one public article from capture through resurfacing and discussion.

| Rank | Channel | Format | Execution | Content owner | Why this fits |
|---|---|---|---|---|---|
| Primary | [AlternativeTo](https://alternativeto.net/faq/) | Read-later application listing | Agent direct | Shared | Clear alternative category and stable working application. |
| Primary | [Product Hunt](https://help.producthunt.com/en/articles/479557-how-to-post-a-product) | Reading workflow launch | Agent with unblock | Owner | Interactive software with an end-to-end user journey. |
| Secondary | [Medium](https://help.medium.com/hc/en-us/articles/225168768-Writing-and-publishing-your-first-story) | Method article on actually revisiting saved reading | Agent direct | Shared | Searchable problem with a product-backed workflow. |
| Secondary | [Relevant Reddit communities](https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam) | Workflow discussion in reading or productivity communities | Agent with unblock | Owner | User group directly experiences read-later backlog problems. |

### SWE Interview Prep — Publishable

**Canonical:** [https://learn.significanthobbies.com](https://learn.significanthobbies.com)

**Narrative:** A learning OS for software-engineering interview practice with spaced repetition, drills, and feedback.

**Source asset:** An open study protocol and sample spaced-repetition deck tied to measurable practice outcomes.

| Rank | Channel | Format | Execution | Content owner | Why this fits |
|---|---|---|---|---|---|
| Primary | [DEV Community](https://dev.to/help/getting-started) | Evidence-led interview practice guide | Agent direct | Agent | Direct developer-learning audience and reusable curriculum artifact. |
| Primary | [Relevant GitHub awesome lists](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request) | Contribution to maintained interview-prep resource lists | Agent direct | Shared | Useful public resource with direct category fit. |
| Secondary | [Relevant Reddit communities](https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam) | Study-method post in career communities | Agent with unblock | Owner | High user relevance if local self-promotion rules permit it. |
| Secondary | [Quora answers and Spaces](https://help.quora.com/hc/en-us/articles/360061486651-About-Quora-Spaces) | Detailed answers about interview study systems | Agent with unblock | Owner | Specific questions support durable explanatory answers. |

**Do not use:**

- **Product Hunt:** Product Hunt excludes courses and tutorials; do not submit unless the interactive software clearly qualifies independently of its curriculum.

### Calorie — Publishable

**Canonical:** [https://calorie.significanthobbies.com](https://calorie.significanthobbies.com)

**Narrative:** A private, local-first food, water, and weight journal with transparent timing guidance.

**Source asset:** A privacy model and product walkthrough using synthetic data, with clear non-medical boundaries.

| Rank | Channel | Format | Execution | Content owner | Why this fits |
|---|---|---|---|---|---|
| Primary | [Product Hunt](https://help.producthunt.com/en/articles/479557-how-to-post-a-product) | Local-first wellness journal launch | Agent with unblock | Owner | Working consumer application with a privacy distinction. |
| Primary | [AlternativeTo](https://alternativeto.net/faq/) | Food and weight journal listing | Agent direct | Shared | Eligible application alternative if described without medical claims. |
| Secondary | [Medium](https://help.medium.com/hc/en-us/articles/225168768-Writing-and-publishing-your-first-story) | Privacy-first self-tracking methodology | Agent direct | Shared | Can answer search intent without making health promises. |
| Secondary | [Product-specific forums and communities](https://www.discourse.org/guidelines) | Synthetic-data workflow shared under local health-community rules | Agent with unblock | Owner | Potentially useful, but requires careful community and safety judgment. |

### Setline — Preparation only

**Canonical:** [https://setline.significanthobbies.com](https://setline.significanthobbies.com)

**Narrative:** A mobile-first, offline workout execution tracker for user-authored plans, set logging, and rest timing.

**Source asset:** A no-cloud workout execution walkthrough using a complete user-authored training plan.

**Catalog blocker:** Landing is live at setline.significanthobbies.com from the ios-landings factory. Not ready to share: no public TestFlight or App Store build is approved. (verified 2026-08-17)

**Before publishing:**

- Publish a TestFlight or App Store build before treating the live landing as a distribution surface.

**Future candidates after re-verification:** Product Hunt, AlternativeTo, Product-specific forums and communities, YouTube

### Kith — Preparation only

**Canonical:** [https://kith.significanthobbies.com](https://kith.significanthobbies.com)

**Narrative:** A private iPhone app for the people you actually want to stay close to — closeness-weighted constellation home, standing notes, and a chronological log per person.

**Source asset:** A recorded walkthrough of adding a person, setting closeness, and reviewing a chronological log without contact-book import.

**Catalog blocker:** Landing is live at kith.significanthobbies.com from the ios-landings factory. Not ready to share: no public TestFlight or App Store build is approved. (verified 2026-08-17)

**Before publishing:**

- Publish a TestFlight or App Store build. The landing at kith.significanthobbies.com is already live.

**Future candidates after re-verification:** Product Hunt, AlternativeTo, YouTube

### iOS landings — Preparation only

**Canonical:** [https://journal.significanthobbies.com](https://journal.significanthobbies.com)

**Narrative:** A shared Astro factory that builds a separate static site for each Significant Hobbies iOS-first app.

**Source asset:** A per-product landing walkthrough that names one app, shows real screenshots, and keeps TestFlight gated.

**Catalog blocker:** Private factory whose Journal Pages deployment is live at journal.significanthobbies.com; Journal remains landing-only with no native release claim. (verified 2026-08-21)

**Before publishing:**

- Keep product-domain privacy and support URLs stable as App Store listings go live.

**Future candidates after re-verification:** GitHub repository and organization profile

### RolePatch — Publishable

**Canonical:** [https://rolepatch.com](https://rolepatch.com)

**Narrative:** AI-assisted résumé tailoring, role research, and interview preparation with inspectable job-fit evidence.

**Source asset:** A transparent before-and-after role analysis using a fictional résumé and a real public job description.

| Rank | Channel | Format | Execution | Content owner | Why this fits |
|---|---|---|---|---|---|
| Primary | [Medium](https://help.medium.com/hc/en-us/articles/225168768-Writing-and-publishing-your-first-story) | Evidence-led résumé tailoring walkthrough | Agent direct | Shared | Searchable job-seeker problem with a safe synthetic example. |
| Primary | [Quora answers and Spaces](https://help.quora.com/hc/en-us/articles/360061486651-About-Quora-Spaces) | Answers about tailoring a résumé to one role | Agent with unblock | Owner | Question-led context is stronger than a generic tool listing. |
| Secondary | [Product Hunt](https://help.producthunt.com/en/articles/479557-how-to-post-a-product) | Career workflow product launch | Agent with unblock | Owner | Live interactive software if positioned beyond static résumé generation. |
| Secondary | [Product-specific forums and communities](https://www.discourse.org/guidelines) | Fictional before-and-after critique under community rules | Agent with unblock | Owner | Relevant to résumé communities but requires careful disclosure and moderation. |

**Do not use:**

- **AlternativeTo:** AlternativeTo explicitly disallows résumé/CV builders and ATS résumé checkers.

### Karte — Publishable

**Canonical:** [https://karte.cc](https://karte.cc)

**Narrative:** An AI link-in-bio that turns a public profile into a conversation.

**Source asset:** A verified live profile, public agent manifest, and safe end-to-end conversation demo.

| Rank | Channel | Format | Execution | Content owner | Why this fits |
|---|---|---|---|---|---|
| Primary | [DEV Community](https://dev.to/help/getting-started) | Technical walkthrough of the public agent profile and manifest | Agent direct | Agent | Developer audience can inspect the live runtime, sitemap, and agent-readable surface. |
| Primary | [Relevant GitHub awesome lists](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request) | Contribution to maintained AI profile and agent-interface lists | Agent direct | Shared | Direct category fit when the canonical karte.cc identity is stated clearly. |
| Secondary | [YouTube](https://support.google.com/youtube/answer/57407) | Safe end-to-end public profile conversation demo | Agent direct | Shared | The interaction is easier to evaluate when demonstrated visibly. |

**Do not use:**

- **Hacker News / Show HN:** Explicitly excluded from the current campaign by the owner.
- **Product Hunt:** Cut from the current account-gated wave; revisit only with a separate approved campaign.

### Starboard — Publishable

**Canonical:** [https://starboard.codevetter.com](https://starboard.codevetter.com)

**Narrative:** Project-aware GitHub repository discovery with hybrid search, collections, and evidence-backed tool intelligence.

**Source asset:** A benchmark and workflow showing lexical and semantic retrieval, project grounding, and traceable tool recommendations across a realistically large GitHub stars library.

| Rank | Channel | Format | Execution | Content owner | Why this fits |
|---|---|---|---|---|---|
| Primary | [Relevant GitHub awesome lists](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request) | Contribution to GitHub productivity and knowledge-tool lists | Agent direct | Shared | GitHub-native product with direct curator relevance. |
| Primary | [DEV Community](https://dev.to/help/getting-started) | Technical article on hybrid GitHub-star search and project-aware tool discovery | Agent direct | Agent | Developer problem and inspectable implementation. |
| Secondary | [Hacker News / Show HN](https://news.ycombinator.com/showhn.html) | Show HN with an immediately usable demo | Agent with unblock | Owner | Substantial developer tool that can be tried. |
| Secondary | [AlternativeTo](https://alternativeto.net/faq/) | GitHub bookmarks organizer listing | Agent direct | Shared | Recognizable application category; disambiguate the generic product name. |

### App Health — Publishable

**Canonical:** [https://health.sassmaker.com](https://health.sassmaker.com)

**Narrative:** Privacy-first endpoint health for Node, Go, and OpenTelemetry services using aggregate-only telemetry.

**Source asset:** A runnable integration example plus an explicit telemetry and privacy data-flow diagram.

| Rank | Channel | Format | Execution | Content owner | Why this fits |
|---|---|---|---|---|---|
| Primary | [npm, pkg.go.dev, and ecosystem registries](https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages/) | Complete Node and Go package pages | Agent with unblock | Agent | Canonical install surfaces for the actual SDKs. |
| Primary | [DEV Community](https://dev.to/help/getting-started) | OpenTelemetry endpoint-health implementation guide | Agent direct | Agent | Direct service-operator audience and runnable example. |
| Secondary | [Relevant GitHub awesome lists](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request) | Observability-list contribution | Agent direct | Shared | Relevant open-source monitoring category with package proof. |
| Secondary | [Product-specific forums and communities](https://www.discourse.org/guidelines) | r/devops or OpenTelemetry community integration note | Agent with unblock | Owner | Practitioners can evaluate the privacy and deployment trade-offs. |

### Mashup — Preparation only

**Narrative:** A local media experiment for assembling or transforming video assets.

**Source asset:** A distributable build, before-and-after media example, and clear rights-safe input provenance.

**Catalog blocker:** No usable distributed or provider-hosted surface is deployed, and the owner cut Mashup from the current SEO/GEO campaign. (verified 2026-08-16)

**Before publishing:**

- The owner cut Mashup from the current SEO/GEO campaign; a future campaign requires a usable distributed or provider-hosted surface and new approval.

**Future candidates after re-verification:** None in the current campaign.

### Motion — Publishable

**Canonical:** [https://motion.significanthobbies.com](https://motion.significanthobbies.com)

**Narrative:** An iPhone-hosted game that uses the player's body as the controller and can mirror to a larger screen.

**Source asset:** A short real-room gameplay video showing calibration, movement input, latency, and screen mirroring.

| Rank | Channel | Format | Execution | Content owner | Why this fits |
|---|---|---|---|---|---|
| Primary | [YouTube](https://support.google.com/youtube/answer/57407) | Uncut gameplay and setup demonstration | Agent direct | Shared | Physical interaction must be seen to be understood. |
| Primary | [Product Hunt](https://help.producthunt.com/en/articles/479557-how-to-post-a-product) | Playable motion-game launch | Agent with unblock | Owner | Directly usable digital game with a novel control interface. |
| Secondary | [Product-specific forums and communities](https://www.discourse.org/guidelines) | Maker post in iOS, indie-game, or accessibility communities | Agent with unblock | Owner | Community choice depends on the demonstrated use case and local rules. |
| Secondary | [Specialist newsletters, blogs, and podcasts](https://www.muckrack.com/blog/2020/07/16/how-to-pitch-journalists) | Targeted pitch to indie-game or mobile interaction outlets | Agent with unblock | Owner | The body-control interaction supplies a visual editorial hook. |

### Habits — Preparation only

**Canonical:** [https://habits.significanthobbies.com](https://habits.significanthobbies.com)

**Narrative:** Habits is the focused successor to Indulge for noticing patterns, making intentional trades, and building better defaults.

**Source asset:** Use the live Habits landing as product context, but wait for a verified public native build before distribution. Do not suggest App Store or public TestFlight availability.

**Catalog blocker:** Habits is live at habits.significanthobbies.com; the renamed native app is not released. (verified 2026-08-21)

**Before publishing:**

- Publish a verified TestFlight or App Store build under the Habits identity.

**Future candidates after re-verification:** Medium, Substack, Product Hunt, Apple App Store and relevant marketplaces

**Do not use:**

- **Apple App Store and relevant marketplaces:** No App Store or public TestFlight availability is currently claimed.
- **Product Hunt:** Do not launch until a public native distribution channel exists.
- **Hacker News / Show HN:** Explicitly excluded from the current campaign by the owner.

### Local AI Video Studio — Publishable

**Canonical:** [https://local-ai-video-studio.sassmaker.com](https://local-ai-video-studio.sassmaker.com)

**Narrative:** A local AI video studio for model-assisted media workflows.

**Source asset:** Use the verified informational site to explain local video processing and reproducible effect graphs. Show a rights-safe comparison, but do not suggest that the Mac app is available for download.

| Rank | Channel | Format | Execution | Content owner | Why this fits |
|---|---|---|---|---|---|
| Primary | [DEV Community](https://dev.to/help/getting-started) | Technical case study on reproducible local video-effect graphs | Agent direct | Agent | Developer audience can evaluate the architecture and disclosed workflow from the maintained public evidence. |
| Secondary | [YouTube](https://support.google.com/youtube/answer/57407) | Recorded comparison workflow using rights-safe example media | Agent direct | Shared | Side-by-side effect studies are best understood visually without distributing the binary. |
| Secondary | [Substack](https://support.substack.com/hc/en-us/articles/360037831771-How-do-I-publish-a-new-post-on-Substack) | Build note about local, inspectable video experiments | Agent direct | Owner | Founder narrative can link to the informational site while preserving the release boundary. |

**Do not use:**

- **Hugging Face Hub:** No public model, dataset, or runnable Space is currently claimed.
- **Product Hunt:** Do not launch until a trusted public Mac distribution channel exists.
- **Apple App Store and relevant marketplaces:** No signed, notarized, publicly distributed binary is currently claimed.
- **Hacker News / Show HN:** Explicitly excluded from the current campaign by the owner.

### Field Track — Preparation only

**Narrative:** A private continuous field-employee location system for managed Android devices and team-scoped operations.

**Source asset:** A privacy-reviewed product boundary, physical-device pilot evidence, and an approved public explanation that contains no employee or location data.

**Catalog blocker:** The private MVP has no verified production deployment or approved public surface. (verified 2026-08-14)

**Before publishing:**

- Complete the physical-device pilot and verify the production deployment boundary.
- Approve a privacy-safe public surface before any external publication.

**Future candidates after re-verification:** DEV Community, LinkedIn articles and newsletters

### Anchor — Preparation only

**Canonical:** [https://anchor.significanthobbies.com](https://anchor.significanthobbies.com)

**Narrative:** A local-first focus timer for Mac, iPhone and Apple Watch that parks distractions instead of losing the session.

**Source asset:** A walkthrough of the landing page, focus timer flow, and hand-written xlsx export with a notarised macOS build.

**Catalog blocker:** Landing, support and privacy pages live at anchor.significanthobbies.com with a valid certificate. Not ready to share: the macOS DMG is Developer ID signed but not notarised, so Gatekeeper warns, and the apps are otherwise unreleased. (verified 2026-08-16)

**Before publishing:**

- Notarise the macOS DMG and verify Gatekeeper opens it without a warning.

**Future candidates after re-verification:** Product Hunt, AlternativeTo, Medium, YouTube

## Eligible finished P4 — 9

### Drank — Publishable

**Canonical:** [https://domains.sassmaker.com](https://domains.sassmaker.com)

**Narrative:** Domain Rating intelligence for product, SEO, and market research.

**Source asset:** A methodology note and anonymized longitudinal dataset explaining what Domain Rating can and cannot indicate.

| Rank | Channel | Format | Execution | Content owner | Why this fits |
|---|---|---|---|---|---|
| Primary | [Medium](https://help.medium.com/hc/en-us/articles/225168768-Writing-and-publishing-your-first-story) | Method article on interpreting Domain Rating over time | Agent direct | Shared | Search-driven topic that benefits from transparent caveats. |
| Primary | [Indie Hackers](https://www.indiehackers.com/) | Founder experiment tracking domain authority | Agent with unblock | Owner | Useful operational lesson for makers without selling DR as an outcome. |
| Secondary | [Product-specific forums and communities](https://www.discourse.org/guidelines) | Method and dataset contribution to SEO communities | Agent with unblock | Owner | High topical fit if the post leads with evidence rather than a tool link. |

### Email Manager — Publishable

**Canonical:** [https://mail.significanthobbies.com](https://mail.significanthobbies.com)

**Narrative:** A private Gmail workspace for local semantic search, sender insights, and explicit unsubscribe workflows.

**Source asset:** A synthetic-inbox walkthrough plus a clear Gmail permission, storage, and privacy model.

| Rank | Channel | Format | Execution | Content owner | Why this fits |
|---|---|---|---|---|---|
| Primary | [Product Hunt](https://help.producthunt.com/en/articles/479557-how-to-post-a-product) | Private email-workspace launch | Agent with unblock | Owner | Working productivity application with a privacy distinction. |
| Primary | [AlternativeTo](https://alternativeto.net/faq/) | Email productivity application listing | Agent direct | Shared | Recognizable software category with stable public experience. |
| Secondary | [Medium](https://help.medium.com/hc/en-us/articles/225168768-Writing-and-publishing-your-first-story) | Local semantic email search and permissions guide | Agent direct | Shared | Addresses a recurring privacy and inbox-management question. |
| Secondary | [YouTube](https://support.google.com/youtube/answer/57407) | Synthetic inbox workflow demo | Agent direct | Shared | Demonstrates value without exposing private email. |

### Free AI — Publishable

**Canonical:** [https://ai-gateway.sassmaker.com](https://ai-gateway.sassmaker.com)

**Narrative:** An OpenAI-compatible gateway across free-tier model providers.

**Source asset:** A reproducible compatibility and quota comparison with configuration examples and provider caveats.

| Rank | Channel | Format | Execution | Content owner | Why this fits |
|---|---|---|---|---|---|
| Primary | [DEV Community](https://dev.to/help/getting-started) | OpenAI-compatible multi-provider gateway tutorial | Agent direct | Agent | Concrete developer integration with reproducible examples. |
| Primary | [Relevant GitHub awesome lists](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request) | AI gateway and free-model resource list contributions | Agent direct | Shared | Direct technical category with an inspectable implementation. |
| Secondary | [Relevant Reddit communities](https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam) | Provider compatibility results for r/LocalLLaMA | Agent with unblock | Owner | Useful only when the benchmark stands independently of promotion. |
| Secondary | [There's An AI For That](https://theresanaiforthat.com/submit/) | AI gateway listing | Agent with unblock | Owner | Genuine AI infrastructure product, subject to current pricing review. |

**Do not use:**

- **AlternativeTo:** AlternativeTo excludes simple AI tools; use technical artifact and ecosystem channels instead.

### PSI Swarm — Publishable

**Canonical:** [https://performance.sassmaker.com](https://performance.sassmaker.com)

**Narrative:** Repeated Lighthouse distributions for honest website-performance tracking instead of a single noisy score.

**Source asset:** A public benchmark showing score variance across repeated runs and how distributional conclusions differ from one PageSpeed result.

| Rank | Channel | Format | Execution | Content owner | Why this fits |
|---|---|---|---|---|---|
| Primary | [DEV Community](https://dev.to/help/getting-started) | Web-performance variance case study | Agent direct | Agent | Developer lesson backed by reproducible measurements. |
| Primary | [Relevant GitHub awesome lists](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request) | Web-performance tooling list contribution | Agent direct | Shared | Direct technical category and transparent methodology. |
| Secondary | [Product-specific forums and communities](https://www.discourse.org/guidelines) | Benchmark discussion in web-performance communities | Agent with unblock | Owner | Practitioners can evaluate methodology and limitations. |
| Secondary | [YouTube](https://support.google.com/youtube/answer/57407) | Repeated-run visualization walkthrough | Agent direct | Shared | Distribution changes are easy to understand visually. |

### Anime List — Publishable

**Canonical:** [https://anime.significanthobbies.com](https://anime.significanthobbies.com)

**Narrative:** Anime and manga discovery with multi-axis filtering and personal watchlists.

**Source asset:** A visual discovery guide showing how multi-axis filters answer a specific hard-to-search anime request.

| Rank | Channel | Format | Execution | Content owner | Why this fits |
|---|---|---|---|---|---|
| Primary | [YouTube](https://support.google.com/youtube/answer/57407) | Filter-driven discovery walkthrough | Agent direct | Shared | Visual catalog browsing and results are immediately demonstrable. |
| Primary | [Product-specific forums and communities](https://www.discourse.org/guidelines) | Rules-compliant discovery resource for anime communities | Agent with unblock | Owner | High topical match if the resource answers a concrete recommendation need. |
| Secondary | [Product Hunt](https://help.producthunt.com/en/articles/479557-how-to-post-a-product) | Interactive discovery app launch | Agent with unblock | Owner | Working application, provided it is presented as a tool rather than a static list. |

**Do not use:**

- **AlternativeTo:** AlternativeTo disallows directories and lists; avoid the category ambiguity.

### India Standards — Publishable

**Canonical:** [https://india-standards.significanthobbies.com](https://india-standards.significanthobbies.com)

**Narrative:** A transparent India demographic standards calculator using aggregate PLFS data, explicit uncertainty ranges, and clear source limits.

**Source asset:** A methodology-led walkthrough covering supported filters, the aggregate-only data boundary, central estimates, 95% uncertainty ranges, sparse-cell widening, and the current height limitation.

| Rank | Channel | Format | Execution | Content owner | Why this fits |
|---|---|---|---|---|---|
| Primary | [Medium](https://help.medium.com/hc/en-us/articles/225168768-Writing-and-publishing-your-first-story) | Method article on building an aggregate-only Indian demographic calculator | Agent direct | Shared | Searchable methodology and data-transparency story without unsupported individual-probability claims. |
| Primary | [DEV Community](https://dev.to/help/getting-started) | Engineering case study on PLFS aggregate ETL, uncertainty, and Cloudflare serving | Agent direct | Agent | Reproducible data engineering and privacy boundaries for a developer audience. |
| Secondary | [Relevant Reddit communities](https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam) | Method-first post in a relevant India data or data-science community | Agent with unblock | Owner | Useful where community rules permit and the post leads with sources and limitations rather than promotion. |
| Secondary | [Quora answers and Spaces](https://help.quora.com/hc/en-us/articles/360061486651-About-Quora-Spaces) | Source-backed answers about Indian demographic and income estimates | Agent with unblock | Owner | Can answer durable questions while explaining uncertainty and aggregate-data limits. |

**Do not use:**

- **Product Hunt:** The current PLFS-backed preview has source-scope and height limitations; prioritize methodology and data-transparency channels over a launch-board claim.

### LoopTV — Publishable

**Canonical:** [https://tv.significanthobbies.com](https://tv.significanthobbies.com)

**Narrative:** A lean-back, TV-style random video player for curated channels.

**Source asset:** A video showing how a curated channel becomes a low-friction lean-back viewing session.

| Rank | Channel | Format | Execution | Content owner | Why this fits |
|---|---|---|---|---|---|
| Primary | [YouTube](https://support.google.com/youtube/answer/57407) | Lean-back channel demonstration | Agent direct | Shared | The viewing behavior is inherently visual. |
| Primary | [Product-specific forums and communities](https://www.discourse.org/guidelines) | Curator-first post in home-media or video communities | Agent with unblock | Owner | Community fit depends on a genuinely useful curated channel. |
| Secondary | [Product Hunt](https://help.producthunt.com/en/articles/479557-how-to-post-a-product) | Video-player product launch | Agent with unblock | Owner | Working interactive product if positioned beyond a playlist. |

**Do not use:**

- **AlternativeTo:** AlternativeTo disallows video-playlist utilities; do not submit LoopTV there.

### Sarthak Agrawal — Publishable

**Canonical:** [https://sarthakagrawal.dev](https://sarthakagrawal.dev)

**Narrative:** The professional portfolio of an AI infrastructure and product engineer, connecting shipped products, technical case studies, writing, and a public project archive.

**Source asset:** A flagship engineering case study or portfolio index that links shipped products to concrete architecture, verification, and performance evidence.

| Rank | Channel | Format | Execution | Content owner | Why this fits |
|---|---|---|---|---|---|
| Primary | [LinkedIn articles and newsletters](https://www.linkedin.com/help/linkedin/answer/a522525/linkedin-newsletters?lang=en) | Native case-study post linking to the canonical portfolio article | Agent with unblock | Owner | The portfolio is strongest when distributed through the founder's professional identity and firsthand engineering perspective. |
| Primary | [DEV Community](https://dev.to/help/getting-started) | Technical case study republished with canonical attribution | Agent direct | Shared | Developer readers can evaluate concrete architecture and verification evidence before following the portfolio. |
| Secondary | [Medium](https://help.medium.com/hc/en-us/articles/225168768-Writing-and-publishing-your-first-story) | Canonicalized engineering case study | Agent direct | Shared | Creates a durable long-form discovery path without duplicating generic portfolio copy. |
| Secondary | [Hacker News / Show HN](https://news.ycombinator.com/showhn.html) | Submit one substantial technical case study rather than the generic portfolio | Agent with unblock | Owner | Appropriate only when the linked artifact contains technical depth and a useful independent lesson. |

**Do not use:**

- **Product Hunt:** A personal portfolio is not a standalone product launch.
- **AlternativeTo:** A personal portfolio is not an application alternative.

### What It Takes to Win — Publishable

**Canonical:** [https://paths.significanthobbies.com](https://paths.significanthobbies.com)

**Narrative:** An exploration of 2,585 documented early-breakthrough paths without pretending success follows a formula.

**Source asset:** A data essay with methodology, limitations, and several counterintuitive patterns linked to the interactive explorer.

| Rank | Channel | Format | Execution | Content owner | Why this fits |
|---|---|---|---|---|---|
| Primary | [Medium](https://help.medium.com/hc/en-us/articles/225168768-Writing-and-publishing-your-first-story) | Data essay on early-breakthrough paths | Agent direct | Shared | Long-form context is necessary to prevent simplistic success claims. |
| Primary | [Substack](https://support.substack.com/hc/en-us/articles/360037831771-How-do-I-publish-a-new-post-on-Substack) | Evidence-led creator and career analysis | Agent direct | Owner | Fits a broader recurring editorial theme rather than a launch feed. |
| Secondary | [LinkedIn articles and newsletters](https://www.linkedin.com/help/linkedin/answer/a522525/linkedin-newsletters?lang=en) | Professional data story with limitations | Agent with unblock | Owner | Career and founder audience for non-formulaic evidence. |
| Secondary | [Specialist newsletters, blogs, and podcasts](https://www.muckrack.com/blog/2020/07/16/how-to-pitch-journalists) | Targeted dataset-story pitch | Agent with unblock | Owner | Independent coverage is plausible only around a specific finding and transparent method. |

**Do not use:**

- **Product Hunt:** Product Hunt does not feature reports or reading-first material; promote the underlying data story through editorial channels.

## Maintenance contract

- Update `projects.json` first when priority, deployment, lifecycle, or `readyToBeShared` changes.
- Update `seo-geo-publishing.json` when the scoped product set, narrative, source asset, venue fit, execution boundary, or reviewed platform rule changes.
- Run `node foundry/ops/scripts/generate-project-surfaces.mjs` to regenerate this guide.
- Run `node foundry/ops/scripts/generate-project-surfaces.mjs --check` in review and CI-style validation.
- Before using a channel, re-check its linked official guidance if `reviewedAt` is stale or the submission UI/rules have changed.
- Do not record mutable completion state here; use the existing execution systems.
