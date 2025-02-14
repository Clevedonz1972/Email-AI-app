export interface SensoryPreferences {
  fontScale: number;
  contrast: 'normal' | 'high';
  motion: 'normal' | 'reduced';
  textSpacing: 'normal' | 'increased' | 'maximum';
  colorMode: 'default' | 'deuteranopia' | 'protanopia' | 'tritanopia';
  lineHeight: number;
  fontFamily: string;
  readingSpeed: 'slow' | 'normal' | 'fast';
} 