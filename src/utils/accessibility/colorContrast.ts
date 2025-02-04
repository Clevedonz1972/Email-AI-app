import { ColorContrastChecker } from 'color-contrast-checker';

const checker = new ColorContrastChecker();

interface RGB {
  r: number;
  g: number;
  b: number;
}

export function parseColor(color: string): RGB {
  // Handle hex
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16)
    };
  }
  
  // Handle rgb/rgba
  if (color.startsWith('rgb')) {
    const [r, g, b] = color
      .replace(/[rgba()]/g, '')
      .split(',')
      .map(n => parseInt(n.trim()));
    return { r, g, b };
  }
  
  throw new Error(`Unsupported color format: ${color}`);
}

export function getColorContrast(color1: string, color2: string): number {
  const rgb1 = parseColor(color1);
  const rgb2 = parseColor(color2);
  
  return checker.getContrastRatio(
    `rgb(${rgb1.r},${rgb1.g},${rgb1.b})`,
    `rgb(${rgb2.r},${rgb2.g},${rgb2.b})`
  );
}

export function isColorContrastValid(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getColorContrast(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
} 