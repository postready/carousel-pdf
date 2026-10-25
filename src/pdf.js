import fs from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';
import { Resvg } from '@resvg/resvg-js';
import { renderSlideSvg, RATIOS } from './renderer.js';

// --- Single Slide PNG Renderer ---

export function renderSlidePng(slide, index, total, options = {}) {
  const svg = renderSlideSvg(slide, index, total, options);
  const dim = RATIOS[options.ratio] || RATIOS.portrait;

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: dim.width },
    font: {
      loadSystemFonts: true,
      defaultFontFamily: '-apple-system'
    }
  });

  return resvg.render().asPng();
}

// --- Multi-Page PDF Compiler ---

export async function generateCarouselPdf(slides, outputPath, options = {}) {
  if (!slides || !slides.length) {
    throw new Error('No slides provided for PDF generation.');
  }

  const dim = RATIOS[options.ratio] || RATIOS.portrait;
  const total = slides.length;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      autoFirstPage: false,
      info: {
        Title: slides[0].title || 'LinkedIn Carousel',
        Author: options.author || 'eco-null',
        Creator: 'PostReady Carousel Generator (https://postready.org)'
      }
    });

    const outDir = path.dirname(path.resolve(outputPath));
    fs.mkdirSync(outDir, { recursive: true });

    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);

    try {
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const pngBuffer = renderSlidePng(slide, i + 1, total, options);

        doc.addPage({
          size: [dim.width, dim.height],
          margin: 0
        });

        doc.image(pngBuffer, 0, 0, {
          width: dim.width,
          height: dim.height
        });
      }

      doc.end();

      writeStream.on('finish', () => {
        resolve({
          path: outputPath,
          totalPages: total,
          fileSize: fs.statSync(outputPath).size
        });
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}

// --- Image Pack Exporter ---

export function exportSlideImages(slides, outputDir, options = {}) {
  const total = slides.length;
  const absDir = path.resolve(outputDir);
  fs.mkdirSync(absDir, { recursive: true });

  const generatedFiles = [];

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const pngBuffer = renderSlidePng(slide, i + 1, total, options);
    const fileName = `slide-${String(i + 1).padStart(2, '0')}.png`;
    const filePath = path.join(absDir, fileName);

    fs.writeFileSync(filePath, pngBuffer);
    generatedFiles.push(filePath);
  }

  return generatedFiles;
}
