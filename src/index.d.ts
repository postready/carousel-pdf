export type ThemeName = 'dark' | 'light' | 'terminal' | 'gold';
export type RatioName = 'portrait' | 'square';

export interface SlideData {
  type: 'cover' | 'content' | 'outro';
  title: string;
  subtitle?: string;
  body?: string;
  bullets?: string[];
  badge?: string;
  author?: string;
  url?: string;
  cta?: string;
}

export interface CarouselOptions {
  theme?: ThemeName;
  ratio?: RatioName;
  brand?: string;
  author?: string;
  url?: string;
  showGrid?: boolean;
}

export interface PdfResult {
  path: string;
  totalPages: number;
  fileSize: number;
}

export declare const THEMES: Record<ThemeName, any>;
export declare const AVAILABLE_THEMES: ThemeName[];
export declare const RATIOS: Record<RatioName, { width: number; height: number }>;

export declare function splitTextToDeck(rawText: string, options?: CarouselOptions): SlideData[];
export declare function renderSlideSvg(slide: SlideData, index: number, total: number, options?: CarouselOptions): string;
export declare function renderSlidePng(slide: SlideData, index: number, total: number, options?: CarouselOptions): Uint8Array;
export declare function generateCarouselPdf(slides: SlideData[], outputPath: string, options?: CarouselOptions): Promise<PdfResult>;
export declare function exportSlideImages(slides: SlideData[], outputDir: string, options?: CarouselOptions): string[];
export declare function createCarouselFromText(text: string, outputPath: string, options?: CarouselOptions): Promise<PdfResult>;
