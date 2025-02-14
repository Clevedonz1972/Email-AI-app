import React from 'react';
import { render } from '@testing-library/react';
import { Dashboard } from '../components/Dashboard/Dashboard';
import { EmailList } from '../components/EmailList/EmailList';
import { mockSender } from '../test-utils/test-utils';
import type { EmailMessage } from '../types/email';

describe('Performance', () => {
  it('should render Dashboard within performance budget', () => {
    const start = performance.now();
    render(<Dashboard />);
    const end = performance.now();
    
    expect(end - start).toBeLessThan(100); // 100ms budget
  });

  it('should handle large email lists efficiently', () => {
    const largeEmailList: EmailMessage[] = Array.from({ length: 1000 }, (_, i) => ({
      id: `${i}`,
      subject: `Email ${i}`,
      content: `Content ${i}`,
      sender: mockSender,
      preview: `Preview ${i}`,
      timestamp: new Date().toISOString(),
      priority: 'MEDIUM',
      is_read: false,
      category: 'inbox',
      processed: false,
      stress_level: 'LOW'
    }));

    const start = performance.now();
    render(<EmailList emails={largeEmailList} />);
    const end = performance.now();

    expect(end - start).toBeLessThan(500); // 500ms budget for 1000 emails
  });
}); 