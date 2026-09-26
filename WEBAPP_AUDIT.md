# Planifya web completion audit

Audit date: 26 September 2026

## Evidence reviewed

- Supplied Flutter app under `source/Planifya-main/planifaya_app`, including booking models, chat provider/service, Socket.IO events, seller screens, payment flows, ticketing, verification, account and support modules.
- Current web client and Vercel proxy configuration in this repository.
- The current Google Play listing for `com.planifya.app`, updated 12 August 2026. Its public product scope is discovery, provider profiles/reviews, chat, bookings, event ticket creation/management and sales tracking.
- Production Vercel runtime logs for the previous deployment: no server-side warnings or errors were present in the inspected 24-hour window.
- Static release checks, JavaScript syntax validation, handler/export matching and responsive CSS inspection.

## Fixed in this release

| Area | Finding | Resolution |
|---|---|---|
| Mobile chat | The 360px minimum chat height could extend the composer below the keyboard. | An open room is now a full-screen mobile view sized from `visualViewport`, with zero-min-height flex children and safe-area padding. |
| Chat sending | Rapid taps could submit the same text more than once and the input could lose focus. | Sends are guarded, the send button is disabled in flight, failed text is restored and the input is refocused. |
| Chat access | Web did not check the Android room-access/suspension contract. | Web now checks `/api/chat/rooms/:roomId/status` and blocks the composer for inaccessible rooms. |
| Chat history | Web only showed the newest 50 messages. | Cursor-based “Load earlier messages” now follows the Android `before`/`beforeId` contract. |
| Conversation history | Web only showed the newest 50 rooms. | Conversation list pagination now follows the backend `nextBefore`/`nextBeforeId` cursor. |
| Real-time chat | Web depended entirely on a five-second poll. | Socket.IO receive updates, presence and typing are enabled through the existing production proxy. Authenticated REST remains the send path; polling remains the fallback. |
| Chat media | Only the first attachment was rendered and older image messages could appear as a URL. | All stored attachments render; Android-era image-in-content messages render as images; image thumbnails, audio and document metadata are supported. |
| Upload context | Web upload requests did not include the room id used by Android. | Image, voice and file uploads now include `roomId` and normalize both current and legacy response field names. |
| Provider booking image | Web ignored the booking fields used by Android and displayed the generic event image. | Booking rows now prefer `eventImageUrl`, then `eventId.images[0]`, with service/listing fallbacks and a branded final placeholder. |
| General responsive behavior | Long chat headings, narrow controls and nested scrolling could force overflow. | Header text now truncates safely, messages/composer use bounded flex sizing, and room scrolling is isolated from the page. |
| Ratings and reviews | Review submission used a basic select, did not check duplicate-review status, and listing reviews were not browsable. | Booking eligibility now checks `/api/reviews/booking/:bookingId/check`; the Android-style star dialog submits to the existing backend; listing reviews support rating filters, pagination, statistics and provider responses. |
| Profile thumbnails | Web recognized only `profilePicture` and `avatar`, and a failed URL left a broken image. | The shared avatar renderer now supports all profile fields used by Android/backend responses and swaps failed images to initials without disturbing layout. |
| Notifications | Inbox requests were not audience scoped, used generic icons, and taps only marked items read. | Buyer/provider audience, Android tab groups, per-type icons/colors, responsive cards, mark-all scoping and payload-aware routing are implemented. |
| Category sizing | The fixed horizontal strip left unused desktop space and rendered the Android assets too small. | Categories now fill a responsive grid; icon cells remain aligned even when labels wrap to two lines, and the supplied category art is rendered larger. |
| Listing media | The listing gallery could swipe but its images did not open. | Every main image opens a responsive full-screen lightbox with next/previous controls and thumbnail navigation. |
| Quotations | Request cards were plain messages; offer state omitted `isBooked` and expiry; checkout skipped the authoritative quote endpoint. | Request and quotation cards now mirror the Android UI, seller responses preserve buyer context, expiry/booked states are enforced, and acceptance fetches the server-bound quote before order creation. |

## Current functional coverage

The web client has working routes and shared API integration for location selection, category/service/event discovery, grid/list views, listing galleries and packages, favourites, email authentication, profiles, service bookings, cancellation/refund/completion/review actions, ticket purchasing and QR tickets, provider switching/onboarding/verification, service and event management, event sales and scanning, provider bookings/refunds/payouts/reviews/analytics, chat/attachments/quotations, notifications inbox, support, feedback and reporting.

All web API calls remain relative and are proxied to `https://api.planifya.pk`; this release does not modify the production API, data, DNS or payment configuration.

## Remaining parity work

These are evidence-backed gaps, not speculative features.

| Priority | Gap | Impact / dependency |
|---|---|---|
| P1 | Google and Apple sign-in are present in Android but not in the web sign-in modal. | Federated-only accounts cannot authenticate on web. Completing this requires approved web OAuth client IDs, redirect domains and Firebase provider configuration; those external settings were not changed. |
| P1 | Authenticated destructive/financial production E2E remains unexecuted. | Text/media/quotation round trips, real paid checkout, refund, payout and account deletion require approved buyer/provider test accounts and safe test transactions. Static contracts and read-only runtime checks cannot prove those writes. |
| P2 | Background browser push is not registered. | The inbox and in-app Socket.IO events work while the site is open, but closed-tab OS notifications require a Firebase Web Push service worker, VAPID configuration and backend web-token registration. |
| P3 | Device preference parity is partial. | Android has a device-local notification toggle and an English-only language selector. Web relies on browser permissions/settings and has no separate settings screen. |

## Browser-dependent fallbacks

- QR camera scanning uses `BarcodeDetector`; unsupported browsers retain manual ticket/QR entry.
- Voice recording uses supported `MediaRecorder` audio types; unsupported browsers retain audio-file attachment.
- Socket.IO failure falls back to five-second authenticated polling.

## Release confidence

- JavaScript syntax check: passed.
- Automated release contract: passed (42 assertions at the time this audit was written).
- Inline handler/export comparison: no missing exported handlers.
- Production backend/server logs: no errors in the inspected pre-release window.
- Final deployment still requires mobile visual verification and post-deploy runtime-log review.
