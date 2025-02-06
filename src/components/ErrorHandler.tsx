import { captureError } from '../utils/errorHandling';

try {
  // ... code that might throw
} catch (err) {
  if (err instanceof Error) {
    captureError(err, { component: 'ErrorHandler' });
  }
} 