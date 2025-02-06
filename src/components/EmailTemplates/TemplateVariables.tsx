import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Grid
} from '@mui/material';

interface TemplateVariablesProps {
  variables: string[];  // Now it's a string array
  setVariables: (variables: Record<string, string>) => void;
}

export const TemplateVariables: React.FC<TemplateVariablesProps> = ({
  variables,
  setVariables
}) => {
  React.useEffect(() => {
    // Convert string array to Record
    const initialVariables: Record<string, string> = {};
    variables.forEach(variableName => {  // Use the string directly
      initialVariables[variableName] = '';
    });
    setVariables(initialVariables);
  }, [variables, setVariables]);

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Template Variables
      </Typography>
      <Grid container spacing={2}>
        {variables.map((variableName) => (
          <Grid item xs={12} key={variableName}>
            <Typography variant="caption" color="textSecondary">
              {variableName}
            </Typography>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}; 