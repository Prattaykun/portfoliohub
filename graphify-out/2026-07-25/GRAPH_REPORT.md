# Graph Report - portfoliohub  (2026-07-25)

## Corpus Check
- 116 files · ~84,363 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 680 nodes · 971 edges · 95 communities (40 shown, 55 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `67e448eb`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- types.ts
- supabaseClient.ts
- generate-cv/route.ts
- resumeTemplates.ts
- generate-resume1/route.ts
- site.ts
- compilerOptions
- portfolio.ts
- generate-resume/route.ts
- [username]/page.tsx
- generate-twa-project.mjs
- chatbot/page.tsx
- devDependencies
- chatbot/route.ts
- MediaCard.tsx
- package.json
- fetchUserData
- PortfolioSections.tsx
- admin/page.tsx
- dependencies
- generate-assetlinks.mjs
- cloudinary/route.ts
- ProjectModal.tsx
- eslint.config.mjs
- test/route.ts
- save-document/route.ts
- ItemPicker.tsx
- check-username/route.ts
- forgotpassword/route.ts
- api/login/route.ts
- signup/route.ts
- apple-icon.tsx
- open/page.tsx
- route.tsx
- share-target/page.tsx
- supabase.ts
- typescript
- @tailwindcss/postcss
- eslint
- eslint-config-next
- framer-motion
- groq-sdk
- lodash
- lodash.debounce
- lucide-react
- markdown-wasm
- next
- next-cloudinary
- next.config.ts
- @next/mdx
- @opentelemetry/api
- pdfkit
- puppeteer
- react-datepicker
- react-markdown
- react-slick
- rehype-slug
- remark-gfm
- slick-carousel
- @supabase/auth-helpers-nextjs
- @supabase/ssr
- @supabase/supabase-js
- @upstash/redis
- web-push
- postcss
- postcss-import
- @tailwindcss/line-clamp
- @tailwindcss/typography
- @types/lodash
- @types/node
- @types/pdfkit
- @types/react
- @types/react-slick
- @types/web-push
- config
- TAN_PAMELA_FONT_CSS
- graphify reference: extra exports and benchmark
- graphify reference: query, path, explain
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- rules/graphify.md
- workflows/graphify.md
- CLAUDE.md
- .claude/CLAUDE.md
- extraction-spec.md

## God Nodes (most connected - your core abstractions)
1. `supabase` - 23 edges
2. `compilerOptions` - 16 edges
3. `SectionToggles` - 14 edges
4. `What You Must Do When Invoked` - 12 edges
5. `SelectedItems` - 11 edges
6. `renderDeclaration()` - 11 edges
7. `/graphify` - 11 edges
8. `CVSectionToggles` - 10 edges
9. `escapeHtml()` - 10 edges
10. `upsertResumeDocument()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `generateMetadata()` --calls--> `toAbsoluteUrl()`  [EXTRACTED]
  app/[username]/layout.tsx → lib/site.ts
- `generateMetadata()` --calls--> `toAbsoluteUrl()`  [EXTRACTED]
  app/[username]/project/[projectId]/page.tsx → lib/site.ts
- `POST()` --calls--> `processSignature()`  [EXTRACTED]
  app/api/generate-cv/route.ts → lib/server/processSignature.ts
- `POST()` --calls--> `upsertResumeDocument()`  [EXTRACTED]
  app/api/generate-cv/route.ts → lib/server/upsertResumeDocument.ts
- `RequestPayload` --references--> `SelectedItems`  [EXTRACTED]
  app/api/generate-resume/route.ts → lib/resumeTemplates.ts

## Import Cycles
- None detected.

## Communities (95 total, 55 thin omitted)

### Community 0 - "types.ts"
Cohesion: 0.05
Nodes (44): NOTE: ensure your ExperienceEntry in '@/util/types' matches the shape used below, countryCodes, Certificate, CertMedia, CertSkill, CloudinaryUploadInfo, CloudinaryUploadResult, CloudinaryUploadResultInfo (+36 more)

### Community 1 - "supabaseClient.ts"
Cohesion: 0.06
Nodes (20): MediaItem, Section, AuthTabs(), clsx(), Tab, AnyObj, ContactSectionProps, OtherLink (+12 more)

### Community 2 - "generate-cv/route.ts"
Cohesion: 0.14
Nodes (28): generatePDFWithBrowserless(), POST(), RequestPayload, supabaseAdmin, uploadToCloudinary(), CVWizard(), extractAch(), Props (+20 more)

### Community 3 - "resumeTemplates.ts"
Cohesion: 0.17
Nodes (25): RequestPayload, extractAch(), ResumeWizard(), WizardProps, Props, Props, defaultSectionToggles(), SectionKey (+17 more)

### Community 4 - "generate-resume1/route.ts"
Cohesion: 0.09
Nodes (26): About, Certificate, CertificateSkill, Contact, ContactLink, Education, escapeHtml(), Experience (+18 more)

### Community 5 - "site.ts"
Cohesion: 0.11
Nodes (16): GET(), supabase, geistMono, geistSans, metadata, siteUrl, manifest(), generateMetadata() (+8 more)

### Community 6 - "compilerOptions"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 7 - "portfolio.ts"
Cohesion: 0.09
Nodes (25): AboutData, Certificate, CertificateMedia, CertificateSkill, ContactData, DeploymentMedia, ImageMedia, LangIntData (+17 more)

### Community 8 - "generate-resume/route.ts"
Cohesion: 0.07
Nodes (32): About, Certificate, CertificateSkill, CompanyExperience, Contact, ContactLink, Education, escapeHtml() (+24 more)

### Community 9 - "[username]/page.tsx"
Cohesion: 0.36
Nodes (4): Particles(), ParticlesProps, MousePosition, useMousePosition()

### Community 10 - "generate-twa-project.mjs"
Cohesion: 0.14
Nodes (13): androidDir, checksum, __dirname, faviconUrl, __filename, generator, log, manifestUrl (+5 more)

### Community 11 - "chatbot/page.tsx"
Cohesion: 0.17
Nodes (10): ChatbotPage(), ChatMessagesList, ChatMessagesListProps, createMessage(), Message, supabase, UserProfile, ChatMessage (+2 more)

### Community 12 - "devDependencies"
Cohesion: 0.18
Nodes (11): @bubblewrap/core, @eslint/eslintrc, devDependencies, @bubblewrap/core, @eslint/eslintrc, postcss-nesting, tailwindcss, @types/react-dom (+3 more)

### Community 13 - "chatbot/route.ts"
Cohesion: 0.22
Nodes (9): fetchUserData(), GEMINI_MODELS, genAI, groq, GROQ_MODELS, POST(), supabase, @google/generative-ai (+1 more)

### Community 14 - "MediaCard.tsx"
Cohesion: 0.29
Nodes (9): isYouTube(), MediaCard(), MediaItem, Props, toYouTubeEmbed(), PortfolioSections(), ProjectModal(), react (+1 more)

### Community 15 - "package.json"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, generate:twa, lint, start (+1 more)

### Community 16 - "fetchUserData"
Cohesion: 0.23
Nodes (9): Image(), size, PortfolioPage(), fetchUserData(), getYoutubeThumbnail(), Image(), size, generateMetadata() (+1 more)

### Community 17 - "PortfolioSections.tsx"
Cohesion: 0.25
Nodes (7): ContactLink, Education, Experience, UserData, MediaItem, MediaSection, PortfolioSectionsProps

### Community 18 - "admin/page.tsx"
Cohesion: 0.29
Nodes (3): MediaResource, MediaStats, OwnerInfo

### Community 19 - "dependencies"
Cohesion: 0.29
Nodes (7): cloudinary, contentlayer, dependencies, cloudinary, contentlayer, react-dom, react-dom

### Community 20 - "generate-assetlinks.mjs"
Cohesion: 0.33
Nodes (5): assetLinks, __dirname, __filename, fingerprints, repoRoot

### Community 21 - "cloudinary/route.ts"
Cohesion: 0.50
Nodes (3): fetchResources(), GET(), supabaseAdmin

### Community 22 - "ProjectModal.tsx"
Cohesion: 0.25
Nodes (5): Project, ProjectModalProps, AnimatedName(), TypingRoles(), TypingRolesProps

### Community 23 - "eslint.config.mjs"
Cohesion: 0.40
Nodes (4): compat, __dirname, eslintConfig, __filename

### Community 24 - "test/route.ts"
Cohesion: 0.67
Nodes (3): configureWebPush(), POST(), PushSubscriptionPayload

### Community 25 - "save-document/route.ts"
Cohesion: 0.07
Nodes (26): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+18 more)

### Community 26 - "ItemPicker.tsx"
Cohesion: 0.12
Nodes (16): 1. Clone the Repository, 2. Install Dependencies, 3. Set Up Environment Variables, 4. Set Up Supabase Backend, 5. Run the Development Server, Build on Every New Commit (Main Branch), Getting Started, GitHub Action Secrets and Variables (+8 more)

### Community 38 - "typescript"
Cohesion: 0.67
Nodes (3): typescript, typescript, typescript

### Community 83 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 84 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 85 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 86 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 87 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

## Knowledge Gaps
- **302 isolated node(s):** `countryCodes`, `MediaItem`, `Section`, `CertMedia`, `CertSkill` (+297 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **55 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `chatbot/route.ts`, `MediaCard.tsx`, `package.json`, `typescript`, `framer-motion`, `groq-sdk`, `lodash`, `lodash.debounce`, `lucide-react`, `markdown-wasm`, `next`, `next-cloudinary`, `@next/mdx`, `pdfkit`, `puppeteer`, `react-datepicker`, `react-markdown`, `react-slick`, `rehype-slug`, `remark-gfm`, `slick-carousel`, `@supabase/auth-helpers-nextjs`, `@supabase/ssr`, `@supabase/supabase-js`, `@upstash/redis`, `web-push`?**
  _High betweenness centrality (0.192) - this node is a cross-community bridge._
- **Why does `react` connect `MediaCard.tsx` to `dependencies`?**
  _High betweenness centrality (0.174) - this node is a cross-community bridge._
- **Why does `supabase` connect `supabaseClient.ts` to `types.ts`, `[username]/page.tsx`, `generate-cv/route.ts`, `site.ts`?**
  _High betweenness centrality (0.144) - this node is a cross-community bridge._
- **What connects `countryCodes`, `MediaItem`, `Section` to the rest of the system?**
  _302 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `types.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05185185185185185 - nodes in this community are weakly interconnected._
- **Should `supabaseClient.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06207482993197279 - nodes in this community are weakly interconnected._
- **Should `generate-cv/route.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13658536585365855 - nodes in this community are weakly interconnected._