# Locally hosted writing

Seven articles linked in the personal homepage's Writing section, imported from the author's public full-content RSS feed on 2026-10-31: https://medium.com/feed/@pierrebaptiste-borges

All editorial text, inline emphasis, titles, dates, outbound links, 16 illustrations, original alt attributes and figure captions are retained. Images are downloaded and served locally as WebP with unchanged aspect ratio. RSS tracking pixels and Medium syndication promos are excluded. A title duplicated at the beginning of older RSS bodies is promoted to the article's H1. Section headings use a semantic H2.

`manifest.json` records the source URL, source author, publication date, per-article word count, local assets, exact source captions and successful text comparison for every article. The local import compares normalized editorial text before and after conversion, along with the image and caption counts. No article is summarized or rewritten.

Each page is plain static HTML with shared `assets/reader.css`. The sidebar's return link opens the homepage's Writing section. Article pages provide a local canonical URL, article metadata, Article structured data, responsive image dimensions and the original publication link.

The production site remains on GitHub Pages. The Vercel build copies static articles/assets into dist and rewrites absolute metadata URLs for the protected preview only.
