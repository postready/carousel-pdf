import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  splitTextToDeck,
  renderSlideSvg,
  renderSlidePng,
  generateCarouselPdf,
  exportSlideImages,
  THEMES,
  RATIOS
} from '../src/index.js';

test('constants export expected theme and ratio keys', () => {
  assert.ok(THEMES.dark);
  assert.ok(THEMES.light);
  assert.ok(THEMES.terminal);
  assert.ok(THEMES.gold);
  assert.ok(RATIOS.portrait);
  assert.ok(RATIOS.square);
});

test('splitTextToDeck parses markdown sections separated by triple dashes', () => {
  const md = `
# Scaling AI Pipelines in 2026
Lessons learned from serving 10M inferences.
---
# Step 1: Model Distillation
- Smaller models run 10x faster.
- Latency drops under 50ms.
- 95% cost reduction.
---
# Summary & Key Takeaways
Follow for daily engineering breakdowns.
`;

  const deck = splitTextToDeck(md);
  assert.equal(deck.length, 3);
  assert.equal(deck[0].type, 'cover');
  assert.equal(deck[0].title, 'Scaling AI Pipelines in 2026');
  assert.equal(deck[1].type, 'content');
  assert.equal(deck[1].bullets.length, 3);
  assert.equal(deck[2].type, 'outro');
});

test('renderSlideSvg outputs clean valid SVG string', () => {
  const slide = {
    type: 'cover',
    title: 'High-Impact Carousel',
    subtitle: 'Built for LinkedIn document distribution',
    badge: 'POSTREADY.ORG',
    author: 'eco-null',
    url: 'postready.org'
  };

  const svg = renderSlideSvg(slide, 1, 5, { theme: 'dark', ratio: 'portrait' });
  assert.ok(svg.startsWith('<?xml version="1.0"'));
  assert.ok(svg.includes('<svg'));
  assert.ok(svg.includes('High-Impact Carousel'));
  assert.ok(svg.includes('POSTREADY.ORG'));
  assert.ok(svg.includes('1080'));
  assert.ok(svg.includes('1350'));
});

test('renderSlidePng outputs valid PNG buffer', () => {
  const slide = {
    type: 'content',
    title: 'Key Takeaways',
    bullets: ['Point one', 'Point two']
  };

  const png = renderSlidePng(slide, 2, 5, { theme: 'terminal', ratio: 'portrait' });
  assert.ok(png instanceof Uint8Array);
  assert.ok(png.length > 5000);
  assert.equal(png[0], 0x89);
  assert.equal(png[1], 0x50);
});

test('generateCarouselPdf builds multi-page PDF document', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'carousel-pdf-test-'));
  const pdfPath = path.join(tmpDir, 'test-output.pdf');

  try {
    const slides = [
      { type: 'cover', title: 'Slide 1 Cover' },
      { type: 'content', title: 'Slide 2 Content', bullets: ['A', 'B'] },
      { type: 'outro', title: 'Slide 3 Outro' }
    ];

    const result = await generateCarouselPdf(slides, pdfPath, { theme: 'gold' });
    assert.equal(result.totalPages, 3);
    assert.ok(result.fileSize > 15000, `Expected PDF file size > 15000, got ${result.fileSize}`);
    assert.ok(fs.existsSync(pdfPath));
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('exportSlideImages generates individual slide PNG files', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'carousel-img-test-'));

  try {
    const slides = [
      { type: 'cover', title: 'Cover Slide' },
      { type: 'content', title: 'Content Slide' }
    ];

    const images = exportSlideImages(slides, tmpDir);
    assert.equal(images.length, 2);
    assert.ok(fs.existsSync(images[0]));
    assert.ok(fs.existsSync(images[1]));
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
