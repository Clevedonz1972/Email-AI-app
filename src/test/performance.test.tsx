import React from 'react';
import { render } from '@testing-library/react';
import { Dashboard } from '../components/Dashboard/Dashboard';
import { EmailList } from '../components/EmailList/EmailList';

describe('Performance', () => {
  it('should render Dashboard within performance budget', () => {
    const start = performance.now();
    render(<Dashboard />);
    const end = performance.now();
    
    expect(end - start).toBeLessThan(100); // 100ms budget
  });

  it('should handle large email lists efficiently', () => {
    const largeEmailList = Array.from({ length: 1000 }, (_, i) => ({
      id: `${i}`,
      subject: `Email ${i}`,
      content: `Content ${i}`,
      sender: 'test@example.com',
      timestamp: new Date().toISOString()
    }));

    const start = performance.now();
    render(<EmailList emails={largeEmailList} />);
    const end = performance.now();

    expect(end - start).toBeLessThan(500); // 500ms budget for 1000 emails
  });
}); 