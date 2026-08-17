# BUILD_PROMPTS.md — ABCD Agency Landing Page & Core Pages

Copy-paste these prompts one at a time into Claude Code / Cursor. They assume `AGENTS.md` already exists in the repo root — reference it explicitly so the agent inherits the design system and rules instead of guessing.

Build order: Navbar → Hero → each home section → other pages. Do NOT ask for the whole site in one prompt — components built one at a time are higher quality and easier to review.

---

## 0. Master Kickoff Prompt (run first, once)

```
Read AGENTS.md in the repo root and follow it strictly for every task in this
project — design system, folder structure, performance rules, and mobile
rules are non-negotiable.

We are now building the homepage of abcdagency.com component by component.
Each section will be its own React Server Component in
components/marketing/, composed together in app/(marketing)/page.tsx.

Do not build the full page yet. Wait for me to prompt each section
individually. Just confirm you've read AGENTS.md and are ready.
```

---

## 1. Premium Navbar / Menu

```
Build components/marketing/Navbar.tsx per AGENTS.md's design system.

Requirements:
- Sticky top nav, transparent over hero, turns solid white with a
  1px gray-200 bottom border on scroll (use a small client-side scroll
  listener, keep the rest of the navbar a Server Component by isolating
  the scroll logic in a tiny "use client" wrapper).
- Left: ABCD Agency wordmark/logo (black, bold, tracking-tight).
- Center or right: nav links — Services, Work, Pricing, About, Blog, Contact.
- Far right: a solid black "Book a Call" or "Get Started" button (primary
  CTA per design system).
- Mobile (<768px): links collapse into a full-screen black overlay menu
  triggered by a minimal hamburger icon, links in large white text,
  smooth slide/fade transition, close button top-right.
- Active route gets a subtle underline or bold weight, no color change.
- Fully keyboard accessible, visible focus rings.
```

---

## 2. Hero Section

```
Build components/marketing/Hero.tsx per AGENTS.md's design system.

Requirements:
- Full-width, generous vertical padding (py-24 md:py-32), white background.
- Large headline (text-4xl md:text-6xl, font-bold, tracking-tight, black)
  positioning ABCD Agency as a software development & digital consulting
  partner. Subheadline in gray-500, max-w-2xl, explaining what we build
  (web apps, SaaS products, business digitalization) for Indian
  businesses/startups.
- Two CTAs: solid black primary ("Start Your Project") + outline black
  secondary ("View Our Work").
- Right side or background: an abstract black/white visual — could be a
  subtle grid pattern, a minimal geometric SVG illustration, or a
  device/browser mockup screenshot placeholder. No stock photography,
  no color. Keep it lightweight (inline SVG, not a heavy image).
- Below the fold of the hero: a thin row of trust markers — e.g. "Built
  with Next.js, trusted by [X]+ clients" — small gray-500 text, no logos
  needed yet (leave a logo-strip placeholder array I can fill in later).
- Fully responsive: on mobile, illustration stacks below text, headline
  drops to text-3xl.
```

---

## 3. Services Section

```
Build components/marketing/Services.tsx per AGENTS.md's design system.

Requirements:
- Section heading + short intro line, centered, max-w-xl.
- Grid of service cards (3-4 items, responsive: 1 col mobile, 2 col
  tablet, 3-4 col desktop) covering: Web & SaaS Development,
  Business Consulting & Digitalization, UI/UX & Branding,
  AI Integration / Automation.
- Each card: minimal black-line icon (inline SVG, no icon library
  colors), title (font-semibold), 1-2 line description (gray-500),
  subtle border (gray-200), hover state lifts with shadow-md, no color
  change on hover.
- Cards are components/ui/Card.tsx reused, not one-off styled divs.
```

---

## 4. Process / How We Work Section

```
Build components/marketing/Process.tsx per AGENTS.md's design system.

Requirements:
- Horizontal numbered timeline on desktop (4 steps: Discover → Design →
  Build → Launch & Support), stacked vertical timeline on mobile with a
  thin connecting line (gray-200).
- Each step: large number in black (text-5xl font-bold, low opacity or
  outlined style for premium feel), short title, 1-2 line description.
- Keep whitespace generous — this section should feel calm, not busy.
```

---

## 5. Portfolio / Case Studies Preview Section

```
Build components/marketing/WorkPreview.tsx per AGENTS.md's design system.

Requirements:
- Heading + "View all work" link (right-aligned on desktop).
- Grid/carousel of 3 featured project cards: project thumbnail
  (next/image, grayscale filter with color-on-hover is allowed as the
  one tasteful accent), project name, one-line result/tagline
  (e.g. "Increased enrollment 40% for RGYCSP"), tag chips (Next.js,
  Prisma, etc. — chips styled black outline, not colored badges).
- Cards link to /work/[slug] (page not built yet — use placeholder hrefs).
- Mobile: horizontal scroll-snap carousel instead of grid.
```

---

## 6. Tech Stack Strip

```
Build components/marketing/TechStack.tsx per AGENTS.md's design system.

Requirements:
- Thin, full-width band (gray-100 or gray-950 background — pick whichever
  reads as more premium against the surrounding white sections) listing
  the core stack as monochrome logos or text badges: Next.js, TypeScript,
  PostgreSQL/Prisma, Tailwind CSS, Google Gemini/Groq AI, Vercel.
- Logos in a single row on desktop (flex-wrap), 2 rows on mobile, all
  logos same grayscale treatment for visual consistency (no brand colors).
```

---

## 7. Testimonials Section

```
Build components/marketing/Testimonials.tsx per AGENTS.md's design system.

Requirements:
- 2-3 testimonial cards in a grid (1 col mobile, up to 3 col desktop) or
  a simple auto-rotating carousel — your choice, keep it lightweight,
  no heavy carousel library, use CSS scroll-snap if needed.
- Each card: quote text (text-lg, gray-800), client name + role/company
  (text-sm, gray-500), optional small circular avatar placeholder.
- Subtle gray-100 card background to differentiate from surrounding
  white sections, no colored accents.
```

---

## 8. Pricing / Engagement Models Section

```
Build components/marketing/Pricing.tsx per AGENTS.md's design system.

Requirements:
- 3 pricing/engagement tiers side by side (Starter, Growth, Enterprise —
  rename as fits ABCD's model), 1 col mobile stacked, 3 col desktop.
- Middle/recommended tier visually emphasized using ONLY black/white
  contrast (e.g. black background + white text card) — never a colored
  "Popular" badge; use a simple black pill label instead.
- Each tier: name, price or "Custom Quote", 4-6 feature bullets with
  minimal black checkmarks, CTA button.
- If real pricing isn't ready, make this an "Engagement Models" section
  (Fixed Scope / Retainer / Dedicated Team) instead of numeric pricing —
  ask me which direction before writing copy if unsure.
```

---

## 9. Final CTA Section

```
Build components/marketing/CTASection.tsx per AGENTS.md's design system.

Requirements:
- Full-width black background band, white centered text.
- Short punchy headline ("Let's build something premium together" or
  similar), one-line subtext, single white/outline CTA button
  ("Book a Free Consultation") linking to /contact.
- Generous vertical padding, this is the emotional close of the page.
```

---

## 10. Footer

```
Build components/marketing/Footer.tsx per AGENTS.md's design system.

Requirements:
- Multi-column layout (Company / Services / Resources / Legal), 1 col
  stacked accordion-style on mobile if columns get cramped, else simple
  4-col grid collapsing to 2-col on tablet.
- Include: logo + one-line tagline, nav link columns, social icons
  (monochrome SVGs, no colored brand icons), newsletter email input
  (black outline input + black button, no colored email icons),
  bottom bar with © year + Privacy Policy + Terms links.
```

---

## 11. Assemble the Homepage

```
Now assemble app/(marketing)/page.tsx importing and ordering all the
components built so far: Navbar, Hero, Services, Process, WorkPreview,
TechStack, Testimonials, Pricing, CTASection, Footer. Add appropriate
spacing between sections (alternate white/gray-50 backgrounds where two
white sections sit back to back, so sections are visually separated
without adding borders everywhere). Confirm the page passes AGENTS.md's
"Agent Checklist" before telling me it's done.
```

---

## Other Pages a Software Agency Site Needs

Prompt these one at a time, same pattern (always cite AGENTS.md).

| Page | Route | Purpose |
|---|---|---|
| About | `/about` | Team, mission, founder story (Suman / ABCD), values |
| Services (detail) | `/services` and `/services/[slug]` | Deep-dive per service with process, tech, FAQs |
| Work / Case Studies | `/work` and `/work/[slug]` | Full portfolio grid + individual case study pages with problem/solution/result structure |
| Pricing | `/pricing` | Full engagement models, comparison table |
| Contact | `/contact` | Form (name, email, project type, budget, message) → Resend email + DB lead capture |
| Blog | `/blog` and `/blog/[slug]` | SEO content, MDX or DB-driven posts |
| Careers | `/careers` | Open roles if hiring, or "join our network" for freelancers |
| Client Login | `/login` | NextAuth Google sign-in, redirects to `/dashboard` |
| Client Dashboard | `/dashboard` | Project status, files (Cloudinary), invoices, messages |
| Admin Dashboard | `/admin` | Manage clients, projects, leads, blog posts |
| Legal | `/privacy`, `/terms` | Standard policy pages |
| 404 / Error | `not-found.tsx`, `error.tsx` | Branded black/white error states |

### Example prompt for the Contact page

```
Read AGENTS.md and build the /contact page.

Requirements:
- Split layout: left side contact form, right side company info
  (email, phone, office hours, a simple location line — no map embed
  needed yet) — stacks vertically on mobile, form first.
- Form fields: Name, Email, Project Type (select), Budget Range (select),
  Message (textarea). Validate with zod, submit via a server action.
- On submit: save the lead to the DB (Prisma "Lead" model — add it to
  schema.prisma if it doesn't exist) AND send a notification email via
  Resend to the agency inbox, plus an auto-reply confirmation email to
  the submitter, both using black/white branded React Email templates.
- Show a black/white success state in place of the form on submit, no
  colored toast/alert libraries — keep it consistent with the design
  system.
```

### Example prompt for a Case Study detail page

```
Read AGENTS.md and build app/(marketing)/work/[slug]/page.tsx.

Requirements:
- Fetch the project by slug (add a "Project" model to schema.prisma if
  missing: title, slug, client, summary, coverImage, techStack[],
  problem, solution, result, gallery images).
- Layout: hero banner with project cover image + title + client name,
  then Problem / Solution / Result sections in a clean editorial layout
  (generous line-height, max-w-3xl reading column), image gallery grid
  below, tech stack chips, and a final CTA section reusing
  components/marketing/CTASection.tsx.
- Generate static params for all project slugs (generateStaticParams)
  so these pages are statically generated per AGENTS.md's performance
  rules.
```

---

## How to Use This File

1. Run the Master Kickoff prompt once.
2. Paste sections 1–10 one at a time, reviewing each component before moving to the next.
3. Run section 11 to assemble the homepage.
4. Move to "Other Pages," prompting each in its own turn — Contact and the Client Dashboard are the highest priority after the homepage since they drive leads and retention.
