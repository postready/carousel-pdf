// --- Theme Palettes ---

export const THEMES = {
  dark: {
    bg: '#09090b',
    surface: '#121215',
    surfaceAlt: '#18181b',
    border: '#27272a',
    borderStrong: '#3f3f46',
    textPrimary: '#fafafa',
    textSecondary: '#a1a1aa',
    textMuted: '#71717a',
    accent: '#ffffff',
    accentText: '#09090b',
    dotGrid: 'rgba(255, 255, 255, 0.04)'
  },
  light: {
    bg: '#fafafa',
    surface: '#ffffff',
    surfaceAlt: '#f4f4f5',
    border: '#e4e4e7',
    borderStrong: '#d4d4d8',
    textPrimary: '#09090b',
    textSecondary: '#52525b',
    textMuted: '#a1a1aa',
    accent: '#09090b',
    accentText: '#ffffff',
    dotGrid: 'rgba(0, 0, 0, 0.04)'
  },
  terminal: {
    bg: '#0c0c0c',
    surface: '#141414',
    surfaceAlt: '#181818',
    border: '#1f2d24',
    borderStrong: '#2d4535',
    textPrimary: '#00ff66',
    textSecondary: '#88e0a2',
    textMuted: '#38704a',
    accent: '#00ff66',
    accentText: '#0c0c0c',
    dotGrid: 'rgba(0, 255, 102, 0.04)'
  },
  gold: {
    bg: '#0a0a0c',
    surface: '#121216',
    surfaceAlt: '#18181e',
    border: '#2a2720',
    borderStrong: '#443e2e',
    textPrimary: '#fbf8ee',
    textSecondary: '#d4af37',
    textMuted: '#8a7846',
    accent: '#d4af37',
    accentText: '#0a0a0c',
    dotGrid: 'rgba(212, 175, 55, 0.05)'
  }
};

export const AVAILABLE_THEMES = Object.keys(THEMES);

export const RATIOS = {
  'portrait': { width: 1080, height: 1350 },
  'square': { width: 1080, height: 1080 }
};

// --- Text Utilities ---

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(text, maxCharsPerLine = 28) {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (candidate.length <= maxCharsPerLine) {
      currentLine = candidate;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines;
}

// --- Slide Renderers ---

export function renderCoverSlide(slide, index, total, options = {}) {
  const { theme = 'dark', ratio = 'portrait' } = options;
  const t = THEMES[theme] || THEMES.dark;
  const dim = RATIOS[ratio] || RATIOS.portrait;
  const { width, height } = dim;

  const pad = 96;
  const titleLines = wrapText(slide.title, 20);
  const subtitleLines = wrapText(slide.subtitle, 36);

  const safeBadge = escapeXml(slide.badge || 'POSTREADY.ORG');
  const safeAuthor = escapeXml(slide.author || 'eco-null');
  const safeUrl = escapeXml(slide.url || 'postready.org');

  const titleStartY = 380;
  const titleLineHeight = 78;
  const subtitleStartY = titleStartY + (titleLines.length * titleLineHeight) + 24;
  const subtitleLineHeight = 38;

  let titleSvg = '';
  titleLines.forEach((line, idx) => {
    titleSvg += `<text x="${pad}" y="${titleStartY + (idx * titleLineHeight)}" fill="${t.textPrimary}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="64" font-weight="800" letter-spacing="-0.03em">${escapeXml(line)}</text>\n`;
  });

  let subtitleSvg = '';
  subtitleLines.forEach((line, idx) => {
    subtitleSvg += `<text x="${pad}" y="${subtitleStartY + (idx * subtitleLineHeight)}" fill="${t.textSecondary}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="400" line-height="1.5">${escapeXml(line)}</text>\n`;
  });

  return `
    <!-- Top Header -->
    <g transform="translate(${pad}, 96)">
      <rect width="${safeBadge.length * 8 + 24}" height="32" rx="4" fill="${t.accent}" />
      <text x="12" y="21" fill="${t.accentText}" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" font-size="12" font-weight="700" letter-spacing="0.08em">${safeBadge}</text>
      <text x="${width - (pad * 2)}" y="22" text-anchor="end" fill="${t.textMuted}" font-family="ui-monospace, SFMono-Regular, monospace" font-size="14">${safeUrl}</text>
    </g>

    <!-- Hero Content -->
    ${titleSvg}
    ${subtitleSvg}

    <!-- Bottom Footer -->
    <g transform="translate(${pad}, ${height - 96})">
      <circle cx="16" cy="0" r="16" fill="${t.surfaceAlt}" stroke="${t.border}" stroke-width="1" />
      <text x="16" y="5" text-anchor="middle" fill="${t.textPrimary}" font-family="ui-monospace, monospace" font-size="12" font-weight="700">${safeAuthor.charAt(0).toUpperCase()}</text>
      <text x="44" y="5" fill="${t.textPrimary}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600">${safeAuthor}</text>

      <g transform="translate(${width - (pad * 2)}, 0)">
        <text x="0" y="5" text-anchor="end" fill="${t.textMuted}" font-family="ui-monospace, monospace" font-size="14" font-weight="600">SWIPE &#8594;</text>
      </g>
    </g>
  `;
}

export function renderContentSlide(slide, index, total, options = {}) {
  const { theme = 'dark', ratio = 'portrait' } = options;
  const t = THEMES[theme] || THEMES.dark;
  const dim = RATIOS[ratio] || RATIOS.portrait;
  const { width, height } = dim;

  const pad = 96;
  const counterText = `${String(index).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  const titleLines = wrapText(slide.title, 24);

  const safeBadge = escapeXml(slide.badge || 'POSTREADY.ORG');
  const safeUrl = escapeXml(slide.url || 'postready.org');

  let titleSvg = '';
  const titleStartY = 240;
  const titleLineHeight = 58;
  titleLines.forEach((line, idx) => {
    titleSvg += `<text x="${pad}" y="${titleStartY + (idx * titleLineHeight)}" fill="${t.textPrimary}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="46" font-weight="700" letter-spacing="-0.02em">${escapeXml(line)}</text>\n`;
  });

  const bodyStartY = titleStartY + (titleLines.length * titleLineHeight) + 36;
  let bodySvg = '';

  if (slide.bullets && slide.bullets.length > 0) {
    let curY = bodyStartY;
    slide.bullets.slice(0, 5).forEach((bullet, bIdx) => {
      const bulletLines = wrapText(bullet, 38);
      bodySvg += `
        <g transform="translate(${pad}, ${curY})">
          <circle cx="10" cy="10" r="4" fill="${t.accent}" />
          ${bulletLines.map((bl, blIdx) => `<text x="28" y="${16 + (blIdx * 30)}" fill="${t.textSecondary}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="400">${escapeXml(bl)}</text>`).join('\n')}
        </g>
      `;
      curY += (bulletLines.length * 30) + 24;
    });
  } else if (slide.body) {
    const paragraphs = slide.body.split('\n\n').filter(Boolean);
    let curY = bodyStartY;

    paragraphs.slice(0, 3).forEach((pText) => {
      const pLines = wrapText(pText, 36);
      const boxHeight = (pLines.length * 32) + 36;

      bodySvg += `
        <g transform="translate(${pad}, ${curY})">
          <rect width="${width - (pad * 2)}" height="${boxHeight}" rx="6" fill="${t.surface}" stroke="${t.border}" stroke-width="1" />
          ${pLines.map((pl, plIdx) => `<text x="24" y="${32 + (plIdx * 32)}" fill="${t.textPrimary}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="21" font-weight="400">${escapeXml(pl)}</text>`).join('\n')}
        </g>
      `;
      curY += boxHeight + 20;
    });
  }

  return `
    <!-- Top Meta -->
    <g transform="translate(${pad}, 96)">
      <text x="0" y="20" fill="${t.textMuted}" font-family="ui-monospace, monospace" font-size="13" font-weight="700" letter-spacing="0.08em">${safeBadge}</text>
      <rect x="${width - (pad * 2) - 86}" y="0" width="86" height="28" rx="4" fill="${t.surfaceAlt}" stroke="${t.border}" stroke-width="1" />
      <text x="${width - (pad * 2) - 43}" y="19" text-anchor="middle" fill="${t.textPrimary}" font-family="ui-monospace, monospace" font-size="12" font-weight="700">${counterText}</text>
    </g>

    <!-- Content -->
    ${titleSvg}
    ${bodySvg}

    <!-- Bottom Footer -->
    <g transform="translate(${pad}, ${height - 96})">
      <text x="0" y="0" fill="${t.textMuted}" font-family="ui-monospace, monospace" font-size="13">${safeUrl}</text>
    </g>
  `;
}

export function renderOutroSlide(slide, index, total, options = {}) {
  const { theme = 'dark', ratio = 'portrait' } = options;
  const t = THEMES[theme] || THEMES.dark;
  const dim = RATIOS[ratio] || RATIOS.portrait;
  const { width, height } = dim;

  const pad = 96;
  const safeBadge = escapeXml(slide.badge || 'POSTREADY.ORG');
  const safeAuthor = escapeXml(slide.author || 'eco-null');
  const safeUrl = escapeXml(slide.url || 'postready.org');
  const safeCta = escapeXml(slide.cta || 'Follow for daily tech breakdowns.');

  const titleLines = wrapText(slide.title || 'Summary & Next Steps', 22);

  let titleSvg = '';
  const titleStartY = 260;
  const titleLineHeight = 58;
  titleLines.forEach((line, idx) => {
    titleSvg += `<text x="${pad}" y="${titleStartY + (idx * titleLineHeight)}" fill="${t.textPrimary}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="48" font-weight="700" letter-spacing="-0.02em">${escapeXml(line)}</text>\n`;
  });

  const takeaways = slide.bullets && slide.bullets.length > 0
    ? slide.bullets.slice(0, 3)
    : [
      'Repurpose technical long-form content into mobile-friendly carousels.',
      'Maintain visual hierarchy and high readability across feeds.',
      'Ship consistently to establish compound technical authority.'
    ];

  let takeawaysSvg = '';
  let curY = titleStartY + (titleLines.length * titleLineHeight) + 32;

  takeaways.forEach((item, i) => {
    const lines = wrapText(item, 34);
    const boxHeight = (lines.length * 28) + 28;
    takeawaysSvg += `
      <g transform="translate(${pad}, ${curY})">
        <rect width="${width - (pad * 2)}" height="${boxHeight}" rx="6" fill="${t.surface}" stroke="${t.border}" stroke-width="1" />
        <text x="20" y="28" fill="${t.accent}" font-family="ui-monospace, monospace" font-size="14" font-weight="700">${i + 1}.</text>
        ${lines.map((l, lIdx) => `<text x="48" y="${28 + (lIdx * 28)}" fill="${t.textSecondary}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400">${escapeXml(l)}</text>`).join('\n')}
      </g>
    `;
    curY += boxHeight + 14;
  });

  const ctaBoxY = curY + 24;

  return `
    <!-- Top Header -->
    <g transform="translate(${pad}, 96)">
      <rect width="${safeBadge.length * 8 + 24}" height="28" rx="4" fill="${t.accent}" />
      <text x="12" y="19" fill="${t.accentText}" font-family="ui-monospace, SFMono-Regular, monospace" font-size="11" font-weight="700" letter-spacing="0.08em">${safeBadge}</text>
    </g>

    ${titleSvg}
    ${takeawaysSvg}

    <!-- Call to Action Card -->
    <g transform="translate(${pad}, ${ctaBoxY})">
      <rect width="${width - (pad * 2)}" height="130" rx="8" fill="${t.surfaceAlt}" stroke="${t.borderStrong}" stroke-width="1.5" />
      <text x="${(width - (pad * 2)) / 2}" y="52" text-anchor="middle" fill="${t.textPrimary}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="700">${safeCta}</text>
      <text x="${(width - (pad * 2)) / 2}" y="88" text-anchor="middle" fill="${t.textMuted}" font-family="ui-monospace, monospace" font-size="14">Built with ${safeUrl} by ${safeAuthor}</text>
    </g>

    <!-- Bottom Footer -->
    <g transform="translate(${pad}, ${height - 96})">
      <text x="0" y="0" fill="${t.textMuted}" font-family="ui-monospace, monospace" font-size="13">${safeUrl}</text>
    </g>
  `;
}

export function renderSlideSvg(slide, index, total, options = {}) {
  const { theme = 'dark', ratio = 'portrait', showGrid = true } = options;
  const t = THEMES[theme] || THEMES.dark;
  const dim = RATIOS[ratio] || RATIOS.portrait;
  const { width, height } = dim;

  let slideInner = '';
  if (slide.type === 'cover' || index === 1) {
    slideInner = renderCoverSlide(slide, index, total, options);
  } else if (slide.type === 'outro' || index === total) {
    slideInner = renderOutroSlide(slide, index, total, options);
  } else {
    slideInner = renderContentSlide(slide, index, total, options);
  }

  const gridPattern = showGrid ? `
    <defs>
      <pattern id="dot-grid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.5" fill="${t.dotGrid}" />
      </pattern>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#dot-grid)" />
  ` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background Layer -->
  <rect width="${width}" height="${height}" fill="${t.bg}" />
  ${gridPattern}

  <!-- Structural Frame Border -->
  <rect x="36" y="36" width="${width - 72}" height="${height - 72}" rx="10" fill="none" stroke="${t.border}" stroke-width="1.5" />

  ${slideInner}
</svg>`.trim();
}
