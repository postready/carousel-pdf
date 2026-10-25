# carousel-pdf-cli

> Deterministic text-to-carousel PDF generator for LinkedIn and X. Converts markdown, notes, and articles into high-resolution multi-page slide decks. Zero browser overhead.

[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg)](https://opensource.org/licenses/MIT)
[![Node.js: >=18.0.0](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-black.svg)](https://nodejs.org)
[![Engine: Resvg Rust + PDFKit](https://img.shields.io/badge/Engine-Resvg%20%2B%20PDFKit-black.svg)](src/pdf.js)
[![Powered by PostReady](https://img.shields.io/badge/Powered%20by-PostReady.org-black.svg)](https://postready.org)

`carousel-pdf-cli` transforms plain markdown, notes, or blog summaries into publication-ready, multi-page PDF documents formatted specifically for LinkedIn document carousels.

It features a 100% deterministic, script-based rendering pipeline with zero headless browser requirements, compiling vector SVG layouts into high-DPI PDFs in milliseconds.

Part of the **[PostReady.org](https://postready.org)** open-source content repurposing toolkit.

---

## Highlights

- **Standard LinkedIn 4:5 Aspect Ratio:** Optimized for the 1080x1350 vertical portrait dimension that dominates mobile feeds (also supports 1080x1080 square).
- **Zero Browser Overhead:** Renders complete 5–10 page carousel decks in under 2 seconds using native Rust `@resvg/resvg-js` and `PDFKit`.
- **Intelligent Deck Auto-Splitter:** Accepts raw unformatted articles and automatically produces cohesive Cover, Content, and Outro slides.
- **Developer Palettes:** Four minimalist themes (`dark`, `light`, `terminal`, `gold`) designed to match high-authority technical personal brands.
- **Web App Ready:** Shared pure SVG rendering architecture allows instant client-side preview in React/Next.js before triggering server-side PDF export.

---

## Quick Start (CLI)

Generate a carousel PDF directly with `npx`:

```bash
# Compile a markdown file into a dark-themed carousel PDF
npx carousel-pdf-cli article.md -t dark -o linkedin-carousel.pdf

# Target square ratio (1080x1080) with terminal theme
npx carousel-pdf-cli notes.txt --ratio square -t terminal

# Pipe text directly from terminal and export individual PNG slides too
cat blog.md | npx carousel-pdf-cli -t gold --images ./slides
```

Install globally:

```bash
npm install -g carousel-pdf-cli
```

---

## Input Formats

### 1. Structured Markdown (Recommended)

Separate slides with `---` on its own line. Headings (`#`) automatically become slide titles, while bullet points (`-`) render as structured cards:

```markdown
# How We Built an AI Content Studio
Lessons learned from shipping 4 developer tools in 24 hours.
---
# 1. Deterministic Over Non-Deterministic
- Core rendering should run on deterministic scripts.
- Eliminates recurring API fees and model hallucinations.
- Guarantees 10ms execution times.
---
# 2. Strict Input Validation
- Validate all subprocess and shell arguments.
- Never trust client parameters directly.
- Defense in depth at the boundary.
---
# Actionable Summary
Explore PostReady at postready.org today.
```

### 2. Raw Plain Text

Paste an unformatted blog post or notes document. The built-in parser will automatically extract the title, group body paragraphs into clean sequential slides, and generate an outro call-to-action slide.

---

## Programmatic API

Install locally:

```bash
npm install carousel-pdf-cli
```

### Usage in Node.js / TypeScript:

```javascript
import {
  splitTextToDeck,
  generateCarouselPdf,
  renderSlideSvg
} from 'carousel-pdf-cli';

// 1. Parse text into structured slide data
const slides = splitTextToDeck(rawArticleText, {
  brand: 'POSTREADY.ORG',
  author: 'eco-null',
  url: 'postready.org'
});

// 2. Generate multi-page PDF document
await generateCarouselPdf(slides, './output/carousel.pdf', {
  theme: 'dark',
  ratio: 'portrait'
});

// 3. Render raw SVG for real-time browser preview
const svgPreview = renderSlideSvg(slides[0], 1, slides.length, {
  theme: 'dark'
});
```

---

## Web Integration Guide

Looking to integrate this tool into your SaaS or Next.js website?
Read the comprehensive step-by-step documentation in **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** for React components, serverless API routes, and connecting to AI credit engines.

---

## About PostReady

This tool was created by **[PostReady.org](https://postready.org)** — the AI content repurposing studio that turns blog articles, podcasts, and notes into publish-ready X threads, LinkedIn posts, and newsletter drafts.

Explore other tools in the suite:
- [social-preview-cli](https://github.com/postready/social-preview-cli) — Fast Rust-backed social card generator.
- [md-to-thread](https://github.com/postready/md-to-thread) — Split markdown files into X threads and carousels.
- [awesome-tech-hooks](https://github.com/postready/awesome-tech-hooks) — 500+ curated viral hooks and opening lines.
- [git-recap](https://github.com/postready/git-recap) — Turn git commits into user-facing release notes.
- [clean-repo](https://github.com/postready/clean-repo) — Fast repository hygiene auditor and secret sentinel.

---

## License

MIT © [eco-null](https://github.com/eco-null)
