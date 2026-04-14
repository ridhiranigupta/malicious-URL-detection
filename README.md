# CyberShield AI

Beautiful, full-stack malicious URL detection platform built for modern security workflows.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4)
![License](https://img.shields.io/badge/License-MIT-green)

## Why this project

CyberShield AI helps analysts quickly decide whether a URL is safe, suspicious, or malicious by combining:

- rule-based detection
- ML-driven scoring
- threat intelligence enrichment
- explainable output for human review

## Features

| Area | Included |
|---|---|
| URL Detection | Hybrid rules + ML score + confidence |
| Threat Intelligence | WHOIS, SSL summary, optional Safe Browsing, screenshot lookup |
| Dashboard | Live scanning UI, risk gauge, interactive results |
| History | Saved scans, trends, export support |
| Auth | NextAuth credentials login/signup |
| API | Secure route handlers with validation and rate limiting |

## Tech stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- Framer Motion + React Three Fiber
- Prisma ORM
- NextAuth
- Zod
- Python-based ML inference bridge

## Project structure

```text
app/
  api/
  auth/
  dashboard/
  history/
  results/
components/
lib/
ml/
prisma/
scripts/
```

## Local development

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Create .env from .env.example and set values.

Required values:

- DATABASE_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL

Optional values:

- DIRECT_URL
- GOOGLE_SAFE_BROWSING_API_KEY
- PYTHON_BIN

### 3) Prisma setup

```bash
npm run prisma:generate
npx prisma db push
```

### 4) Run app

```bash
npm run dev
```

Open http://localhost:3000

## Main scripts

```bash
npm run dev
npm run build
npm run start
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
npm run ml:train
npm run smoke:test
```

## Production deployment

### Vercel + Managed PostgreSQL

Set these variables in Vercel Production:

- DATABASE_URL
- DIRECT_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- GOOGLE_SAFE_BROWSING_API_KEY (optional)
- PYTHON_BIN (optional)

Build command already configured:

```bash
npm run vercel-build
```

Deploy command:

```bash
npm run deploy:vercel
```

## Smoke test

Local:

```bash
npm run smoke:test
```

Production:

```bash
SMOKE_BASE_URL="https://your-app.vercel.app" npm run smoke:test
```

## Security notes

- Do not commit .env files
- Use strong NEXTAUTH_SECRET values
- Prefer pooled runtime DB URL + direct migration URL in production
- Replace synthetic ML training data before a real release

## License

MIT
