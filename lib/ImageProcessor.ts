/**
 * Image to Byte Array Processor
 * Image conversion for Arduino/embedded C++
 */

// ============================================================================
// Types
// ============================================================================

export interface ProcessingOptions {
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: 'white' | 'black' | 'transparent';
  scaling: 'original' | 'fit' | 'stretch' | 'stretchH' | 'stretchV';
  centerH: boolean;
  centerV: boolean;
  threshold: number;
  invert: boolean;
  dithering: 'none' | 'floydSteinberg' | 'atkinson' | 'bayer';
  rotation: 0 | 90 | 180 | 270;
  flipH: boolean;
  colorMode: 'mono' | 'grayscale' | 'rgb565' | 'rgb888';
  drawMode: 'horizontal' | 'vertical';
}

export interface OutputOptions {
  format: 'hex' | 'decimal' | 'binary';
  variableName: string;
  progmem: boolean;
  bytesPerLine: number;
  includeSize: boolean;
}

export interface ConversionResult {
  bytes: Uint8Array;
  width: number;
  height: number;
  colorMode: string;
  totalBytes: number;
  previewCanvas: HTMLCanvasElement;
}

// ============================================================================
// Default Options
// ============================================================================

export const DefaultProcessingOptions: ProcessingOptions = {
  canvasWidth: 128,
  canvasHeight: 64,
  backgroundColor: 'black',
  scaling: 'fit',
  centerH: true,
  centerV: true,
  threshold: 128,
  invert: false,
  dithering: 'none',
  rotation: 0,
  flipH: false,
  colorMode: 'mono',
  drawMode: 'horizontal',
};

export const DefaultOutputOptions: OutputOptions = {
  format: 'hex',
  variableName: 'image',
  progmem: true,
  bytesPerLine: 16,
  includeSize: true,
};

// ============================================================================
// Canvas Size Presets
// ============================================================================

export const CanvasPresets = [
  { label: '128×64 (SSD1306)', width: 128, height: 64 },
  { label: '128×32 (SSD1306 Mini)', width: 128, height: 32 },
  { label: '96×64 (SSD1331)', width: 96, height: 64 },
  { label: '160×128 (ST7735)', width: 160, height: 128 },
  { label: '240×240 (ST7789)', width: 240, height: 240 },
  { label: '320×240 (ILI9341)', width: 320, height: 240 },
  { label: '480×320 (ILI9488)', width: 480, height: 320 },
  { label: 'Custom', width: 0, height: 0 },
];

// ============================================================================
// Bayer Dithering Matrix (4x4)
// ============================================================================

const BayerMatrix = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map(row => row.map(v => (v / 16) * 255));

// ============================================================================
// Core Processing Functions
// ============================================================================

/**
 * Load an image from a File object
 */
export function LoadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Apply rotation transformation to canvas context
 */
function ApplyRotation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  rotation: 0 | 90 | 180 | 270
): { newWidth: number; newHeight: number } {
  let newWidth = width;
  let newHeight = height;

  ctx.translate(width / 2, height / 2);

  switch (rotation) {
    case 90:
      ctx.rotate(Math.PI / 2);
      newWidth = height;
      newHeight = width;
      break;
    case 180:
      ctx.rotate(Math.PI);
      break;
    case 270:
      ctx.rotate((3 * Math.PI) / 2);
      newWidth = height;
      newHeight = width;
      break;
  }

  ctx.translate(-newWidth / 2, -newHeight / 2);

  return { newWidth, newHeight };
}

/**
 * Calculate scaled dimensions maintaining aspect ratio
 */
function CalculateScaledDimensions(
  imgWidth: number,
  imgHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  scaling: ProcessingOptions['scaling']
): { width: number; height: number; x: number; y: number } {
  let width = imgWidth;
  let height = imgHeight;
  let x = 0;
  let y = 0;

  switch (scaling) {
    case 'original':
      // Keep original size
      break;
    case 'fit': {
      const ratio = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight);
      width = Math.floor(imgWidth * ratio);
      height = Math.floor(imgHeight * ratio);
      break;
    }
    case 'stretch':
      width = canvasWidth;
      height = canvasHeight;
      break;
    case 'stretchH':
      width = canvasWidth;
      height = Math.floor((canvasWidth / imgWidth) * imgHeight);
      break;
    case 'stretchV':
      height = canvasHeight;
      width = Math.floor((canvasHeight / imgHeight) * imgWidth);
      break;
  }

  return { width, height, x, y };
}

/**
 * Apply Floyd-Steinberg dithering
 */
function ApplyFloydSteinbergDithering(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  threshold: number
): void {
  const getIndex = (x: number, y: number) => (y * width + x) * 4;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = getIndex(x, y);
      const oldPixel = pixels[idx];
      const newPixel = oldPixel < threshold ? 0 : 255;
      const error = oldPixel - newPixel;

      pixels[idx] = newPixel;
      pixels[idx + 1] = newPixel;
      pixels[idx + 2] = newPixel;

      // Distribute error to neighboring pixels
      if (x + 1 < width) {
        const i = getIndex(x + 1, y);
        pixels[i] = Math.max(0, Math.min(255, pixels[i] + (error * 7) / 16));
        pixels[i + 1] = pixels[i];
        pixels[i + 2] = pixels[i];
      }
      if (y + 1 < height) {
        if (x > 0) {
          const i = getIndex(x - 1, y + 1);
          pixels[i] = Math.max(0, Math.min(255, pixels[i] + (error * 3) / 16));
          pixels[i + 1] = pixels[i];
          pixels[i + 2] = pixels[i];
        }
        {
          const i = getIndex(x, y + 1);
          pixels[i] = Math.max(0, Math.min(255, pixels[i] + (error * 5) / 16));
          pixels[i + 1] = pixels[i];
          pixels[i + 2] = pixels[i];
        }
        if (x + 1 < width) {
          const i = getIndex(x + 1, y + 1);
          pixels[i] = Math.max(0, Math.min(255, pixels[i] + (error * 1) / 16));
          pixels[i + 1] = pixels[i];
          pixels[i + 2] = pixels[i];
        }
      }
    }
  }
}

/**
 * Apply Atkinson dithering (sharper than Floyd-Steinberg)
 */
function ApplyAtkinsonDithering(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  threshold: number
): void {
  const getIndex = (x: number, y: number) => (y * width + x) * 4;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = getIndex(x, y);
      const oldPixel = pixels[idx];
      const newPixel = oldPixel < threshold ? 0 : 255;
      const error = Math.floor((oldPixel - newPixel) / 8);

      pixels[idx] = newPixel;
      pixels[idx + 1] = newPixel;
      pixels[idx + 2] = newPixel;

      // Atkinson distributes 6/8 of error (loses 2/8)
      const offsets = [
        [1, 0], [2, 0],
        [-1, 1], [0, 1], [1, 1],
        [0, 2]
      ];

      for (const [dx, dy] of offsets) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < width && ny < height) {
          const i = getIndex(nx, ny);
          pixels[i] = Math.max(0, Math.min(255, pixels[i] + error));
          pixels[i + 1] = pixels[i];
          pixels[i + 2] = pixels[i];
        }
      }
    }
  }
}

/**
 * Apply Bayer ordered dithering
 */
function ApplyBayerDithering(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  threshold: number
): void {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const bayerValue = BayerMatrix[y % 4][x % 4];
      const adjustedThreshold = threshold + bayerValue - 128;
      const newPixel = pixels[idx] < adjustedThreshold ? 0 : 255;

      pixels[idx] = newPixel;
      pixels[idx + 1] = newPixel;
      pixels[idx + 2] = newPixel;
    }
  }
}

/**
 * Main image processing function
 */
export function ProcessImage(
  img: HTMLImageElement,
  options: ProcessingOptions
): ConversionResult {
  // Create working canvas
  const canvas = document.createElement('canvas');
  canvas.width = options.canvasWidth;
  canvas.height = options.canvasHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  // Fill background
  switch (options.backgroundColor) {
    case 'white':
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      break;
    case 'black':
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      break;
    case 'transparent':
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      break;
  }

  // Calculate image dimensions after rotation
  let imgWidth = img.width;
  let imgHeight = img.height;
  if (options.rotation === 90 || options.rotation === 270) {
    [imgWidth, imgHeight] = [imgHeight, imgWidth];
  }

  // Calculate scaled dimensions
  const scaled = CalculateScaledDimensions(
    imgWidth,
    imgHeight,
    options.canvasWidth,
    options.canvasHeight,
    options.scaling
  );

  // Calculate position for centering
  let drawX = 0;
  let drawY = 0;
  if (options.centerH) {
    drawX = Math.floor((options.canvasWidth - scaled.width) / 2);
  }
  if (options.centerV) {
    drawY = Math.floor((options.canvasHeight - scaled.height) / 2);
  }

  // Save context state
  ctx.save();

  // Apply transformations
  ctx.translate(drawX + scaled.width / 2, drawY + scaled.height / 2);

  if (options.rotation !== 0) {
    ctx.rotate((options.rotation * Math.PI) / 180);
  }

  if (options.flipH) {
    ctx.scale(-1, 1);
  }

  // Draw image
  const drawWidth = options.rotation === 90 || options.rotation === 270 ? scaled.height : scaled.width;
  const drawHeight = options.rotation === 90 || options.rotation === 270 ? scaled.width : scaled.height;

  ctx.drawImage(
    img,
    -drawWidth / 2,
    -drawHeight / 2,
    drawWidth,
    drawHeight
  );

  // Restore context
  ctx.restore();

  // Get image data for processing
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  // Convert to grayscale first (for mono/grayscale modes)
  if (options.colorMode === 'mono' || options.colorMode === 'grayscale') {
    for (let i = 0; i < pixels.length; i += 4) {
      const gray = Math.round(0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2]);
      pixels[i] = gray;
      pixels[i + 1] = gray;
      pixels[i + 2] = gray;
    }
  }

  // Apply dithering (only for mono mode)
  if (options.colorMode === 'mono') {
    switch (options.dithering) {
      case 'floydSteinberg':
        ApplyFloydSteinbergDithering(pixels, canvas.width, canvas.height, options.threshold);
        break;
      case 'atkinson':
        ApplyAtkinsonDithering(pixels, canvas.width, canvas.height, options.threshold);
        break;
      case 'bayer':
        ApplyBayerDithering(pixels, canvas.width, canvas.height, options.threshold);
        break;
      case 'none':
        // Simple threshold
        for (let i = 0; i < pixels.length; i += 4) {
          const val = pixels[i] < options.threshold ? 0 : 255;
          pixels[i] = val;
          pixels[i + 1] = val;
          pixels[i + 2] = val;
        }
        break;
    }
  }

  // Apply inversion
  if (options.invert) {
    for (let i = 0; i < pixels.length; i += 4) {
      pixels[i] = 255 - pixels[i];
      pixels[i + 1] = 255 - pixels[i + 1];
      pixels[i + 2] = 255 - pixels[i + 2];
    }
  }

  // Put processed image back
  ctx.putImageData(imageData, 0, 0);

  // Convert to byte array
  const bytes = ConvertToBytes(imageData, options);

  return {
    bytes,
    width: options.canvasWidth,
    height: options.canvasHeight,
    colorMode: options.colorMode,
    totalBytes: bytes.length,
    previewCanvas: canvas,
  };
}

/**
 * Convert ImageData to byte array based on color mode
 */
function ConvertToBytes(
  imageData: ImageData,
  options: ProcessingOptions
): Uint8Array {
  const { width, height } = imageData;
  const pixels = imageData.data;
  const bytes: number[] = [];

  switch (options.colorMode) {
    case 'mono': {
      // 1-bit per pixel, packed into bytes
      if (options.drawMode === 'horizontal') {
        // Horizontal byte packing (left to right, top to bottom)
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x += 8) {
            let byte = 0;
            for (let bit = 0; bit < 8 && x + bit < width; bit++) {
              const idx = (y * width + x + bit) * 4;
              if (pixels[idx] > 127) {
                byte |= 1 << (7 - bit);
              }
            }
            bytes.push(byte);
          }
        }
      } else {
        // Vertical byte packing (for SSD1306-style displays)
        for (let page = 0; page < Math.ceil(height / 8); page++) {
          for (let x = 0; x < width; x++) {
            let byte = 0;
            for (let bit = 0; bit < 8; bit++) {
              const y = page * 8 + bit;
              if (y < height) {
                const idx = (y * width + x) * 4;
                if (pixels[idx] > 127) {
                  byte |= 1 << bit;
                }
              }
            }
            bytes.push(byte);
          }
        }
      }
      break;
    }

    case 'grayscale': {
      // 8-bit grayscale
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          bytes.push(pixels[idx]);
        }
      }
      break;
    }

    case 'rgb565': {
      // 16-bit color (5-6-5)
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];

          // Pack RGB888 to RGB565
          const r5 = (r >> 3) & 0x1f;
          const g6 = (g >> 2) & 0x3f;
          const b5 = (b >> 3) & 0x1f;
          const rgb565 = (r5 << 11) | (g6 << 5) | b5;

          // Big endian (high byte first)
          bytes.push((rgb565 >> 8) & 0xff);
          bytes.push(rgb565 & 0xff);
        }
      }
      break;
    }

    case 'rgb888': {
      // 24-bit full color
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          bytes.push(pixels[idx]);     // R
          bytes.push(pixels[idx + 1]); // G
          bytes.push(pixels[idx + 2]); // B
        }
      }
      break;
    }
  }

  return new Uint8Array(bytes);
}

/**
 * Format a single byte according to output format
 */
function FormatByte(byte: number, format: OutputOptions['format']): string {
  switch (format) {
    case 'hex':
      return '0x' + byte.toString(16).toUpperCase().padStart(2, '0');
    case 'decimal':
      return byte.toString().padStart(3, ' ');
    case 'binary':
      return '0b' + byte.toString(2).padStart(8, '0');
  }
}

/**
 * Generate C/C++ code output
 */
export function GenerateCode(
  result: ConversionResult,
  options: OutputOptions
): string {
  const lines: string[] = [];

  // Header comment
  lines.push('// Generated by Img2Bytes Converter');
  lines.push(`// Dimensions: ${result.width}x${result.height}`);
  lines.push(`// Color Mode: ${result.colorMode.toUpperCase()}`);
  lines.push(`// Total Bytes: ${result.totalBytes}`);
  lines.push('');

  // Size constants if requested
  if (options.includeSize) {
    lines.push(`#define ${options.variableName.toUpperCase()}_WIDTH ${result.width}`);
    lines.push(`#define ${options.variableName.toUpperCase()}_HEIGHT ${result.height}`);
    lines.push('');
  }

  // Array declaration
  const progmem = options.progmem ? ' PROGMEM' : '';
  lines.push(`const unsigned char ${options.variableName}[]${progmem} = {`);

  // Format bytes
  const formattedBytes: string[] = [];
  for (let i = 0; i < result.bytes.length; i++) {
    formattedBytes.push(FormatByte(result.bytes[i], options.format));
  }

  // Group into lines
  for (let i = 0; i < formattedBytes.length; i += options.bytesPerLine) {
    const lineBytes = formattedBytes.slice(i, i + options.bytesPerLine);
    const isLast = i + options.bytesPerLine >= formattedBytes.length;
    const lineContent = '  ' + lineBytes.join(', ') + (isLast ? '' : ',');
    lines.push(lineContent);
  }

  lines.push('};');

  return lines.join('\n');
}

/**
 * Parse byte array from C code and create preview
 */
export function BytesToImage(
  code: string,
  width: number,
  height: number,
  colorMode: ProcessingOptions['colorMode'],
  drawMode: ProcessingOptions['drawMode']
): HTMLCanvasElement | null {
  // Extract bytes from code
  const byteRegex = /0x([0-9A-Fa-f]{2})|0b([01]{8})|(\d{1,3})/g;
  const bytes: number[] = [];
  let match;

  while ((match = byteRegex.exec(code)) !== null) {
    if (match[1]) {
      bytes.push(parseInt(match[1], 16));
    } else if (match[2]) {
      bytes.push(parseInt(match[2], 2));
    } else if (match[3]) {
      const num = parseInt(match[3], 10);
      if (num <= 255) {
        bytes.push(num);
      }
    }
  }

  if (bytes.length === 0) return null;

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(width, height);
  const pixels = imageData.data;

  switch (colorMode) {
    case 'mono': {
      let byteIndex = 0;
      if (drawMode === 'horizontal') {
        for (let y = 0; y < height && byteIndex < bytes.length; y++) {
          for (let x = 0; x < width && byteIndex < bytes.length; x += 8) {
            const byte = bytes[byteIndex++];
            for (let bit = 0; bit < 8 && x + bit < width; bit++) {
              const idx = (y * width + x + bit) * 4;
              const val = (byte & (1 << (7 - bit))) ? 255 : 0;
              pixels[idx] = val;
              pixels[idx + 1] = val;
              pixels[idx + 2] = val;
              pixels[idx + 3] = 255;
            }
          }
        }
      } else {
        for (let page = 0; page < Math.ceil(height / 8) && byteIndex < bytes.length; page++) {
          for (let x = 0; x < width && byteIndex < bytes.length; x++) {
            const byte = bytes[byteIndex++];
            for (let bit = 0; bit < 8; bit++) {
              const y = page * 8 + bit;
              if (y < height) {
                const idx = (y * width + x) * 4;
                const val = (byte & (1 << bit)) ? 255 : 0;
                pixels[idx] = val;
                pixels[idx + 1] = val;
                pixels[idx + 2] = val;
                pixels[idx + 3] = 255;
              }
            }
          }
        }
      }
      break;
    }

    case 'grayscale': {
      for (let i = 0; i < bytes.length && i < width * height; i++) {
        const idx = i * 4;
        pixels[idx] = bytes[i];
        pixels[idx + 1] = bytes[i];
        pixels[idx + 2] = bytes[i];
        pixels[idx + 3] = 255;
      }
      break;
    }

    case 'rgb565': {
      for (let i = 0; i < bytes.length - 1 && i / 2 < width * height; i += 2) {
        const rgb565 = (bytes[i] << 8) | bytes[i + 1];
        const r = ((rgb565 >> 11) & 0x1f) << 3;
        const g = ((rgb565 >> 5) & 0x3f) << 2;
        const b = (rgb565 & 0x1f) << 3;
        const idx = (i / 2) * 4;
        pixels[idx] = r;
        pixels[idx + 1] = g;
        pixels[idx + 2] = b;
        pixels[idx + 3] = 255;
      }
      break;
    }

    case 'rgb888': {
      for (let i = 0; i < bytes.length - 2 && i / 3 < width * height; i += 3) {
        const idx = (i / 3) * 4;
        pixels[idx] = bytes[i];
        pixels[idx + 1] = bytes[i + 1];
        pixels[idx + 2] = bytes[i + 2];
        pixels[idx + 3] = 255;
      }
      break;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Download content as a file
 */
export function DownloadFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard
 */
export async function CopyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  }
}
