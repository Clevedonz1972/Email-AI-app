export interface User {
  id: number;
  email: string;
  name?: string;
  role?: string;
  preferences?: {
    theme?: string;
    notifications?: boolean;
    accessibility?: {
      fontSize?: string;
      colorScheme?: string;
    };
  };
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface RegistrationData extends UserCredentials {
  name: string;
  confirmPassword: string;
} 