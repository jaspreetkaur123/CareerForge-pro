# CareerForge Pro — API Reference

> **Base URL:** `http://localhost:5000`  
> **Auth:** All protected routes require `Authorization: Bearer <token>` header  
> **Content-Type:** `application/json` (except Stripe webhook)

---

## Authentication — `/api/auth`

### POST `/api/auth/register`
Create a new user account.

**Auth Required:** ❌

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

**Success Response — `201`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
  "user": {
    "id": "664f1a2b3c4d5e6f7a8b9c0d",
    "name": "John Doe",
    "email": "john@example.com",
    "plan": "free"
  }
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| `400` | `"All fields are required"` |
| `409` | `"Email already in use"` |

---

### POST `/api/auth/login`
Login with existing credentials.

**Auth Required:** ❌

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Success Response — `200`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
  "user": {
    "id": "664f1a2b3c4d5e6f7a8b9c0d",
    "name": "John Doe",
    "email": "john@example.com",
    "plan": "free"
  }
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| `400` | `"Email and password required"` |
| `401` | `"Invalid credentials"` |

---

### GET `/api/auth/me`
Get the currently authenticated user's profile.

**Auth Required:** ✅

**Request Body:** None

**Success Response — `200`:**
```json
{
  "id": "664f1a2b3c4d5e6f7a8b9c0d",
  "name": "John Doe",
  "email": "john@example.com",
  "plan": "free",
  "resumeCount": 1,
  "createdAt": "2026-04-11T10:00:00.000Z"
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| `401` | `"No token provided"` |
| `401` | `"Invalid or expired token"` |

---

## Resumes — `/api/resume`

> All resume routes require authentication.

---

### POST `/api/resume`
Create a new blank resume.

**Auth Required:** ✅  
**Plan Guard:** Free users limited to **1 resume**

**Request Body:**
```json
{
  "title": "Software Engineer at Google"
}
```
> `title` is optional — defaults to `"Untitled Resume"`

**Success Response — `201`:**
```json
{
  "_id": "664f1a2b3c4d5e6f7a8b9c0e",
  "userId": "664f1a2b3c4d5e6f7a8b9c0d",
  "title": "Software Engineer at Google",
  "rawText": "",
  "jobDescription": "",
  "jdAnalysis": {},
  "rewrittenData": {},
  "atsScore": 0,
  "template": "classic",
  "status": "draft",
  "createdAt": "2026-04-11T10:00:00.000Z",
  "updatedAt": "2026-04-11T10:00:00.000Z"
}
```

**Error Responses:**
| Status | Message |
|--------|---------|
| `401` | `"No token provided"` |
| `403` | `"Free plan allows only 1 resume..."` + `upgradeRequired: true` |

---

### GET `/api/resume`
List all resumes for the authenticated user.

**Auth Required:** ✅

**Request Body:** None

**Success Response — `200`:**
```json
[
  {
    "_id": "664f1a2b3c4d5e6f7a8b9c0e",
    "title": "Software Engineer at Google",
    "atsScore": 87,
    "status": "rewritten",
    "template": "modern",
    "createdAt": "2026-04-11T10:00:00.000Z",
    "updatedAt": "2026-04-11T10:05:00.000Z"
  }
]
```
> Returns abbreviated fields only (no rawText/rewrittenData for performance)

---

### GET `/api/resume/:id`
Get a single resume with all fields.

**Auth Required:** ✅

**URL Params:**
| Param | Type | Description |
|-------|------|-------------|
| `id` | `string` | MongoDB resume `_id` |

**Success Response — `200`:** Full resume document (all fields)

**Error Responses:**
| Status | Message |
|--------|---------|
| `404` | `"Resume not found"` |

---

### PATCH `/api/resume/:id`
Update any resume field(s).

**Auth Required:** ✅

**URL Params:** `id` — resume `_id`

**Request Body** _(any subset of resume fields)_:
```json
{
  "title": "Updated Title",
  "template": "minimal"
}
```

**Updatable Fields:**
| Field | Type | Values |
|-------|------|--------|
| `title` | `string` | any |
| `template` | `string` | `classic`, `modern`, `minimal` |
| `rawText` | `string` | plain text resume |
| `jobDescription` | `string` | job description text |
| `rewrittenData` | `object` | structured resume JSON |
| `atsScore` | `number` | `0–100` |
| `status` | `string` | `draft`, `analyzed`, `rewritten`, `exported` |

**Success Response — `200`:** Updated resume document

**Error Responses:**
| Status | Message |
|--------|---------|
| `404` | `"Resume not found"` |

---

### DELETE `/api/resume/:id`
Delete a resume.

**Auth Required:** ✅

**URL Params:** `id` — resume `_id`

**Success Response — `200`:**
```json
{ "message": "Resume deleted" }
```

**Error Responses:**
| Status | Message |
|--------|---------|
| `404` | `"Resume not found"` |

---

### POST `/api/resume/:id/upload-raw`
Store raw plain-text resume content on an existing resume.

**Auth Required:** ✅

**URL Params:** `id` — resume `_id`

**Request Body:**
```json
{
  "rawText": "John Doe\nSoftware Engineer\n\nExperience:\n- Built REST APIs..."
}
```

**Success Response — `200`:** Updated resume document with `status: "draft"`

**Error Responses:**
| Status | Message |
|--------|---------|
| `400` | `"rawText is required"` |
| `404` | `"Resume not found"` |

---

## JD Analysis — `/api/jd`

> Requires authentication. Gemini AI wired in Phase 2.

---

### POST `/api/jd/:resumeId/analyze`
Analyze a Job Description and extract ranked keywords.

**Auth Required:** ✅

**URL Params:**
| Param | Type | Description |
|-------|------|-------------|
| `resumeId` | `string` | MongoDB resume `_id` to attach JD to |

**Request Body:**
```json
{
  "jobDescription": "We are looking for a Senior Backend Engineer proficient in Node.js, Python, Agile, and AWS..."
}
```

**Success Response — `200`:**
```json
{
  "message": "JD analyzed",
  "resumeId": "664f1a2b3c4d5e6f7a8b9c0e",
  "jdAnalysis": {
    "keywords": ["Node.js", "Python", "AWS", "Agile", "REST API"],
    "mustHave": ["Node.js", "AWS"],
    "niceToHave": ["Docker", "Kubernetes"],
    "tone": "technical",
    "jobTitle": "Senior Backend Engineer"
  }
}
```
> ⚠️ Returns empty arrays in Phase 1. Full Gemini output live in Phase 2.

**Error Responses:**
| Status | Message |
|--------|---------|
| `400` | `"jobDescription is required"` |
| `404` | `"Resume not found"` |

---

## Stripe / Billing — `/api/stripe`

---

### POST `/api/stripe/create-checkout-session`
Create a Stripe Checkout Session for Pro plan upgrade.

**Auth Required:** ✅

**Request Body:** None

**Success Response — `200`:**
```json
{
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```
> Redirect the user to this URL to complete payment.

**Error Responses:**
| Status | Message |
|--------|---------|
| `400` | `"Already on Pro plan"` |
| `500` | Stripe SDK error |

---

### POST `/api/stripe/webhook`
Stripe webhook endpoint. Called automatically by Stripe.

**Auth Required:** ❌ (verified via `stripe-signature` header)  
**Content-Type:** `application/octet-stream` (raw body — do NOT send JSON)

**Handled Events:**
| Event | Action |
|-------|--------|
| `checkout.session.completed` | Activate Pro plan, create Subscription doc |
| `customer.subscription.deleted` | Downgrade user to Free |
| `invoice.payment_failed` | Set subscription to `past_due` |
| `customer.subscription.updated` | Sync period dates and cancel status |

**Success Response — `200`:**
```json
{ "received": true }
```

---

### GET `/api/stripe/subscription`
Get the current user's subscription details.

**Auth Required:** ✅

**Success Response — `200` (Free):**
```json
{ "plan": "free", "subscription": null }
```

**Success Response — `200` (Pro):**
```json
{
  "plan": "pro",
  "subscription": {
    "stripeSubscriptionId": "sub_...",
    "status": "active",
    "currentPeriodStart": "2026-04-01T00:00:00.000Z",
    "currentPeriodEnd": "2026-05-01T00:00:00.000Z",
    "cancelAtPeriodEnd": false
  }
}
```

---

## Health Check

### GET `/`
Server liveness check.

**Auth Required:** ❌

**Success Response — `200`:** `{ "status": "ok" }`

---

## Common Error Patterns

| Status | Cause |
|--------|-------|
| `400` | Missing or invalid request fields |
| `401` | Missing, invalid, or expired JWT |
| `403` | Plan limit exceeded (`upgradeRequired: true`) |
| `404` | Resource not found or doesn't belong to user |
| `409` | Conflict (e.g. duplicate email) |
| `500` | Internal server error |

---

## Upcoming Endpoints (Phase 2+)

| Method | Endpoint | Phase | Description |
|--------|----------|-------|-------------|
| `POST` | `/api/resume/:id/rewrite` | Phase 2 | AI resume rewrite via Gemini |
| `GET`  | `/api/resume/:id/export`  | Phase 3 | Download resume as PDF |
| `POST` | `/api/stripe/cancel`      | Phase 4 | Cancel Pro subscription |
