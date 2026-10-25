# PostReady Web Integration Guide: Text-to-Carousel PDF Generator

This guide explains how to integrate `carousel-pdf-cli` into the [PostReady.org](https://postready.org) Next.js web application as a standalone free tool at `/tools/carousel-generator`.

---

## 1. Architectural Strategy: The Hybrid Engine

To deliver instant UX with zero recurring compute cost, we split the tool into two layers:

1. **Deterministic Core (Free, Unlimited, 0ms latency):**
   - Pure client-side or edge SVG rendering.
   - Users type or paste text and see live slide cards update in real time.
   - Generates multi-page PDF documents on demand via a lightweight Next.js API Route.
2. **Optional AI Layer (PostReady Credit Integration):**
   - A single button: *"Auto-Summarize & Format with AI"*.
   - Sends unformatted raw text to PostReady's LLM engine.
   - Returns structured `SlideData[]` JSON and deducts 1 credit.

---

## 2. Directory Structure in PostReady

Place the files in your Next.js project:

```text
postready/
├── src/
│   ├── app/[locale]/tools/carousel-generator/
│   │   ├── page.tsx               # Web Tool Landing Page & SEO
│   │   └── client.tsx             # Interactive Slide Editor & Live Canvas
│   ├── app/api/tools/carousel/
│   │   ├── pdf/route.ts           # Serverless PDF generation endpoint
│   │   └── ai-summarize/route.ts  # Optional AI credit endpoint
│   ├── components/tools/carousel/
│   │   ├── CarouselPreview.tsx    # Real-time SVG slide viewer
│   │   ├── SlideEditor.tsx        # Editable slide accordion
│   │   └── ThemeSelector.tsx      # Palette & Aspect Ratio toggles
│   └── lib/carousel/
│       ├── renderer.ts            # SVG slide builders (from src/renderer.js)
│       └── parser.ts              # Text auto-splitter (from src/parser.js)
```

---

## 3. Step-by-Step Implementation

### Step 3.1: Install Dependencies in Web Project

```bash
npm install carousel-pdf-cli pdfkit @resvg/resvg-js
```

---

### Step 3.2: Next.js API Route (`app/api/tools/carousel/pdf/route.ts`)

Create a route handler that compiles the multi-page PDF from slide JSON:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { generateCarouselPdf } from 'carousel-pdf-cli';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slides, theme = 'dark', ratio = 'portrait' } = body;

    if (!slides || !slides.length) {
      return NextResponse.json({ error: 'No slides provided' }, { status: 400 });
    }

    const tmpPdfPath = path.join(os.tmpdir(), `carousel-${Date.now()}.pdf`);
    await generateCarouselPdf(slides, tmpPdfPath, { theme, ratio });

    const pdfBuffer = fs.readFileSync(tmpPdfPath);
    fs.unlinkSync(tmpPdfPath);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="postready-carousel.pdf"'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

### Step 3.3: Client-Side Interactive Viewer (`components/tools/carousel/CarouselPreview.tsx`)

Render the active slide as pure inline SVG so the user sees instant live edits without network calls:

```tsx
'use client';

import React from 'react';
import { renderSlideSvg, SlideData, CarouselOptions } from 'carousel-pdf-cli';

interface Props {
  slides: SlideData[];
  currentIndex: number;
  options: CarouselOptions;
}

export function CarouselPreview({ slides, currentIndex, options }: Props) {
  if (!slides.length) return null;

  const currentSlide = slides[currentIndex] || slides[0];
  const svgMarkup = renderSlideSvg(currentSlide, currentIndex + 1, slides.length, options);

  return (
    <div className="relative aspect-[4/5] w-full max-w-[420px] rounded-lg border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden">
      <div
        className="w-full h-full [&>svg]:w-full [&>svg]:h-full"
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
      />
    </div>
  );
}
```

---

### Step 3.4: Optional AI Repurposing Endpoint

When the user clicks *"Transform with AI"*:

```typescript
// Prompt template to generate carousel-friendly JSON:
const systemPrompt = `
You are an expert LinkedIn ghostwriter. Turn the user's article into a 5-7 slide carousel deck.
Output strictly JSON matching this schema:
{
  "slides": [
    { "type": "cover", "title": "Strong Hook", "subtitle": "Curiosity gap context" },
    { "type": "content", "title": "Key Insight 1", "bullets": ["Actionable point A", "Point B"] },
    ...
    { "type": "outro", "title": "Summary", "bullets": ["Takeaway 1", "Takeaway 2"], "cta": "Follow for more." }
  ]
}
`;
```

---

## 4. SEO & Schema.org Integration

Add this metadata to `app/[locale]/tools/carousel-generator/page.tsx`:

- **Title:** `Free LinkedIn Carousel PDF Generator | PostReady`
- **Description:** `Turn articles, blog posts, and notes into high-converting LinkedIn PDF carousels in seconds. Multi-slide layouts, mobile-optimized 4:5 ratios, and 100% free export.`
- **Schema:** `WebApplication` with `browserRequirements: "Requires JavaScript"` and `applicationCategory: "DesignApplication"`.
- Add URL to `sitemap.xml`: `https://www.postready.org/en/tools/carousel-generator`.

---

## 5. Value Proposition

- **Lead Magnet:** PDF carousels get 3x higher click-through rates on LinkedIn than standard text.
- **Organic Traffic:** Attracts founders, indie hackers, and creators who need clean slide decks without Canva subscriptions.
- **Conversion Funnel:** Free users generate manual carousels; power users upgrade to PostReady Pro for 1-click AI summarization.
