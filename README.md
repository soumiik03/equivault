# EquiVault

**AI-powered bearing document analysis, compatibility, and compliance evaluation system.**

EquiVault helps engineers evaluate whether a proposed replacement bearing is compatible with an original bearing by automatically extracting specifications from technical documents, normalizing engineering values, applying deterministic compatibility rules, and generating an explainable verdict.

Instead of manually comparing multiple bearing datasheets, engineers can upload the original and replacement documents and receive a structured comparison with **pass, hard-fail, warning, and unverified** findings.

---

## Key Features

### 📄 AI-Powered Document Extraction

Upload bearing technical PDFs and automatically extract structured engineering specifications using Gemini.

The system can work with information such as:

* Part number
* Manufacturer
* Bearing type
* Inner diameter
* Outer diameter
* Width
* Dynamic load rating
* Static load rating
* Maximum speed
* Operating temperature
* Material
* Clearance
* Seal type
* Applicable standards
* Certifications and compliance information

---

### ⚙️ Engineering Specification Normalization

Extracted values are validated and normalized before comparison.

This allows specifications represented in different formats or units to be evaluated consistently.

The normalized data is then converted into a structured bearing specification used throughout the comparison pipeline.

---

### 🔍 Deterministic Compatibility Analysis

EquiVault does **not** rely on an LLM to make the final engineering decision.

After AI extraction, the structured specifications are evaluated using a deterministic engineering rule engine.

Rules can identify:

* **PASS** — requirement is satisfied
* **HARD FAIL** — critical engineering requirement is violated
* **UNVERIFIED** — insufficient information is available
* **WARNING** — additional attention may be required

This makes the final decision predictable and explainable.

---

### 🚨 Hard-Fail Safety Logic

Critical engineering constraints can override the overall compatibility score.

For example:

```text
Original Dynamic Load Rating:     32.5 kN
Replacement Dynamic Load Rating: 31.5 kN
```

If the replacement does not satisfy the original dynamic load requirement, EquiVault identifies the rule as a:

**HARD FAIL**

and produces:

**NOT COMPATIBLE**

This prevents a high overall score from hiding a critical engineering failure.

---

### ❓ Explicit Handling of Missing Information

EquiVault does not invent missing engineering values.

If a required parameter is unavailable in the uploaded documents, it is marked as:

**UNVERIFIED**

The dashboard identifies the missing information so that the engineer knows what needs to be obtained before making a final decision.

For example:

```text
Maximum Speed        → UNVERIFIED
Operating Temperature → UNVERIFIED
RoHS Compliance      → UNVERIFIED
```

This clearly separates a failed requirement from a requirement that simply could not be verified.

---

### 📊 Comparison Dashboard

The final dashboard provides a complete view of the analysis, including:

* Original vs replacement bearing information
* Overall compatibility verdict
* Verified criteria score
* Critical issues
* Side-by-side specifications
* Individual rule results
* Hard failures
* Missing information
* Evidence
* Engineering findings
* Regulatory/compliance findings
* Processing status

---

### 🔎 Evidence & Explainability

Results are designed to be traceable back to the uploaded engineering documents.

The system can provide supporting information such as:

* Source document
* Page
* Extracted value
* Supporting text
* Rule responsible for the result

This allows engineers to understand **why** a result was produced instead of relying on an unexplained AI response.

---

### 📋 Compliance Analysis

EquiVault keeps engineering compatibility findings separate from regulatory and quality information.

The system can track information related to:

* RoHS
* REACH / SVHC
* CE marking
* Certifications

When the required information is unavailable, it is reported as **unverified** rather than automatically assuming compliance.

---

## How It Works

```text
┌───────────────────────┐
│ Original Bearing PDF  │
└───────────┬───────────┘
            │
            │
┌───────────▼───────────┐
│ Replacement Bearing   │
│ PDF                   │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ Document Processing   │
└───────────┬───────────┘
            ▼
┌───────────────────────┐
│ Gemini AI Extraction  │
│ → Structured Specs    │
└───────────┬───────────┘
            ▼
┌───────────────────────┐
│ Validation &          │
│ Normalization         │
└───────────┬───────────┘
            ▼
┌───────────────────────┐
│ Engineering &         │
│ Compliance Rules      │
└───────────┬───────────┘
            ▼
┌───────────────────────┐
│ Risk Assessment &     │
│ Final Verdict         │
└───────────┬───────────┘
            ▼
┌───────────────────────┐
│ Explainable Dashboard │
│ + Evidence            │
└───────────────────────┘
```

### Core pipeline

**Upload → Extract → Validate → Normalize → Compare → Evaluate → Explain**

---

## Architecture

EquiVault uses a separation between AI-based document understanding and deterministic engineering evaluation.

```text
                    ┌─────────────────┐
                    │    Next.js UI   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   API Layer     │
                    └───────┬─────────┘
                            │
             ┌──────────────┼──────────────┐
             │              │              │
             ▼              ▼              ▼
      ┌────────────┐ ┌─────────────┐ ┌──────────────┐
      │  Supabase  │ │   Gemini    │ │    Neon      │
      │  Storage   │ │     AI      │ │  PostgreSQL  │
      └────────────┘ └──────┬──────┘ └──────────────┘
                            │
                            ▼
                    ┌─────────────────┐
                    │ Validation &    │
                    │ Normalization   │
                    └────────┬────────┘
                             ▼
                    ┌─────────────────┐
                    │ Rule Engine     │
                    └────────┬────────┘
                             ▼
                    ┌─────────────────┐
                    │ Risk / Verdict  │
                    │ Engine          │
                    └────────┬────────┘
                             ▼
                    ┌─────────────────┐
                    │ Evidence &      │
                    │ Dashboard       │
                    └─────────────────┘
```

### Design principle

> **AI extracts. Engineering rules decide. Evidence explains.**

This separation is central to EquiVault's design.

---

## Technology Stack

| Layer           | Technology                            |
| --------------- | ------------------------------------- |
| Frontend        | Next.js, TypeScript                   |
| UI              | Tailwind CSS, shadcn/ui               |
| AI / Extraction | Gemini API                            |
| Database        | Neon PostgreSQL                       |
| ORM             | Drizzle ORM                           |
| File Storage    | Supabase Storage                      |
| Backend         | Next.js API                           |
| Evaluation      | Deterministic Engineering Rule Engine |
| Compliance      | Compliance / Risk Engine              |
| Deployment      | Vercel                                |

---

## Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=

SUPABASE_URL=
SUPABASE_SECRET_KEY=
SUPABASE_STORAGE_BUCKET=bearing-documents

GEMINI_API_KEY=
```

### Environment variable descriptions

| Variable                  | Purpose                                            |
| ------------------------- | -------------------------------------------------- |
| `DATABASE_URL`            | Connection string for the Neon PostgreSQL database |
| `SUPABASE_URL`            | Supabase project URL                               |
| `SUPABASE_SECRET_KEY`     | Server-side Supabase authentication                |
| `SUPABASE_STORAGE_BUCKET` | Storage bucket used for bearing documents          |
| `GEMINI_API_KEY`          | Gemini API authentication                          |

> **Important:** Never expose `SUPABASE_SECRET_KEY` or `GEMINI_API_KEY` in client-side code or commit them to Git.

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd EquiVault
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create `.env`:

```env
DATABASE_URL=your_neon_database_url

SUPABASE_URL=your_supabase_url
SUPABASE_SECRET_KEY=your_supabase_secret_key
SUPABASE_STORAGE_BUCKET=bearing-documents

GEMINI_API_KEY=your_gemini_api_key
```

### 4. Set up the database

Apply the Drizzle database schema/migrations according to the project's database configuration.

### 5. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Example Analysis

Consider an original and replacement bearing with the following dynamic load ratings:

| Parameter           | Original | Replacement |
| ------------------- | -------: | ----------: |
| Dynamic Load Rating |  32.5 kN |     31.5 kN |
| Inner Diameter      |    40 mm |       40 mm |
| Outer Diameter      |    80 mm |       80 mm |
| Width               |    18 mm |       18 mm |

Although the dimensions match, the replacement has a lower dynamic load rating.

EquiVault therefore produces:

```text
Dynamic Load Rating
32.5 kN → 31.5 kN

Result: HARD FAIL

Overall Verdict:
NOT COMPATIBLE
```

This demonstrates why compatibility cannot be determined from dimensions alone.

---

## Why EquiVault?

Traditional manual comparison requires an engineer to:

1. Open multiple technical documents.
2. Locate relevant specifications.
3. Convert units where necessary.
4. Compare individual parameters.
5. Check engineering constraints.
6. Identify missing information.
7. Determine whether the replacement is actually acceptable.
8. Document the reasoning behind the decision.

EquiVault brings these steps into a single workflow while maintaining a clear distinction between **AI extraction** and **engineering evaluation**.

---

## Key Design Principles

### AI-Assisted, Not AI-Decided

Gemini handles unstructured document understanding and extraction. The final engineering decision is controlled by explicit rules.

### Fail-Safe Evaluation

Critical constraints can produce a hard failure that overrides the overall score.

### No Guessing

Missing information is explicitly marked as unverified rather than fabricated.

### Evidence-Backed Results

Results are connected to the underlying extracted information and source documents.

### Separation of Concerns

Document processing, normalization, engineering rules, compliance evaluation, risk assessment, and presentation are separated into distinct stages.

---

## Project Structure

A simplified project structure:

```text
EquiVault/
├── app/
│   ├── api/
│   ├── comparisons/
│   └── ...
│
├── components/
│   ├── dashboard/
│   ├── comparison/
│   └── ...
│
├── config/
│
├── data/
│
├── db/
│
├── drizzle/
│
├── lib/
│   ├── ai/
│   ├── bearings/
│   ├── compliance/
│   ├── evidence/
│   ├── normalization/
│   ├── rules/
│   ├── storage/
│   └── validation/
│
├── tests/
│
├── .env
└── package.json
```

---

## Status

EquiVault currently supports the complete core workflow:

**Document Upload → AI Extraction → Validation → Normalization → Engineering Evaluation → Risk Assessment → Verdict Dashboard**

The system is deployed using **Vercel** with **Neon PostgreSQL**, **Supabase Storage**, and the **Gemini API**.

---

## Core Concept

> **EquiVault transforms engineering bearing datasheets into transparent, evidence-backed compatibility and compliance decisions.**

The goal is not to replace engineering judgment, but to give engineers a faster, more structured, and more explainable way to evaluate replacement components.
