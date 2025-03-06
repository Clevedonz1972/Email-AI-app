import { useAI } from '../hooks/useAI';
import { Alert, Progress, Button } from '../components/ui';
import type { EmailMessage } from '../types/email';

export const EmailAnalysis: React.FC<{email: EmailMessage}> = ({ email }) => {
  const { analyzeEmail, isLoading, userErrorMessage } = useAI();
  
  return (
    <div role="region" aria-label="Email Analysis">
      {isLoading && (
        <div aria-live="polite">
          <Progress 
            value={50} 
            aria-label="Analysis in progress"
          />
          <p className="text-sm">Analyzing email...</p>
        </div>
      )}
      
      {userErrorMessage && (
        <Alert 
          severity="error"
          aria-live="assertive"
          action={
            <Button onClick={() => analyzeEmail(email.content)}>
              Try Again
            </Button>
          }
        >
          {userErrorMessage}
        </Alert>
      )}
      
      {/* Analysis Results */}
    </div>
  );
}; 