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

export interface AccessibilityPreferences {
  high_contrast: boolean;
  large_text: boolean;
  reduced_motion: boolean;
  text_scale: number;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  quiet_hours: {
    start: string;
    end: string;
  };
}

export interface AIAssistancePreferences {
  level: 'minimal' | 'balanced' | 'high';
  auto_categorize: boolean;
  stress_monitoring: boolean;
}

export interface PreferencesUpdate {
  accessibility?: Partial<AccessibilityPreferences>;
  notifications?: Partial<NotificationPreferences>;
  ai_assistance?: Partial<AIAssistancePreferences>;
  theme?: string;
}

export interface PreferencesResponse {
  accessibility: AccessibilityPreferences;
  notifications: NotificationPreferences;
  ai_assistance: AIAssistancePreferences;
  theme: string;
} 