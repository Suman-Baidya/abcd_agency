# AGENTS.md — ABCD Agency (abcdagency.com)

This file defines how any AI coding agent (Claude Code, Cursor, Copilot, etc.) should work in this repository. Follow it exactly. If a request conflicts with this file, follow this file unless the human explicitly overrides it in the prompt.

---

## 1. Project Overview

ABCD Agency is a full-stack agency website + client management platform.

- **Frontend/Backend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Database:** Neon Serverless PostgreSQL via Prisma ORM
- **Media/Files:** Cloudinary (or UploadThing) — free tier, no card required
- **Email:** Resend (`onboarding@resend.dev` in dev → `hello@abcdagency.com` in prod)
- **Auth:** Auth.js (NextAuth) with Google OAuth 2.0, external mode, callback at `/api/auth/callback/google`
- **AI:** Google Gemini (`gemini-2.5-flash`) and/or Groq via Vercel AI SDK (`ai`)
- **Deployment:** Vercel

**Non-negotiable priorities (in order):** Performance → Design consistency → Mobile-friendliness → Feature completeness.

---

## 2. Design System — Black & White Premium

Every UI change must obey this system. Do not introduce new colors, fonts, or spacing scales without updating this file first.

### Palette
```
--color-black:      #0A0A0A   /* primary text, primary buttons */
--color-white:       #FFFFFF   /* base background */
--color-gray-950:    #111111   /* dark surfaces / dashboard sidebar */
--color-gray-800:    #262626   /* hover states on dark */
--color-gray-500:    #737373   /* secondary text */
--color-gray-200:    #E5E5E5   /* borders, dividers */
--color-gray-100:    #F5F5F5   /* subtle backgrounds, cards */
--color-accent:       #FFFFFF on #0A0A0A (invert) — used ONLY for CTAs
```
- No blue links, no colored badges, no gradients other than subtle black→gray-900.
- "Premium" = generous whitespace, thin 1px borders (`gray-200`), soft shadows (`shadow-sm`/`shadow-md` only, never heavy drop shadows), sharp or barely-rounded corners (`rounded-md`, max `rounded-xl` on cards).
- Status colors (success/error/warning) are the **only** exception — use muted, desaturated tones (e.g., `emerald-700`, `red-700`), never bright saturated colors.

### Typography
- One font family only (system stack or a single premium sans like `Inter` / `Geist`). No mixing fonts.
- Scale: `text-xs` → `text-5xl` using Tailwind defaults only, no arbitrary font sizes.
- Headings: `font-semibold` or `font-bold`, tight tracking (`tracking-tight`).
- Body: `font-normal`, `text-gray-700`/`text-gray-500` for secondary copy.

### Components
- Build once in `components/ui/` (buttons, inputs, cards, modals, tables, badges) and reuse everywhere — never inline one-off styled elements.
- **Section Headers**: Always use the `SectionHeader` component (`src/components/ui/SectionHeader.tsx`) for page and section titles to maintain consistency. It enforces the `Subtitle > Title > Description` hierarchy with precise tracking and spacing. Use `as="h1"` for the hero/top page header, and default (`as="h2"`) for all sub-sections.
- **Inner Page Headers**: All inner/sub pages (not the homepage) must use the `PageHeader` component (`src/components/ui/PageHeader.tsx`) for their top hero section. This gives a compact dark-band design (monospace tag + ruled separator + measured title) that is clearly distinct from the homepage Hero's large display text. Never use `SectionHeader as="h1"` on inner pages.
- Buttons: solid black on white (primary), outline black (secondary), ghost (tertiary). No filled colored buttons.
- All interactive elements need visible focus states (`focus-visible:ring-2 ring-black`) for accessibility.

---

## 3. Mobile-First & Responsive Rules

- Design and code mobile-first: base Tailwind classes = mobile, then `sm:` `md:` `lg:` `xl:` layer up. Never the reverse.
- Every dashboard page must be fully usable at **375px width** (iPhone SE) with no horizontal scroll.
- Dashboard sidebars collapse to a bottom nav or slide-over drawer under `md:` breakpoint — never a squished sidebar.
- Tables on mobile become stacked cards or horizontally scrollable with sticky first column — never shrink text below `text-xs`.
- Touch targets minimum 44x44px.
- Test every new page/component mentally (or via responsive dev tools) at 375px, 768px, 1280px before considering it done.

---

## 4. Performance Rules

- Default to **Server Components**. Only add `"use client"` when the component needs interactivity, state, or browser APIs.
- Use `next/image` for all images (Cloudinary URLs included) — never raw `<img>`.
- Use `next/font` for font loading — no external `<link>` font tags.
- Prefer **ISR or static generation** for public/marketing pages; use dynamic rendering only for authenticated dashboard data.
- Wrap slow/async sections in `<Suspense>` with lightweight skeletons (black/white, matching design system — no colored spinners).
- Keep client bundle lean: lazy-load heavy client components (charts, rich text editors, modals) with `next/dynamic`.
- Database: always select only needed fields in Prisma queries (`select`, not full-model fetches); add indexes for any field used in `where`/`orderBy` on large tables.
- No N+1 queries — use Prisma `include` or batched queries.
- Cache expensive/read-heavy queries with Next.js `fetch` cache options or `unstable_cache` where appropriate.

---

## 5. Folder Structure Conventions

```
app/
  (marketing)/         # public site: home, services, pricing, contact
  (dashboard)/          # authenticated client/admin area
    dashboard/
    admin/
  api/
    auth/[...nextauth]/
    <resource>/route.ts
components/
  ui/                   # design-system primitives (Button, Card, Input...)
  dashboard/
  marketing/
lib/
  prisma.ts             # single Prisma client instance
  auth.ts               # NextAuth config
  cloudinary.ts
  resend.ts
  ai.ts                 # Gemini/Groq client setup
prisma/
  schema.prisma
types/
```
- One component per file. Co-locate component-specific types.
- Server actions live in `app/**/actions.ts`, not scattered inline unless trivial.

---

## 6. Coding Standards

- TypeScript strict mode always on. No `any` unless justified with a comment.
- Naming: `camelCase` for variables/functions, `PascalCase` for components/types, `kebab-case` for file/folder names (except component files, which are `PascalCase.tsx`).
- Prefer named exports; default export only for Next.js special files (`page.tsx`, `layout.tsx`, etc.).
- Validate all external input (forms, API bodies) with `zod`.
- Handle errors explicitly — no silent `catch {}`. Log server-side errors; show friendly black/white error states client-side.

---

## 7. Database & Prisma

- Single Prisma client singleton in `lib/prisma.ts` (guard against multiple instances in dev with `globalThis`).
- All schema changes go through `prisma migrate dev` — never hand-edit the DB.
- Use descriptive model/field names matching business domain (e.g., `ClientProject`, not `Item`).
- Soft-delete pattern (`deletedAt`) for anything client-facing that shouldn't hard-delete.

---

## 8. Auth (NextAuth / Google OAuth)

- All dashboard routes protected via middleware (`middleware.ts`) checking session, not per-page checks scattered around.
- Role-based access (e.g., `ADMIN`, `CLIENT`) stored on the `User` model, checked server-side before rendering sensitive data — never trust client-side role checks alone.
- Redirect URI stays `/api/auth/callback/google` in both dev and prod (with correct env-specific base URL).

---

## 9. Media, Email, AI Integration

- **Cloudinary:** all uploads go through a server action/API route that signs the request — never expose unsigned upload presets with write access publicly unless explicitly scoped and rate-limited.
- **Resend:** all transactional email templates live in `emails/` (React Email components), styled black/white to match brand — no default colorful email templates.
- **AI (Gemini/Groq via Vercel AI SDK):** all AI calls go through `lib/ai.ts`; never call provider SDKs directly from components. Stream responses where the UI benefits (chat-like features); use non-streaming for structured JSON extraction.

---

## 10. Environment Variables

- All secrets read from `.env.local` — never hardcode keys, never commit `.env.local`.
- Add every new env var to `.env.example` with a placeholder value immediately when introduced.
- Access env vars only through a typed `lib/env.ts` validator (e.g., `zod`-parsed) — not scattered `process.env.X` calls.

---

## 11. Git & PR Conventions

- Conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`, `style:`, `perf:`.
- One logical change per commit/PR.
- Never commit generated files, `.env*`, or `node_modules`.

---

## 12. Agent Checklist Before Finishing Any Task

- [ ] Follows black & white design system (no stray colors)
- [ ] Works at 375px mobile width, no horizontal scroll
- [ ] Uses Server Components by default; `"use client"` only where needed
- [ ] Images via `next/image`, fonts via `next/font`
- [ ] Prisma queries use `select`/`include`, no over-fetching
- [ ] Inputs validated with `zod`
- [ ] No secrets hardcoded; `.env.example` updated if new vars added
- [ ] Reused existing `components/ui/` primitives instead of new one-offs
- [ ] TypeScript has no `any` / no type errors
