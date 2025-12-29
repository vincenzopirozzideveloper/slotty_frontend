# CLAUDE.md - Slotty Frontend

This file provides guidance to Claude Code when working with this Next.js frontend project.

## Environment Constraints

**IMPORTANT:** This development environment has:
- VSCode with source files access
- **NO runtime execution capabilities**
- **NO npm/node/pnpm commands**
- Commands must be executed by the user in the Docker container

**Implications:**
- You can READ, EDIT, and ANALYZE code
- You CANNOT run `npm install`, `npm run build`, `npm run dev`
- You CANNOT execute any shell commands in the container
- When dependencies are needed, **tell the user** to run the command

**Example:**
```
Per installare la dipendenza, esegui nel container frontend:
npm install @radix-ui/react-slider
```

## Project Overview

Next.js 15 frontend for Slotty booking system with:
- App Router with locale-based routing (`[locale]`)
- shadcn/ui components
- TailwindCSS styling
- Laravel Sanctum authentication (cookie-based)
- React Query for data fetching

## Tech Stack

| Package | Purpose |
|---------|---------|
| **next** 15.x | React framework |
| **next-intl** | i18n with IT/EN support |
| **@tanstack/react-query** | Data fetching & caching |
| **tailwindcss** | Styling |
| **shadcn/ui** | UI components (Radix-based) |
| **lucide-react** | Icons |
| **sonner** | Toast notifications |

## Project Structure

```
src/
├── app/
│   └── [locale]/
│       ├── (marketing)/     # Landing pages
│       ├── (auth)/          # Login/Register
│       ├── (dashboard)/     # Protected dashboard
│       └── cal/[token]/     # Public booking calendar
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── booker/              # Booking calendar components
│   └── layout/              # Navbar, sidebar, footer
├── contexts/                # React contexts (auth)
├── hooks/                   # Custom hooks
├── lib/
│   ├── api/                 # API clients
│   └── utils.ts             # Utility functions
└── messages/                # i18n translations (en.json, it.json)
```

## Key Patterns

### API Client
All API calls go through `/lib/api/` clients using Axios with credentials for Sanctum cookies.

### Authentication
- Laravel Sanctum SPA mode (cookie-based)
- Auth context in `/contexts/auth-context.tsx`
- Protected routes via `<ProtectedRoute>` component

### i18n
- Translations in `/messages/{locale}.json`
- Use `useTranslations('namespace')` hook
- Routes prefixed with locale: `/en/dashboard`, `/it/dashboard`

## Adding shadcn/ui Components

When a component is missing (e.g., Slider, Textarea):
1. Create the component file in `src/components/ui/`
2. Use the standard shadcn/ui implementation
3. **Tell the user** to install any required Radix dependency:
   ```
   npm install @radix-ui/react-{component}
   ```

## Code Style

- TypeScript strict mode
- Functional components with hooks
- TailwindCSS for styling (no CSS modules)
- Use `cn()` utility for conditional classes
