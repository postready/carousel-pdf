#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { splitTextToDeck, generateCarouselPdf, exportSlideImages } from '../src/index.js';

const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

// --- Color Palette ---

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

// --- Help & Usage ---

function printHelp() {
  console.log(`
${c.bold}${c.cyan}carousel-pdf-cli${c.reset} v${pkg.version}
${c.dim}Deterministic text-to-carousel PDF generator for LinkedIn & X.${c.reset}
${c.dim}Powered by PostReady — ${c.blue}https://postready.org${c.reset}

${c.bold}USAGE:${c.reset}
  $ carousel-pdf <file.md> [options]
  $ cat article.md | carousel-pdf [options]

${c.bold}OPTIONS:${c.reset}
  ${c.green}-o, --out <path>${c.reset}        Output PDF file path (default: carousel.pdf)
  ${c.green}-t, --theme <name>${c.reset}      Theme: dark (default), light, terminal, gold
  ${c.green}-r, --ratio <name>${c.reset}      Aspect ratio: portrait (1080x1350, default), square (1080x1080)
  ${c.green}-b, --brand <text>${c.reset}      Top brand badge label (default: POSTREADY.ORG)
  ${c.green}-a, --author <name>${c.reset}     Author signature name (default: eco-null)
  ${c.green}-u, --url <text>${c.reset}        Footer domain watermark (default: postready.org)
  ${c.green}--images <dir>${c.reset}          Also export individual PNG slides to directory
  ${c.green}--json${c.reset}                  Output parsed slide structure as JSON
  ${c.green}-h, --help${c.reset}              Show this help message
  ${c.green}-v, --version${c.reset}           Show version

${c.bold}INPUT FORMATS:${c.reset}
  1. Multi-slide Markdown: Separate slides using '---' on its own line.
  2. Plain text / notes: Automatically split into Title, Content, and Outro slides.

${c.bold}EXAMPLES:${c.reset}
  $ carousel-pdf thread.md -t dark -o linkedin-carousel.pdf
  $ carousel-pdf notes.txt --ratio square -t gold
  $ cat blog.md | carousel-pdf -t terminal --images ./slides
`);
}

// --- Argument Parser ---

async function readInput() {
  const args = process.argv.slice(2);
  let filePath = null;
  const options = {
    out: 'carousel.pdf',
    theme: 'dark',
    ratio: 'portrait',
    brand: 'POSTREADY.ORG',
    author: 'eco-null',
    url: 'postready.org',
    imagesDir: null,
    json: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '-h' || arg === '--help') {
      printHelp();
      process.exit(0);
    }
    if (arg === '-v' || arg === '--version') {
      console.log(`v${pkg.version}`);
      process.exit(0);
    }
    if (arg === '--json') {
      options.json = true;
      continue;
    }
    if (arg === '-o' || arg === '--out') {
      options.out = args[++i];
      continue;
    }
    if (arg === '-t' || arg === '--theme') {
      options.theme = args[++i];
      continue;
    }
    if (arg === '-r' || arg === '--ratio') {
      options.ratio = args[++i];
      continue;
    }
    if (arg === '-b' || arg === '--brand') {
      options.brand = args[++i];
      continue;
    }
    if (arg === '-a' || arg === '--author') {
      options.author = args[++i];
      continue;
    }
    if (arg === '-u' || arg === '--url') {
      options.url = args[++i];
      continue;
    }
    if (arg === '--images') {
      options.imagesDir = args[++i];
      continue;
    }

    if (!arg.startsWith('-') && !filePath) {
      filePath = arg;
    }
  }

  if (filePath) {
    const fullPath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      console.error(`${c.yellow}Error: Input file not found:${c.reset} ${filePath}`);
      process.exit(1);
    }
    return { content: fs.readFileSync(fullPath, 'utf8'), options };
  }

  if (!process.stdin.isTTY) {
    const chunks = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    return { content: Buffer.concat(chunks).toString('utf8'), options };
  }

  printHelp();
  process.exit(1);
}

// --- Execution ---

async function main() {
  try {
    const { content, options } = await readInput();

    if (!content.trim()) {
      console.error(`${c.yellow}Error: Input content is empty.${c.reset}`);
      process.exit(1);
    }

    const slides = splitTextToDeck(content, options);

    if (!slides.length) {
      console.error(`${c.yellow}Error: Could not parse any slides from input.${c.reset}`);
      process.exit(1);
    }

    if (options.json) {
      console.log(JSON.stringify(slides, null, 2));
      return;
    }

    console.log(`\n${c.bold}${c.cyan}⚡ Compiling LinkedIn Carousel PDF (${slides.length} slides)...${c.reset}`);
    console.log(`${c.dim}Theme:${c.reset} ${options.theme} | ${c.dim}Ratio:${c.reset} ${options.ratio}`);

    const pdfResult = await generateCarouselPdf(slides, options.out, options);
    const sizeKb = (pdfResult.fileSize / 1024).toFixed(1);

    console.log(`\n${c.bold}${c.green}✓ Carousel PDF Generated:${c.reset} ${pdfResult.path} ${c.dim}(${sizeKb} KB, ${pdfResult.totalPages} pages)${c.reset}`);

    if (options.imagesDir) {
      const imgPaths = exportSlideImages(slides, options.imagesDir, options);
      console.log(`${c.bold}${c.green}✓ Exported ${imgPaths.length} PNG slides to:${c.reset} ${options.imagesDir}`);
    }

    console.log(`\n${c.dim}Ready to upload directly as a LinkedIn document post.${c.reset}`);
    console.log(`${c.dim}Powered by PostReady — ${c.cyan}https://postready.org${c.reset}\n`);
  } catch (err) {
    console.error(`\n${c.yellow}Error:${c.reset}`, err.message);
    process.exit(1);
  }
}

main();
