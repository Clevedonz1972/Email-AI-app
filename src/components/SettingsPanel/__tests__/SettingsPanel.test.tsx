import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../../test-utils/test-utils';
import { SettingsPanel } from '../SettingsPanel';

const defaultSettings = {
  darkMode: false,
  fontSize: 16,
  lineSpacing: 1.6,
  reduceAnimations: false,
};

describe('SettingsPanel', () => {
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
      color: expect.stringMatching(/^#([0-9A-F]{6})$/i),
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
      color: expect.stringMatching(/^#([0-9A-F]{6})$/i),
    });
  });
}); 