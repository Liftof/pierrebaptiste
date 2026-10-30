# Cobalt garden preview

Visual adaptation of https://www.ryanbrewer.me/ for https://pierrebaptiste.me/.

The source content is the personal site's main branch at `323e0720e5dabe88d99f19b351ec7fffca639afb`. All 25 distinct existing link destinations are preserved. Projects (9) and writing (7) use native keyboard-accessible HTML details elements. The landing page uses an original cobalt canvas texture defined in CSS, Inter, and an original painted flower bed. Analytics loads only on the production domain; it does not record local or Vercel preview traffic.

`garden.webp` is an original image generated with the built-in Imagegen tool on 2026-10-30, optimized to WebP with alpha retained. No reference-site artwork is copied or hotlinked.

Generation prompt:

> Use case: stylized-concept. Asset type: original decorative website footer illustration with genuine transparent background, very wide horizontal panoramic banner (approximately 3:1 aspect ratio). Paint an elegant small garden of individual flowers sprouting from a thin strip of rich dark brown earth along the entire bottom edge: white daisies with buttery yellow centers, delicate orange-red poppies, blue cornflowers, a few lavender stalks and yellow buttercups, varied heights and organic green stems. Hand-painted oil on rough linen canvas, tactile thick impasto brush strokes and visible canvas, sophisticated naive botanical painting, warm sunny restrained color, delightful personal handmade quality. Composition: straight-on eye-level view of the flowers, flowers loosely spaced with generous transparent spaces between the stems, tallest flowers about 2/3 image height, earth only lowest 10%, no backdrop at all. Extend earth to both horizontal edges, keep flower heads completely inside the frame and uncut. This will be laid over a bright cobalt blue website background, so do not include any blue background or sky. Do not include words, letters, logos, watermark, frame, buildings, pots, people. True alpha transparency around flowers and above soil. This must be an original illustration.

The root `vercel.json` declares a buildless static preview; the production website is served by GitHub Pages. No merge or production deployment is part of this branch.

## Animated sharing card

`share-card.mp4`: 1200 × 630, 8 seconds, 30 fps, H.264 Main / yuv420p, silent, fast-start MP4. `share-card.jpg` is the matching static fallback. Flowers move with a periodic height-dependent displacement field; the soil and roots stay fixed. The loop closes exactly, and the original illustration is retained. The homepage itself keeps its approved static garden.

Preview the card at `/share.html`. `og:video` targets the direct MP4 and `og:image` / `twitter:image` target the JPEG. Actual inline playback is decided by each app; it is supported by Apple's Messages rich links (https://developer.apple.com/videos/play/tech-talks/205/), but is not promised on every social network. The authenticated Vercel preview cannot be scraped by unauthenticated social crawlers. Production URLs are committed; the static Vercel build rewrites absolute metadata URLs to that deployment's `VERCEL_URL`, before serving HTML. No client-side metadata injection is used.

To regenerate: `cd scripts/share-card && npm install && npm run render`. The renderer uses only the existing artwork, Canvas and FFmpeg. No new model generation is needed.
