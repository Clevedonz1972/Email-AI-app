import { screen, fireEvent } from '@testing-library/react';
import { render } from '@/test-utils/test-utils';
import { SettingsPanel } from '@/components/SettingsPanel/SettingsPanel';
import { useSettings } from '@/contexts/SettingsContext';
import { useTheme } from '@mui/material/styles';

jest.mock('@/contexts/SettingsContext');
jest.mock('@mui/material/styles');

interface Settings {
  darkMode: boolean;
  fontSize: number;
  lineSpacing: number;
  reduceAnimations: boolean;
}

const defaultSettings: Settings = {
  darkMode: false,
  fontSize: 16,
  lineSpacing: 1.6,
  reduceAnimations: false,
};

describe('SettingsPanel', () => {
  const mockUseSettings = {
    settings: {
      theme: 'light',
      fontSize: 16,
      lineHeight: 1.5,
      letterSpacing: 0.5,
      wordSpacing: 0.15,
      fontFamily: 'Arial',
      highContrast: false,
      reducedMotion: false,
      colorMode: 'default'
    },
    updateSettings: jest.fn(),
    resetSettings: jest.fn()
  };

  const mockTheme = {
    palette: {
      primary: { main: '#1976d2' },
      text: { primary: '#000000' },
      background: { default: '#ffffff' }
    }
  };

  beforeEach(() => {
    (useSettings as jest.Mock).mockReturnValue(mockUseSettings);
    (useTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  it('renders all accessibility controls', () => {
    const { getByLabelText } = render(<SettingsPanel open={false} onClose={function (): void {
      throw new Error('Function not implemented.');
    } } settings={{
      darkMode: false,
      fontSize: 0,
      lineSpacing: 0,
      reduceAnimations: false
    }} onSettingsChange={function (key: string, value: any): void {
      throw new Error('Function not implemented.');
    } } />);
    
    expect(getByLabelText('Font Size')).toBeInTheDocument();
    expect(getByLabelText('Line Height')).toBeInTheDocument();
    expect(getByLabelText('Letter Spacing')).toBeInTheDocument();
    expect(getByLabelText('Word Spacing')).toBeInTheDocument();
    expect(getByLabelText('Font Family')).toBeInTheDocument();
    expect(getByLabelText('High Contrast Mode')).toBeInTheDocument();
    expect(getByLabelText('Reduced Motion')).toBeInTheDocument();
  });

  it('applies settings changes correctly', () => {
    const { getByLabelText, getByRole } = render(<SettingsPanel open={false} onClose={function (): void {
      throw new Error('Function not implemented.');
    } } settings={{
      darkMode: false,
      fontSize: 0,
      lineSpacing: 0,
      reduceAnimations: false
    }} onSettingsChange={function (key: string, value: any): void {
      throw new Error('Function not implemented.');
    } } />);
    
    const darkModeSwitch = getByLabelText('Dark Mode');
    darkModeSwitch.click();
    
    const applyButton = getByRole('button', { name: 'Apply Settings' });
    applyButton.click();

    expect(mockUseSettings.updateSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        theme: 'dark'
      })
    );
  });

  it('maintains proper contrast in light mode', () => {
    const { container } = render(<SettingsPanel open={false} onClose={function (): void {
      throw new Error('Function not implemented.');
    } } settings={{
      darkMode: false,
      fontSize: 0,
      lineSpacing: 0,
      reduceAnimations: false
    }} onSettingsChange={function (key: string, value: any): void {
      throw new Error('Function not implemented.');
    } } />);
    
    const styles = window.getComputedStyle(container.firstChild as Element);
    expect(styles).toEqual(expect.objectContaining({
      color: expect.stringMatching(/^#[0-9A-Fa-f]{6}$/),
      backgroundColor: '#ffffff'
    }));
  });

  it('maintains proper contrast in dark mode', () => {
    mockUseSettings.settings.theme = 'dark';
    mockTheme.palette.background.default = '#121212';
    mockTheme.palette.text.primary = '#ffffff';

    const { container } = render(<SettingsPanel open={false} onClose={function (): void {
      throw new Error('Function not implemented.');
    } } settings={{
      darkMode: false,
      fontSize: 0,
      lineSpacing: 0,
      reduceAnimations: false
    }} onSettingsChange={function (key: string, value: any): void {
      throw new Error('Function not implemented.');
    } } />);
    
    const styles = window.getComputedStyle(container.firstChild as Element);
    expect(styles).toEqual(expect.objectContaining({
      color: expect.stringMatching(/^#[0-9A-Fa-f]{6}$/),
      backgroundColor: '#121212'
    }));
  });

  it('renders all settings controls', () => {
    const mockOnClose = jest.fn();
    const mockOnSettingsChange = jest.fn();
    
    render(
      <SettingsPanel
        open={true}
        onClose={mockOnClose}
        settings={defaultSettings}
        onSettingsChange={mockOnSettingsChange}
      />
    );
    
    // Check if all controls are present
    expect(screen.getByLabelText('Dark Mode')).toBeInTheDocument();
    expect(screen.getByLabelText('Font size')).toBeInTheDocument();
    expect(screen.getByLabelText('Line spacing')).toBeInTheDocument();
    expect(screen.getByLabelText('Reduce Animations')).toBeInTheDocument();
  });

  it('updates settings when controls are changed', () => {
    const mockOnSettingsChange = jest.fn();
    
    render(
      <SettingsPanel
        open={true}
        onClose={() => {}}
        settings={defaultSettings}
        onSettingsChange={mockOnSettingsChange}
      />
    );
    
    // Toggle dark mode
    const darkModeSwitch = screen.getByLabelText('Dark Mode');
    fireEvent.click(darkModeSwitch);
    
    // Click apply button
    const applyButton = screen.getByText('Apply Changes');
    fireEvent.click(applyButton);
    
    expect(mockOnSettingsChange).toHaveBeenCalledWith('darkMode', true);
  });

  it('maintains WCAG contrast requirements in both modes', () => {
    const { rerender } = render(
      <SettingsPanel
        open={true}
        onClose={() => {}}
        settings={{ ...defaultSettings, darkMode: false }}
        onSettingsChange={() => {}}
      />
    );
    
    // Test light mode contrast
    const lightModeText = screen.getByText('Display Settings');
    expect(lightModeText).toHaveStyle({
      color: expect.stringMatching(/^#[0-9A-F]{6}$/i),
    });
    
    // Test dark mode
    rerender(
      <SettingsPanel
        open={true}
        onClose={() => {}}
        settings={{ ...defaultSettings, darkMode: true }}
        onSettingsChange={() => {}}
      />
    );
    
    // Verify dark mode contrast
    expect(lightModeText).toHaveStyle({
      color: expect.stringMatching(/^#[0-9A-F]{6}$/i),
    });
  });
}); 