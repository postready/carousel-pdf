// --- Text Utilities ---

export function cleanText(str) {
  if (!str) return '';
  return str.replace(/\r\n/g, '\n').trim();
}

// --- Markdown Section Parser ---

export function parseSlideMarkdown(section) {
  const lines = section.split('\n').map(l => l.trim()).filter(Boolean);
  if (!lines.length) return null;

  let title = '';
  let type = 'content';
  const bullets = [];
  const paragraphs = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!title && line.startsWith('#')) {
      title = line.replace(/^#{1,6}\s+/, '').trim();
      continue;
    }

    if (!title && i === 0 && !line.startsWith('-') && !line.startsWith('•') && !line.startsWith('*')) {
      title = line;
      continue;
    }

    if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
      bullets.push(line.replace(/^[-*•]\s+/, '').trim());
      continue;
    }

    paragraphs.push(line);
  }

  return {
    type,
    title: title || 'Key Takeaway',
    bullets,
    body: paragraphs.join('\n\n')
  };
}

// --- Raw Article Auto-Splitter ---

export function splitTextToDeck(rawText, options = {}) {
  const {
    brand = 'POSTREADY.ORG',
    author = 'eco-null',
    url = 'postready.org'
  } = options;

  const text = cleanText(rawText);
  if (!text) return [];

  if (text.includes('\n---\n') || text.startsWith('---\n')) {
    const rawSections = text.split(/\n---\n+/).map(s => s.trim()).filter(Boolean);
    const slides = [];

    for (let i = 0; i < rawSections.length; i++) {
      const parsed = parseSlideMarkdown(rawSections[i]);
      if (!parsed) continue;

      if (i === 0) {
        slides.push({
          type: 'cover',
          title: parsed.title,
          subtitle: parsed.body || (parsed.bullets.length ? parsed.bullets[0] : ''),
          badge: brand,
          author,
          url
        });
      } else if (i === rawSections.length - 1 && (parsed.title.toLowerCase().includes('recap') || parsed.title.toLowerCase().includes('summary') || parsed.title.toLowerCase().includes('follow'))) {
        slides.push({
          type: 'outro',
          title: parsed.title,
          subtitle: parsed.body,
          bullets: parsed.bullets,
          cta: 'Swipe right & follow for more.',
          brand,
          author,
          url
        });
      } else {
        slides.push({
          type: 'content',
          title: parsed.title,
          body: parsed.body,
          bullets: parsed.bullets,
          badge: brand,
          author,
          url
        });
      }
    }

    return slides;
  }

  // Auto-split fallback for plain continuous text
  const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  if (!paragraphs.length) return [];

  const slides = [];

  const firstPara = paragraphs[0].replace(/^#{1,6}\s+/, '');
  const secondPara = paragraphs[1] || '';

  slides.push({
    type: 'cover',
    title: firstPara,
    subtitle: secondPara.length < 160 ? secondPara : secondPara.slice(0, 157) + '...',
    badge: brand,
    author,
    url
  });

  const bodyParagraphs = paragraphs.slice(secondPara ? 2 : 1);
  const chunkSize = Math.max(1, Math.min(3, Math.ceil(bodyParagraphs.length / 5)));

  for (let i = 0; i < bodyParagraphs.length; i += chunkSize) {
    const chunk = bodyParagraphs.slice(i, i + chunkSize);
    const slideTitle = chunk[0].startsWith('#')
      ? chunk[0].replace(/^#{1,6}\s+/, '')
      : `Step ${slides.length}: Key Insight`;

    const remainingLines = chunk[0].startsWith('#') ? chunk.slice(1) : chunk;

    slides.push({
      type: 'content',
      title: slideTitle,
      body: remainingLines.join('\n\n'),
      bullets: [],
      badge: brand,
      author,
      url
    });
  }

  slides.push({
    type: 'outro',
    title: 'Actionable Summary',
    subtitle: 'Consistency and clear distribution beat sporadic perfection.',
    bullets: [
      'Repurpose long articles into bite-sized carousels.',
      'Optimize for mobile screen dimensions (4:5 vertical).',
      'Focus on high-contrast, reader-friendly typography.'
    ],
    cta: 'Follow for daily engineering & SaaS breakdowns.',
    brand,
    author,
    url
  });

  return slides;
}
