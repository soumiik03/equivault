# EquiVault

AI-powered bearing document analysis and comparison system.

## Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** Neon PostgreSQL + Drizzle ORM
- **Storage:** Supabase (private bucket)
- **AI:** Gemini 2.5 Flash-Lite (primary) / Flash (fallback)
- **Deployment:** Vercel Hobby
- **UI:** Tailwind CSS + shadcn/ui

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment template and fill in your values
cp .env.example .env.local

# Push schema to database
npm run db:push

# Start dev server
npm run dev
```

## Environment Variables

See [`.env.example`](.env.example) for required variables.

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/health` | Health check + DB connectivity |
| POST | `/api/comparisons` | Upload original + replacement documents |
| POST | `/api/comparisons/[id]/analyze` | Trigger extraction for a comparison |

## Project Structure

```
app/              Next.js App Router pages and API routes
components/ui/    shadcn/ui components
config/           Environment validation
db/               Drizzle schema and connection
lib/
  ai/            Gemini extraction (prompt, core function)
  bearings/      Canonical BearingSpec type
  evidence/      Evidence type
  storage/       Supabase Storage operations
  validation/    Zod schemas for Gemini output validation
data/             Ground-truth fixture data
tests/            Fixture validation scripts
```
