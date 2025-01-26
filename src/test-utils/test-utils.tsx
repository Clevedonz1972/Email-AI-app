import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createAppTheme } from '../theme/theme';
import { Email } from '../components/EmailList/EmailList';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider theme={createAppTheme('light')}>
      {children}
    </ThemeProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

export const mockEmails: Email[] = [
  {
    id: '1',
    sender: {
      name: 'John Doe',
      email: 'john@example.com',
    },
    subject: 'Important Meeting',
    preview: 'Please review the attached documents before our meeting tomorrow.',
    timestamp: '2024-03-20T10:00:00Z',
    priority: 'HIGH',
    isRead: false,
  },
  {
    id: '2',
    sender: {
      name: 'Jane Smith',
      email: 'jane@example.com',
    },
    subject: 'Project Update',
    preview: 'Here is the latest status update on the current project.',
    timestamp: '2024-03-20T09:30:00Z',
    priority: 'MEDIUM',
    isRead: true,
  },
]; 