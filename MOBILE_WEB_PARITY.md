# Planifya Android ↔ Web parity

This matrix is based on the supplied Flutter application, its bundled Node/Express backend and the completed web client. “Shared” means web reads or writes the same backend records as Android.

| Area | Android behavior | Web counterpart | Data source |
|---|---|---|---|
| Location | Province, city and area selection | Responsive location selector; persisted per browser | `/api/locations/*` |
| Discovery | Categories, services, events and search | Same category artwork and filters; grid/list views | `/api/categories`, `/api/events*` |
| Details | Listing media, packages, seller and location | Touch/trackpad gallery, thumbnails, packages and provider profile | `/api/events/:id` |
| Identity | Firebase email account plus API profile | Sign-up, sign-in, verification, reset, confirmed email change | Firebase Identity Toolkit, `/api/auth/*`, `/api/users/*` |
| Customer booking | Quote, AbhiPay order and booking history | Production quote/order/status flow and synchronized history | `/api/payments/*`, `/api/bookings/*` |
| Completion/refund | PIN completion, release, review and cancellation | Same guarded booking actions | `/api/bookings/*`, `/api/reviews` |
| Tickets | Purchase, individual QR tickets and status | Ticket checkout, inventory verification and QR ticket display | `/api/ticket-bookings/*`, `/api/payments/ticket/*` |
| Chat | Rooms, messages, media, presence, typing and offers | Cursor-paged rooms/messages, Socket.IO receive updates with polling fallback, text/media/files/voice and custom offers | `/api/chat/*`, `/socket.io/*` |
| Provider mode | Customer/provider profile switch | Persistent switch for approved sellers | `/api/users/:firebaseUid` |
| Provider onboarding | Application, business, bank and verification | Equivalent forms and status views | `/api/sellers-applications/*`, `/api/verification/*`, `/api/users/*` |
| Services | Create, edit, images, packages, activation | Create/edit/pause plus per-service booking ledger | `/api/events/*`, `/api/bookings/event/:id/seller-view` |
| Ticket events | Create, edit, inventory, scanner and sales | Event manager, transactions, stats and QR scanner | `/api/events/*`, `/api/ticket-bookings/*` |
| Analytics | Booking/revenue/status summaries | Live weekly chart, gross/commission/net, booking and review metrics | `/api/bookings/seller/:id/stats`, `/api/reviews/seller/:id/stats` |
| Provider operations | Bookings, refund handling, reviews and payouts | Filtered operational views and protected actions | `/api/bookings/*`, `/api/events/seller/:id/payout-counts` |
| Account/support | Profile, notifications, help, attachments and feedback | Same modules, including support uploads and reports | `/api/notifications/*`, `/api/support-requests/*`, `/api/feedback/*`, `/api/reports` |

## Deliberately not invented

- Voice/video calls: the supplied app presents call affordances but does not include a supported production call service.
- Paid featured-listing checkout: the supplied Android flow is marked unavailable/coming soon.
- Unsupported payment methods: web uses the production AbhiPay order/status contract already used by the backend.
- Administrative controls: web exposes customer/provider capabilities only, not internal admin access.

## Release verification

- Static release contract test covers API routing, category assets, responsive layouts, keyboard-safe chat, chat pagination/status/attachments, gallery, role switching, analytics and email-change wiring.
- Public API reads are checked through the deployed same-origin proxy.
- Mobile verification targets 390 × 844; tablet 768 × 1024; desktop 1440 × 900.
- Transactional writes require an approved production-safe test account and are not fabricated by automated checks.

See [WEBAPP_AUDIT.md](WEBAPP_AUDIT.md) for the evidence reviewed, fixes in the current release and the remaining parity gaps that depend on OAuth, Web Push or approved production test accounts.
