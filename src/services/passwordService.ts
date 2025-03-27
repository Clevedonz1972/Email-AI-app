export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: number;
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let strength = 0;

  // Basic requirements
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else {
    strength += 1;
  }

  if (password.length > 32) {
    errors.push('Password must not exceed 32 characters');
  }

  // Character requirements
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    strength += 1;
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    strength += 1;
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    strength += 1;
  }

  if (!/[!@#$%^&*()\-_=+{};:,<.>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else {
    strength += 1;
  }

  // Calculate strength
  if (password.length >= 12) strength += 1;
  if (password.length >= 16) strength += 1;

  return {
    isValid: errors.length === 0,
    errors,
    strength: Math.min(strength, 7)
  };
} 