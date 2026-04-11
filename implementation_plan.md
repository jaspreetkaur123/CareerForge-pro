# CareerForge Pro — Implementation Plan
## ATS-Proof Resume Generator & Job Matcher

A full-stack SaaS application where users upload/paste resumes, input a Job Description, and receive an AI-rewritten, ATS-optimized resume exported as a pixel-perfect PDF.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Vite + Tailwind CSS v4 |
| Backend | Node.js + Express 5 |
| AI | Google Gemini 2.0 Flash (via `@google/generative-ai`) |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt (token-based, stateless) |
| Payments | Stripe (Checkout Sessions + Webhooks) |
| PDF | Puppeteer (Headless Chrome rendering) |
| File Parsing | pdf-parse (resume PDF → text), multer (file upload) |

---

## Architecture Overview

```
Frontend (Vite:5173)
    │
    ▼ REST API
Backend (Express:3000)
    ├── /api/auth       → JWT auth (register/login)
    ├── /api/resume     → CRUD + AI rewrite + PDF export
    ├── /api/jd         → JD analysis agent
    └── /api/stripe     → Subscription management
    │
    ├── Gemini API      → JD keyword extraction + resume rewrite
    ├── Puppeteer       → HTML → PDF rendering
    └── MongoDB         → Users, Resumes, Subscriptions
```

---

## Phase 1 — Backend Foundation

### Backend Folder Structure (NEW)
```
Backend/
├── server.js               ← existing (keep)
├── .env                    ← add all new keys
└── src/
    ├── app.js              ← existing (expand with new routes)
    ├── config/
    │   └── db.js           ← MongoDB connection
    ├── middleware/
    │   ├── auth.js         ← JWT verify middleware
    │   └── planGuard.js    ← Free tier limit enforcement
    ├── models/
    │   ├── User.js         ← name, email, password, plan, stripeCustomerId
    │   ├── Resume.js       ← userId, rawText, rewrittenData, atsScore, template, jdKeywords
    │   └── Subscription.js ← userId, stripeSubId, plan, status, currentPeriodEnd
    ├── routes/
    │   ├── auth.routes.js
    │   ├── resume.routes.js
    │   ├── jd.routes.js
    │   └── stripe.routes.js
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── resume.controller.js
    │   ├── jd.controller.js
    │   └── stripe.controller.js
    └── services/
        ├── gemini.service.js    ← All Gemini API calls
        ├── puppeteer.service.js ← HTML → PDF
        └── stripe.service.js   ← Stripe SDK wrappers
```

### New Dependencies to Install (Backend)
```bash
npm install @google/generative-ai bcryptjs jsonwebtoken multer pdf-parse puppeteer stripe
```

### Key `.env` Variables
```
MONGODB_URI=
JWT_SECRET=
GEMINI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_FREE_PRICE_ID=
STRIPE_PRO_PRICE_ID=
CLIENT_URL=http://localhost:5173
```

---

## Phase 2 — AI Core (Gemini Integration)

### 2A. JD Analysis Agent (`gemini.service.js`)

**Prompt strategy** — structured JSON output:
```
System: You are a senior technical recruiter and ATS specialist.
Task: Analyze this job description and return a JSON object with:
  - keywords: string[] (top 20, ranked by importance)
  - mustHave: string[] (non-negotiable requirements)
  - niceToHave: string[] (preferred qualifications)
  - tone: "technical" | "leadership" | "creative"
  - title: string (standardized job title)
```
Model: `gemini-2.0-flash` with `response_mime_type: "application/json"`

### 2B. Resume Rewrite Agent (`gemini.service.js`)

**Prompt strategy:**
```
System: You are an elite resume writer specializing in ATS optimization.
Context: Target keywords: {keywords}. Must include: {mustHave}.
Task: Rewrite ONLY the experience bullet points from this resume.
Rules:
  - Start each bullet with a strong action verb
  - Naturally embed as many keywords as possible
  - Quantify achievements (use placeholders like [X%] if unknown)
  - Output valid JSON: { summary, experience[], skills[], education[] }
  - Do NOT fabricate companies or dates
```

### 2C. ATS Score Calculator
Computed server-side after rewrite:
- Count of `mustHave` keywords found in rewritten text
- Count of `keywords` found
- Formula: `score = (mustHaveMatched/mustHave.length * 0.6 + keywordsMatched/keywords.length * 0.4) * 100`

---

## Phase 3 — PDF Generation (Puppeteer)

### Flow
1. Frontend sends structured resume JSON to `/api/resume/:id/export`
2. Backend injects JSON into an HTML resume template string
3. Puppeteer launches headless Chrome, loads the HTML
4. `page.pdf({ format: 'A4', printBackground: true })` generates PDF buffer
5. Buffer sent as `application/pdf` response

### Templates (3 initial)
- **Classic** — single column, traditional serif typography
- **Modern** — two-column, accent color sidebar
- **Minimal** — clean whitespace, monochrome

> [!NOTE]
> Templates are pure HTML/CSS strings in `src/services/puppeteer.service.js`. No React rendering server-side — just static HTML injection.

---

## Phase 4 — Auth System

### Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Hash password, create user, return JWT |
| POST | `/api/auth/login` | Verify credentials, return JWT |
| GET | `/api/auth/me` | Return current user from JWT |

- JWT stored in `localStorage` on frontend, sent as `Authorization: Bearer <token>`
- `planGuard.js` middleware checks `user.plan` and resume count before any AI operation

---

## Phase 5 — Stripe Subscription

### Tier Definition
| Feature | Free | Pro ($X/mo) |
|---------|------|-------------|
| AI-Rewritten Resumes | 1 | Unlimited |
| Cover Letter Gen | ❌ | ✅ |
| Premium Templates | ❌ | ✅ (Modern + Minimal) |
| PDF Export | ✅ | ✅ |

### Flow
1. User clicks "Upgrade" → POST `/api/stripe/create-checkout-session`
2. Redirected to Stripe Checkout
3. On success → Stripe fires `checkout.session.completed` webhook
4. Backend updates `user.plan = "pro"`, creates `Subscription` doc
5. Frontend polls `/api/auth/me` or uses webhook-triggered socket event

### Webhook Events Handled
- `checkout.session.completed` → activate Pro
- `customer.subscription.deleted` → downgrade to Free
- `invoice.payment_failed` → flag account

---

## Phase 6 — Frontend Architecture

### Frontend Folder Structure (NEW)
```
Frontend/src/
├── main.jsx
├── App.jsx                 ← add react-router-dom routes
├── index.css               ← global design tokens
├── api/
│   └── axios.js            ← Axios instance with JWT interceptor
├── store/
│   └── authStore.js        ← Zustand: user, token, plan
├── pages/
│   ├── Landing.jsx         ← marketing homepage
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx       ← resume list + usage meter
│   ├── Builder.jsx         ← main editor (upload + JD + result)
│   └── Pricing.jsx         ← Stripe upgrade CTA
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── resume/
│   │   ├── ResumeUploader.jsx   ← drag-drop PDF/DOCX upload
│   │   ├── JDInput.jsx          ← JD textarea + analyze button
│   │   ├── KeywordBadges.jsx    ← extracted keywords display
│   │   ├── ATSScoreRing.jsx     ← animated circular score
│   │   ├── ResumeEditor.jsx     ← editable rewritten resume
│   │   └── TemplatePicker.jsx   ← template selection
│   └── ui/
│       ├── Button.jsx
│       ├── Modal.jsx
│       └── LoadingSpinner.jsx
```

### New Frontend Dependencies
```bash
npm install react-router-dom axios zustand react-dropzone react-hot-toast
```

> [!IMPORTANT]
> `tailwindcss` v4 is already installed. No config file needed — uses CSS `@import "tailwindcss"` directly in `index.css`.

---

## Phase 7 — Landing Page & UI Design

### Design System
- **Primary**: `#6C63FF` (electric violet)  
- **Accent**: `#00D4AA` (mint green — ATS "score" color)  
- **Background**: `#0A0A0F` (near-black)  
- **Surface**: `#12121A` (card background)  
- **Glass**: `rgba(255,255,255,0.05)` + `backdrop-filter: blur(12px)`
- **Font**: `Inter` (body) + `Cal Sans` or `Sora` (headings)

### Landing Page Sections
1. **Hero** — animated headline, ATS score counter animation, CTA buttons
2. **How It Works** — 3-step visual flow (Upload → Analyze → Download)
3. **ATS Score Demo** — live mock showing score going from 42% → 91%
4. **Features Grid** — keyword matching, AI rewrite, Puppeteer PDF, templates
5. **Pricing** — Free vs Pro cards with Stripe CTA
6. **Footer**

---

## Build Sequence (Execution Order)

```
Phase 1: Backend models + DB connection + auth routes
Phase 2: Gemini service (JD analysis + rewrite)
Phase 3: Puppeteer PDF service + export route
Phase 4: Stripe routes + webhook handler
Phase 5: Frontend router + auth pages + Zustand store
Phase 6: Builder page (core product flow)
Phase 7: Dashboard + Pricing page
Phase 8: Landing page + polish
```

---

## Verification Plan

### Automated
- Test Gemini service with mock JD → verify keyword JSON output
- Test PDF generation → verify buffer returned and file size > 0
- Test planGuard → free user cannot create 2nd resume

### Browser Testing
- Full flow: Register → Upload Resume → Paste JD → Analyze → View Rewrite → ATS Score → Download PDF
- Stripe test mode: upgrade flow with card `4242 4242 4242 4242`
- Verify JWT expiry and redirect to login

---

## Open Questions

> [!IMPORTANT]
> **Pricing**: What should the Pro plan monthly price be? (Suggest $9/mo or $19/mo)

> [!IMPORTANT]
> **Cover Letter**: Should cover letter generation (Pro feature) be included in this build or deferred to v2?

> [!NOTE]
> **Auth Provider**: Plan uses custom JWT auth. Want to add Google OAuth (via Passport.js or Firebase) as an option?

> [!NOTE]
> **Resume Input**: Allow plain text paste in addition to PDF upload? (simpler UX path)
