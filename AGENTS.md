# AGENTS.md

Информационный сайт Push30 — карточный каталог партнёрской сети фитнес-клуба. Построен на TanStack Start, деплоится на Netlify.

## Project Overview

Сайт-информатор с каталогом партнёров Push30: спортивные залы (основные) и партнёры со скидками (дискаунт). Грид карточек с модальными окнами для полной информации. Данные хранятся статически в TypeScript-файле, сгенерированном из XLSX.

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start |
| Frontend | React 19, TanStack Router v1 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 |
| UI Components | Radix UI + custom components |
| Content | Content Collections (type-safe markdown) |
| AI | TanStack AI with multi-provider support |
| Language | TypeScript 5.7 (strict mode) |
| Deployment | Netlify |

## Directory Structure

```
├── public/
│   └── favicon.ico
├── src
│   ├── data
│   │   ├── partners.ts  # Все данные партнёров (основные 251 + дискаунт 20). Сгенерирован из XLSX.
│   │   └── products.ts  # Устаревший шаблон (не используется на главной)
│   ├── routes
│   │   ├── __root.tsx   # Корневой layout: мета-теги (Push30), HTML shell
│   │   └── index.tsx    # Главная: таб-переключатель, поиск, грид, модальные окна
│   ├── router.tsx
│   └── styles.css       # Tailwind 4 + базовые стили
├── AGENTS.md
├── README.md
├── netlify.toml
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Key Concepts

### Данные партнёров (`src/data/partners.ts`)
Два интерфейса:
- `MainPartner` — зал с полями `standard` (тариф Стандарт), `plus` (тариф Плюс), `category`, `image`
- `DiscountPartner` — партнёр скидок с полем `description`

Изображения подобраны по категории (gym, pool, yoga, dance, martial, spa, karting, vr и др.) из Unsplash.

### Компоненты (`src/routes/index.tsx`)
Все компоненты расположены inline в файле маршрута:
- `MainPartnerCard` — карточка зала (бейджи Стандарт/Плюс)
- `DiscountPartnerCard` — карточка дискаунт-партнёра
- `MainPartnerModal` — модальное окно с тарифами
- `DiscountPartnerModal` — модальное окно со скидками

Модальные окна без внешней библиотеки: backdrop-click для закрытия, `stopPropagation` на содержимом.

### File-Based Routing (TanStack Router)
Routes defined by files in `src/routes/`:
- `__root.tsx` - Root layout
- `index.tsx` - Route for `/` (главная с каталогом)

## Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite plugins: TanStack Start, Netlify, Tailwind, Content Collections |
| `tsconfig.json` | TypeScript config with `@/*` path alias for `src/*` |
| `netlify.toml` | Build command, output directory, dev server settings |
| `content-collections.ts` | Zod schemas for jobs and education frontmatter |
| `styles.css` | Tailwind imports + CSS custom properties (oklch colors) |

## Development Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
```

## Conventions

### Naming
- Components: PascalCase
- Utilities/hooks: camelCase
- Routes: kebab-case files

### Styling
- Tailwind CSS utility classes
- `cn()` helper for conditional class merging
- CSS variables for theme tokens in `styles.css`

### TypeScript
- Strict mode enabled
- Import paths use `@/` alias
- Zod for runtime validation
- Type-only imports with `type` keyword

### State Management
- React hooks for local state
- Zustand if you need it for global state
### Marketing Site with AI Assistant

Marketing site with TanStack AI chat assistant. No Stripe checkout.

**AI tools available:**
- `getProducts` - Get all products from catalog
- `recommendProduct` - Display product recommendation card (MUST use for recommendations)

**Components:** ProductAIAssistant, ProductRecommendation

**Dependencies:** @tanstack/ai, streamdown

## Environment Variables

For AI: ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY, or OLLAMA_BASE_URL (same as ai add-on).

## Application Name

This starter uses "Application Name" as a placeholder throughout the UI and metadata. Replace it with the user's desired application name in the following locations:

### UI Components
- `src/components/Header.tsx` — app name displayed in the header
- `src/components/HeaderNav.tsx` — app name in the mobile navigation header

### SEO Metadata
- `src/routes/__root.tsx` — the `title` field in the `head()` configuration

Search for all occurrences of "Application Name" in the `src/` directory and replace with the user's application name.
