declare module 'color-contrast-checker' {
  export class ColorContrastChecker {
    getContrastRatio(color1: string, color2: string): number;
  }
} 