import { splitTextToDeck, parseSlideMarkdown, cleanText } from './parser.js';
import { renderSlideSvg, renderCoverSlide, renderContentSlide, renderOutroSlide, THEMES, AVAILABLE_THEMES, RATIOS } from './renderer.js';
import { generateCarouselPdf, renderSlidePng, exportSlideImages } from './pdf.js';

// --- Library Exports ---

export {
  splitTextToDeck,
  parseSlideMarkdown,
  cleanText,
  renderSlideSvg,
  renderCoverSlide,
  renderContentSlide,
  renderOutroSlide,
  renderSlidePng,
  generateCarouselPdf,
  exportSlideImages,
  THEMES,
  AVAILABLE_THEMES,
  RATIOS
};

// --- High-Level Convenience Runner ---

export async function createCarouselFromText(text, outputPath, options = {}) {
  const slides = splitTextToDeck(text, options);
  if (!slides.length) {
    throw new Error('Could not parse any slides from provided text.');
  }
  return await generateCarouselPdf(slides, outputPath, options);
}
