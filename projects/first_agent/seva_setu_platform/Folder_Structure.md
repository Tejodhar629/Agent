# Seva Setu: Monorepo Folder Structure

We will utilize a **Turborepo** based monorepo. This allows us to share UI components, database schemas, and TypeScript interfaces across our Next.js frontends and NestJS backend seamlessly.

```text
seva-setu-monorepo/
├── apps/
│   ├── web/                    # Citizen & Consultant Facing Application (Next.js App Router)
│   │   ├── app/                # App router (pages, layouts, API routes for frontend)
│   │   │   ├── (auth)/         # OTP & OAuth flows
│   │   │   ├── (dashboard)/    # Kanban & Profile
│   │   │   ├── chat/           # Streaming Chat Interface
│   │   │   └── schemes/        # SEO-friendly programmatic scheme pages
│   │   └── components/         # Web-specific composite components
│   │
│   ├── api/                    # Core Backend Services (NestJS)
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/       # Authentication & JWT
│   │   │   │   ├── chat/       # SSE Streaming & LangChain Orchestration
│   │   │   │   ├── schemes/    # Vector DB / GraphQL resolvers
│   │   │   │   └── webhooks/   # Payments & External APIs
│   │   │   └── graphql/        # GraphQL schemas and resolvers
│   │   └── test/               # E2E and Unit tests for API
│   │
│   └── admin/                  # Internal Admin CMS (Next.js or Vite+React)
│       ├── app/
│       └── components/
│
├── packages/
│   ├── ui/                     # Shared UI Design System (Shadcn UI + Tailwind)
│   │   ├── components/         # Buttons, Inputs, VoiceRecorder, KanbanBoard
│   │   └── tailwind.config.js  # Shared design tokens
│   │
│   ├── database/               # Prisma ORM & Relational DB config
│   │   ├── prisma/
│   │   │   └── schema.prisma   # Single source of truth for DB models
│   │   └── src/                # Shared DB client & seed scripts
│   │
│   ├── ai-core/                # Shared AI Logic (if decoupling from NestJS)
│   │   ├── prompts/            # Centralized LLM Prompts
│   │   └── rag/                # Document loaders & chunking utilities
│   │
│   ├── config/                 # ESLint, Prettier, TypeScript configs
│   │   ├── eslint-preset.js
│   │   └── tsconfig.base.json
│   │
│   └── types/                  # Shared TypeScript interfaces (API payloads)
│
├── .github/                    # CI/CD Workflows
│   └── workflows/
│       ├── ci.yml              # Build & Test
│       └── cd.yml              # Deployment to AWS/GCP
│
├── turbo.json                  # Turborepo build pipelines
├── package.json                # Root dependencies (pnpm)
└── README.md                   # Developer onboarding guide
```
