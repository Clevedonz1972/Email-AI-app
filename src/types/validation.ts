export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
} 