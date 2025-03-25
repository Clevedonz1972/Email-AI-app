declare module 'color-contrast-checker' {
  export class ColorContrastChecker {
    constructor();
    isLevelAA(colorA: string, colorB: string, fontSize?: number): boolean;
    isLevelAAA(colorA: string, colorB: string, fontSize?: number): boolean;
    getContrastRatio(colorA: string, colorB: string): number;
    hexToRgb(hex: string): { r: number; g: number; b: number };
  }
} 