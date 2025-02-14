import React from 'react';
import { render } from '@testing-library/react';
import { EmailComposer } from '../EmailComposer';
import { mockSender } from '../../../test-utils/test-utils';

describe('EmailComposer', () => {
  const defaultProps = {
    initialValues: {
      subject: 'Test',
      content: 'Test content',
      sender: mockSender  // Use proper EmailSender object
    },
    onSend: async () => {}
  };

  it('renders correctly', () => {
    render(<EmailComposer {...defaultProps} />);
  });
}); 