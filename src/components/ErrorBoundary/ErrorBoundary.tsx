import React, { Component, ErrorInfo } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { logError } from '@/utils/errorHandling';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error?.message || 'An unexpected error occurred'
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const errorMessage = error?.message ?? 'An unexpected error occurred';
    this.setState({
      hasError: true,
      errorMessage
    });
    
    // Handle potential null componentStack
    const componentStack = errorInfo.componentStack ?? undefined;
    logError(error, { componentStack });
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      errorMessage: null 
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          p={3}
          textAlign="center"
        >
          <Typography variant="h5" color="error" gutterBottom>
            Something went wrong
          </Typography>
          <Typography color="textSecondary" paragraph>
            {this.state.errorMessage}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleReset}
          >
            Try Again
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 