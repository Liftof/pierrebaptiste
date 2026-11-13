# Link previews

The homepage, About, Projects, and Writing index share `assets/link-previews.js`
and `assets/link-previews.css`. Destination matching ignores query strings and
trailing slashes. Existing links and navigation keep their native behaviour.

The cards use real desktop captures for ten websites, the original Modular
Systems album cover, and original SVG compositions for the seven essays,
LittleTodo, reddit-scout, FakeMRR, navigation, and contact links. Election Lab
uses the capture of Labo Paris, the application from which its public template
was extracted. Capture provenance is in `sources.json`; no expiring capture
URLs or third-party embeds are shipped. FakeMRR's domain was unavailable to
the capture service, so its artwork is an illustration rather than a screenshot.

Images load on intent, after a short hover delay or keyboard focus. A failed
image falls back to the local projects illustration. Each card has its own
entrance transform and a complementary paper colour. The album cover stays
square and uncropped. Escape dismisses the card without changing focus. Cards
remain available when hovered, close on pointer scrolling or disclosure changes,
and stay within the viewport. Touch scrolling and one-tap navigation are native.
CSS and every animated SVG honour `prefers-reduced-motion`.

To check the feature, serve the repository with `python3 -m http.server 4175`
and open `/scripts/check-link-previews.html`. The browser checks all 33 homepage
links, lazy loading, fast switching, keyboard dismissal, a 390px viewport,
hover intent, re-entry, hoverable cards, scrolling, and touch behaviour. Desktop
and touch checks were run in Chrome. `node scripts/build-preview.cjs` also
verifies that the buildless preview packages the new assets.
