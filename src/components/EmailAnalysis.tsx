import { useAI } from '../hooks/useAI';
import { Alert, Progress, Button } from '../components/ui';

export const EmailAnalysis: React.FC<{email: Email}> = ({ email }) => {
  const { analyze, loading, error } = useAI();
  
  return (
    <div role="region" aria-label="Email Analysis">
      {loading && (
        <div aria-live="polite">
          <Progress 
            value={loading.progress} 
            aria-label="Analysis in progress"
          />
          <p className="text-sm">Analyzing email... {loading.progress}%</p>
        </div>
      )}
      
      {error && (
        <Alert 
          variant="error"
          aria-live="assertive"
          action={
            <Button onClick={() => analyze(email)}>
              Try Again
            </Button>
          }
        >
          {error.message}
        </Alert>
      )}
      
      {/* Analysis Results */}
    </div>
  );
}; 