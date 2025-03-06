import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { AccessibilityProvider, AccessibilityContext, AccessibilityPreferences } from '../contexts/AccessibilityContext';
import { FocusAssistant } from '../components/Common/FocusAssistant';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { ThemeProvider, createTheme } from '@mui/material';

expect.extend(toHaveNoViolations);

const TestComponent: React.FC = () => {
  const contentRef = React.useRef<HTMLDivElement>(null);
  useKeyboardNavigation({
    enabled: true,
    onEnter: jest.fn(),
    onEscape: jest.fn(),
  });

  return (
    <div ref={contentRef}>
      <button>Button 1</button>
      <button>Button 2</button>
      <input type="text" />
      <FocusAssistant 
        contentRef={contentRef as React.RefObject<HTMLDivElement>} 
        onComplete={() => {}} 
      />
    </div>
  );
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AccessibilityProvider>
      <ThemeProvider theme={createTheme()}>
        {component}
      </ThemeProvider>
    </AccessibilityProvider>
  );
};

describe('Accessibility Features', () => {
  describe('AccessibilityContext', () => {
    it('should provide default preferences', () => {
      const TestConsumer = () => {
        const { preferences } = React.useContext(AccessibilityContext);
        return <div data-testid="preferences">{JSON.stringify(preferences)}</div>;
      };

      renderWithProviders(<TestConsumer />);
      const preferencesElement = screen.getByTestId('preferences');
      const preferences = JSON.parse(preferencesElement.textContent || '{}') as AccessibilityPreferences;

      expect(preferences).toEqual(expect.objectContaining({
        highContrast: false,
        reducedMotion: false,
        fontSize: 16,
        lineSpacing: 1.5,
        focusMode: false,
        soundEffects: true,
        colorScheme: 'light',
      }));
    });

    it('should update preferences correctly', () => {
      const TestConsumer = () => {
        const { preferences, updatePreferences } = React.useContext(AccessibilityContext);
        return (
          <>
            <div data-testid="preferences">{JSON.stringify(preferences)}</div>
            <button onClick={() => updatePreferences({ fontSize: 20 })}>
              Update Font Size
            </button>
          </>
        );
      };

      renderWithProviders(<TestConsumer />);
      fireEvent.click(screen.getByText('Update Font Size'));

      const preferencesElement = screen.getByTestId('preferences');
      const preferences = JSON.parse(preferencesElement.textContent || '{}') as AccessibilityPreferences;
      expect(preferences.fontSize).toBe(20);
    });
  });

  describe('FocusAssistant', () => {
    it('should render focus assistant when focus mode is enabled', () => {
      const TestWrapper = () => {
        const { updatePreferences } = React.useContext(AccessibilityContext);
        React.useEffect(() => {
          updatePreferences({ focusMode: true });
        }, [updatePreferences]);
        return <TestComponent />;
      };

      renderWithProviders(<TestWrapper />);
      expect(screen.getByRole('button', { name: 'start focus mode' })).toBeInTheDocument();
    });

    it('should not render focus assistant when focus mode is disabled', () => {
      renderWithProviders(<TestComponent />);
      expect(screen.queryByRole('button', { name: 'start focus mode' })).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should navigate through focusable elements with arrow keys', () => {
      renderWithProviders(<TestComponent />);
      const buttons = screen.getAllByRole('button');
      const input = screen.getByRole('textbox');

      // Focus first button
      buttons[0].focus();
      expect(document.activeElement).toBe(buttons[0]);

      // Press arrow down
      fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
      expect(document.activeElement).toBe(buttons[1]);

      // Press arrow down again
      fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' });
      expect(document.activeElement).toBe(input);
    });
  });

  describe('Accessibility Compliance', () => {
    it('should pass axe accessibility tests', async () => {
      const { container } = renderWithProviders(<TestComponent />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
}); 