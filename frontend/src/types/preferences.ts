// Preferences types

// Color scheme options
export type ColorScheme = 'light' | 'dark' | 'auto' | 'system';

// Font size options
export type FontSize = 'small' | 'medium' | 'large' | 'x-large';

// Accessibility preferences interface
export interface AccessibilityPreferences {
  colorScheme: 'light' | 'dark' | 'high-contrast' | 'system' | 'auto';
  customColors?: {
    background: string;
    text: string;
    accent: string;
  };
  fontSize: number;
  lineSpacing: number;
  reducedMotion: boolean;
  focusMode: boolean;
  high_contrast?: boolean;
  highContrast?: boolean;
  screenReader?: boolean;
  simplified_ui?: boolean;
  auto_summarize?: boolean;
  keyboard_navigation?: boolean;
  text_to_speech?: boolean;
  content_warnings?: boolean;
  alt_text_preferred?: boolean;
  notifications_muted?: boolean;
  larger_click_targets?: boolean;
  reduced_animations?: boolean;
  custom_font_size?: string;
  custom_line_spacing?: string;
  colorBlindMode?: boolean;
}

// Default preferences
export const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  colorScheme: 'light',
  customColors: {
    background: '#ffffff',
    text: '#333333',
    accent: '#3f51b5'
  },
  fontSize: 16,
  lineSpacing: 1.5,
  reducedMotion: false,
  focusMode: false,
  high_contrast: false,
  highContrast: false,
  screenReader: false,
  simplified_ui: false,
  auto_summarize: false,
  keyboard_navigation: true,
  text_to_speech: false,
  content_warnings: false,
  alt_text_preferred: true,
  notifications_muted: false,
  larger_click_targets: false,
  reduced_animations: false,
  custom_font_size: 'medium',
  custom_line_spacing: 'normal',
  colorBlindMode: false
}; 