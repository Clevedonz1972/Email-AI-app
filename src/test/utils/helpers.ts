import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

export const waitForLoadingToFinish = async () => {
  await waitFor(() => {
    const loaders = [
      ...screen.queryAllByTestId('loading'),
      ...screen.queryAllByText('loading'),
    ];
    if (loaders.length > 0) {
      throw new Error('Still loading');
    }
  });
};

export const fillFormField = async (label: string, value: string) => {
  const input = screen.getByLabelText(label);
  fireEvent.change(input, { target: { value } });
};

export const submitForm = async (submitButtonText: RegExp | string = 'Submit') => {
  const submitButton = screen.getByText(submitButtonText);
  fireEvent.click(submitButton);
};

// Helper function to escape special regex characters
function escapeRegExp(string: string) {
  const specialCharsRegex = /[.*+?^${}()|[\]\\]/g;
  return string.replace(specialCharsRegex, '\\$&'); // $& means the whole matched string
}

export function createTestId(prefix: string, suffix: string): string {
  return `${prefix}-${escapeRegExp(suffix)}`;
}

export function formatTestName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export function sanitizeTestInput(input: string): string {
  const sanitizedInput = input.trim();
  return escapeRegExp(sanitizedInput);
}

export function validateTestId(testId: string): boolean {
  const validTestIdRegex = /^[a-z0-9-]+$/;
  return validTestIdRegex.test(testId);
}