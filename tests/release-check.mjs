import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const [app, css, html, vercel] = await Promise.all([
  readFile(new URL('../dist/client/assets/planifya-app.js', import.meta.url), 'utf8'),
  readFile(new URL('../dist/client/assets/planifya-app.css', import.meta.url), 'utf8'),
  readFile(new URL('../dist/client/index.html', import.meta.url), 'utf8'),
  readFile(new URL('../vercel.json', import.meta.url), 'utf8').then(JSON.parse),
]);

const requirements = [
  ['production API routes remain relative', /api\('\/api\//],
  ['Android category assets are mapped', /CATEGORY_ICONS=/],
  ['provider/customer role switching exists', /function setRole/],
  ['grid/list/thumbnail listing modes exist', /setListingView/],
  ['swipeable listing gallery exists', /galleryScrolled/],
  ['provider booking analytics exists', /weeklyCounts/],
  ['per-service bookings exist', /serviceBookings/],
  ['chat images can be previewed', /viewChatImage/],
  ['chat documents use backend file type', /messageType:isImage\?'image':isAudio\?'voice':'file'/],
  ['chat attachment metadata matches backend', /fileName:data\.fileName\|\|file\.name[\s\S]*fileSize:Number\(data\.fileSize\|\|file\.size\)/],
  ['email change flow exists', /submitEmailChange/],
  ['Firebase method colons are not URL encoded', /fetchJson\(`\/__firebase\/\$\{action\}`/],
];

for (const [label, pattern] of requirements) {
  assert.match(app, pattern, label);
}

await Promise.all([
  'event_planner.png', 'catering.png', 'venues.png', 'photography.png',
  'sound-and-lightening.png', 'decoration.png', 'canopy-tent.png',
  'design-printing.png', 'makeup-artist.png',
].map((name) => access(new URL(`../dist/client/assets/planifya/categories/${name}`, import.meta.url))));

assert.match(css, /listing-results\.view-thumbnail/, 'thumbnail listing CSS');
assert.match(css, /detail-gallery/, 'responsive gallery CSS');
assert.match(css, /analytics-hero/, 'provider analytics CSS');
assert.match(css, /@media\s*\(max-width:\s*680px\)/, 'mobile breakpoint');
assert.match(html, /planifya-app\.css\?v=13/, 'release CSS cache version');
assert.match(html, /planifya-app\.js\?v=13/, 'release JS cache version');

assert.equal(vercel.outputDirectory, 'dist/client');
assert.ok(vercel.rewrites.some((rule) => rule.source === '/api/:path*' && rule.destination.startsWith('https://api.planifya.pk/api/')),
  'Vercel must proxy the production API on the same origin');
assert.ok(vercel.rewrites.some((rule) => rule.source === '/__firebase/token'),
  'Vercel must proxy Firebase token refreshes');

console.log(`Planifya release checks passed (${requirements.length + 8} assertions).`);
