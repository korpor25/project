# Frontend — CS Exhibition

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind 4 + Supabase

## Quick start

```bash
cp .env.example .env.local      # then fill values
pnpm install
pnpm dev
```

Visit http://localhost:3000

## Layout

ดู `../.claude/skills/nextjs-frontend/SKILL.md` สำหรับ convention เต็ม

```
app/
  layout.tsx               root (font, i18n, providers)
  (public)/                landing, events, login — no auth
  (user)/                  USER pages — requires auth
  (admin)/                 ADMIN panel — requires ADMIN role
components/
  shared/                  Providers, Navbar, ...
  ui/                      shadcn primitives (to be added)
lib/
  supabase/                browser + server + middleware clients
  api/                     typed fetch wrapper + ApiError
  utils.ts                 cn() and friends
i18n/request.ts            next-intl config
messages/th.json           Thai translations
middleware.ts              Supabase session refresh
types/api.ts               shared API types
```

## Auth

- Supabase Auth ผ่าน `@supabase/ssr` (cookie-based)
- `middleware.ts` refresh session ทุก request
- Layout `(user)` และ `(admin)` ตรวจสิทธิ์ฝั่ง server

## API calls

```ts
import { apiFetch } from "@/lib/api/client";
const events = await apiFetch<Event[]>("/api/v1/events");
```

## Scripts

| Script | Action |
|--------|--------|
| `pnpm dev` | dev server (turbopack) |
| `pnpm build` | production build |
| `pnpm start` | run production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
 
