import { ColorContrastChecker } from 'color-contrast-checker';

const checker = new ColorContrastChecker();

interface RGB {
  r: number;
  g: number;
  b: number;
}

export function parseColor(color: string): [number, number, number] {
  // Handle hex
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return [r, g, b];
  }
  
  // Handle rgb/rgba
  const rgbRegex = /\d+/g;
  const values = color.match(rgbRegex)?.map(Number) ?? [0, 0, 0];
  return [values[0], values[1], values[2]];
}

// Convert RGB/RGBA color to relative luminance
const getLuminance = (color: string): number => {
  const [r, g, b] = parseColor(color);
  const [rr, gg, bb] = [r, g, b].map(value => {
    const normalizedValue = value / 255;
    return normalizedValue <= 0.03928
      ? normalizedValue / 12.92
      : Math.pow((normalizedValue + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rr + 0.7152 * gg + 0.0722 * bb;
};

// Calculate contrast ratio between two colors
export function getColorContrast(color1: string, color2: string): number {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function isColorContrastValid(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getColorContrast(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
} 