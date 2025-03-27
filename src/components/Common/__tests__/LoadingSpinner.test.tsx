import { render, screen } from '@/test/utils';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with accessibility features', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });

  it('shows custom loading text', () => {
    render(<LoadingSpinner text="Processing your request" />);
    expect(screen.getByText('Processing your request')).toBeInTheDocument();
  });
}); 