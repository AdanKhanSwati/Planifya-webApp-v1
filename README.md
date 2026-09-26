# Planifya Web

Planifya Web is the responsive browser counterpart to the Planifya Android application. It uses the same production API, Firebase identities, Mongo-backed user records, bookings, tickets, chats, notifications, reviews, provider data and payment flows as Android.

## Product coverage

- Location selection by province, city and area
- Service and ticket-event discovery with search, sorting and category filtering
- Grid and list discovery layouts
- Service/event details with touch-swipe media galleries
- Firebase sign-up, sign-in, verification, password reset and confirmed email changes
- Customer profile, favourites, notifications and customer/provider role switching
- Service booking, ticket purchasing, status polling, e-tickets and QR presentation
- Customer booking completion, payment release, reviews and cancellation/refund requests
- Chat rooms, text, images, audio, documents and custom-offer workflows
- Provider onboarding, business details, identity verification and bank details
- Provider service/event creation, editing, pausing, service-level bookings and ticket management
- Provider dashboard analytics, bookings, refunds, reviews, sales, scanner and payout views
- Support requests, attachments, feedback and reporting

The web client does not introduce features the Android/backend source does not support. Android placeholders such as calls, paid featured-listing checkout and alternate payment providers remain out of scope until the backend implements them.

## Architecture and safety

The frontend calls relative `/api/*` and `/__firebase/*` routes. Hosting proxies those paths to the existing production services so the browser shares the Android data model without changing backend CORS or DNS. The Firebase web key included in the client is the same public client identifier already used by the application; privileged Firebase credentials are never included.

Production writes should be tested only with an approved test account. The automated release check is read-only and does not create bookings, payments, chats or accounts.

## Validate and deploy

```bash
npm test
npm run build
```

Vercel serves `dist/client` and applies the same-origin API rewrites in `vercel.json`.

See [MOBILE_WEB_PARITY.md](MOBILE_WEB_PARITY.md) for the Android/web comparison and endpoint families.
