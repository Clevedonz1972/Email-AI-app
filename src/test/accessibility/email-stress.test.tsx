import { render } from '@/test/utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import { EmailList } from '@/components/Email/EmailList';
import { mockEmails } from '@/test/utils/mockData';
import type { EmailMessage } from '@/types/email';
import { parseColor } from '@/utils/accessibility/colorContrast';

expect.extend(toHaveNoViolations);

// Convert RGB/RGBA color to relative luminance
const getLuminance = (color: string): number => {
  const [r, g, b] = parseColor(color);
  const [rr, gg, bb] = [r, g, b].map(value => {
    const normalizedValue = value / 255;
    return normalizedValue <= 0.03928
      ? normalizedValue / 12.92
      : Math.pow(((normalizedValue + 0.055) / 1.055), 2.4);
  });
  return 0.2126 * rr + 0.7152 * gg + 0.0722 * bb;
};

// Calculate contrast ratio between two colors
const getContrastRatio = (color1: string, color2: string): number => {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

describe('Email Stress Features Accessibility', () => {
  const handleSelectEmail = (email: EmailMessage) => {};
  const handleMarkRead = (id: number) => {};

  it('meets WCAG standards for stress indicators', async () => {
    const { container } = render(
      <EmailList 
        emails={mockEmails} 
        loading={false}
        onSelectEmail={handleSelectEmail}
        onMarkRead={handleMarkRead}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('maintains sufficient color contrast for stress levels', async () => {
    const { container } = render(
      <EmailList 
        emails={mockEmails} 
        loading={false}
        onSelectEmail={handleSelectEmail}
        onMarkRead={handleMarkRead}
      />
    );
    
    // Check all stress indicators
    const indicators = container.querySelectorAll('[data-testid="stress-indicator"]');
    
    indicators.forEach(indicator => {
      const style = window.getComputedStyle(indicator);
      const backgroundColor = style.backgroundColor;
      const textColor = style.color;
      
      // Should meet WCAG AA standards (4.5:1 ratio)
      expect(getContrastRatio(backgroundColor, textColor)).toBeGreaterThanOrEqual(4.5);
    });
  });
}); 