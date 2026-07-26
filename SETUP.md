# RoKo-Bar Booking Backend Setup

This project now has Vercel serverless functions in `/api`. The React/Vite app is still static, but local API testing must use Vercel's dev server.

## 1. Create Supabase

1. Create a free Supabase project at supabase.com.
2. Open the project dashboard.
3. Go to the SQL Editor.
4. Open `supabase/schema.sql` from this repo, paste the full contents into the SQL Editor, and run it.

This creates:

- `bookings`: booking requests and lifecycle/payment/contract columns.
- `blocked_dates`: manually blocked nights.
- A unique database index that prevents two `confirmed` bookings on the same night.

Create **two private** Supabase Storage buckets (Storage → New bucket, leave
"Public" off):

- `contracts` — signed guest uploads under `signed/{booking_id}.pdf` and tutor
  counter-signed PDFs under `final/{booking_id}.pdf`.
- `payment-proofs` — rent payment proofs under `rent/{booking_id}.{pdf|png|jpg}`,
  uploaded only for online bank transfers.

Both must stay private. The app never exposes a Supabase key to the browser and
serves every download through server-side API routes using short-lived signed
URLs. If the `payment-proofs` bucket is missing, online-payment submissions fail.

Running `schema.sql` also enables Row Level Security on the tables and installs a
`rate_limits` table plus a `rate_limit_hit()` function used to throttle the
public endpoints (booking creation, admin login, and status reads). On an
**existing** project, run `supabase/migrations/20260721_rls_and_rate_limits.sql`
once in the SQL Editor before deploying this version. Until it is run, rate
limiting fails open (requests are allowed) and logs a one-time warning.

## 2. Find Supabase Environment Values

In the Supabase dashboard, open Project Settings, then API.

Copy these values:

- `SUPABASE_URL`: the Project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: the `service_role` key.

Keep the service role key secret. It bypasses normal row-level restrictions and belongs only in server-side Vercel environment variables.

## 3. Local Environment Variables

Create a local `.env.local` file in the repo root:

```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=choose-a-long-random-admin-password
SITE_URL=http://localhost:3000
RESEND_API_KEY=your-resend-api-key
```

`.env` and `.env.local` are gitignored. Do not put real secrets in `.env.example`.
`ADMIN_PASSWORD` is used only by serverless functions. Do not prefix it with
`VITE_`, because that would expose it to the browser bundle.
`SITE_URL` is used in approval and confirmation emails; locally it defaults to
`http://localhost:3000` if omitted.

## 4. Vercel Production Environment Variables

In the Vercel dashboard:

1. Open the project.
2. Go to Settings, then Environment Variables.
3. Add these variables for Production:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
   - `SITE_URL`
   - `RESEND_API_KEY`
4. Redeploy after adding or changing production environment variables.

## 5. Run Locally

Use Node.js 20 or newer.

Install dependencies:

```bash
npm install
```

Install the Vercel CLI if you do not already have it:

```bash
npm install -g vercel
```

Run the full app plus API functions:

```bash
vercel dev
```

Use the local URL printed by Vercel, usually `http://localhost:3000`.

Important: `npm run dev` starts only the Vite frontend. It will not serve `/api/availability` or `/api/bookings`.

Open the password-protected admin page at:

```bash
http://localhost:3000/admin
```

The browser stores only the signed admin session token in `sessionStorage`; the
password stays server-side after login.

## 6. Curl Tests

The examples below use future dates from June 2026. If these dates are no longer in the future when you test, replace them with any future Friday/Saturday for valid requests and a future Tuesday for the invalid request.

Set the local base URL:

```bash
BASE_URL=http://localhost:3000
```

### Availability

```bash
curl "$BASE_URL/api/availability"
```

Expected result:

```json
{"taken":[],"pending":[]}
```

If you already inserted bookings or blocked dates, those dates will appear in `taken` or `pending`.

### Valid Resident Booking

Friday, 2026-07-03 should be valid.

```bash
curl -i -X POST "$BASE_URL/api/bookings" \
  -H "Content-Type: application/json" \
  -d '{
    "night": "2026-07-03",
    "requester_name": "Roko Resident",
    "email": "resident@example.com",
    "phone": "+49 551 123456",
    "address": "Robert-Koch-Straße 38, 37075 Göttingen",
    "residency": "roko",
    "guest_count": 30,
    "additional_info": "Birthday party"
  }'
```

Expected result: HTTP `201` with a generated `id`, `price` `75`, and `deposit` `200`.

### Valid External Booking

Saturday, 2026-07-04 should be valid.

```bash
curl -i -X POST "$BASE_URL/api/bookings" \
  -H "Content-Type: application/json" \
  -d '{
    "night": "2026-07-04",
    "requester_name": "External Guest",
    "email": "external@example.com",
    "phone": "+49 551 654321",
    "address": "Example Street 1, 37073 Göttingen",
    "residency": "external",
    "guest_count": 25,
    "additional_info": "Private event"
  }'
```

Expected result: HTTP `201` with a generated `id`, `price` `100`, and `deposit` `200`.

### Invalid Tuesday Booking

Tuesday, 2026-07-07 should fail because only Fridays and Saturdays are bookable.

```bash
curl -i -X POST "$BASE_URL/api/bookings" \
  -H "Content-Type: application/json" \
  -d '{
    "night": "2026-07-07",
    "requester_name": "Tuesday Tester",
    "email": "tuesday@example.com",
    "address": "Example Street 2, 37073 Göttingen",
    "residency": "external"
  }'
```

Expected result: HTTP `400`.

```json
{"error":"night must be a Friday or Saturday."}
```
