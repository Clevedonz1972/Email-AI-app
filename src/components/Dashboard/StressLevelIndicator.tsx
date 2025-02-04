import React from 'react';
import { Box, Typography, Chip, Tooltip, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface StressLevelIndicatorProps {
  onFilterChange: (level: string) => void;
  currentFilter: string;
}

const StressChip = styled(Chip)<{ stressLevel: string }>(({ theme, stressLevel }) => {
  const colors = {
    high: theme.palette.error.main,
    medium: theme.palette.warning.main,
    low: theme.palette.success.main,
    all: theme.palette.primary.main,
  };

  return {
    margin: theme.spacing(0.5),
    '&.MuiChip-root': {
      borderColor: colors[stressLevel],
      color: colors[stressLevel],
      '&.Mui-selected': {
        backgroundColor: colors[stressLevel],
        color: theme.palette.common.white,
      },
    },
    '&:hover': {
      backgroundColor: `${colors[stressLevel]}22`,
    },
    transition: 'all 0.3s ease',
  };
});

const InfoIcon = styled(InfoOutlinedIcon)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  cursor: 'help',
  fontSize: '1.2rem',
}));

export const StressLevelIndicator: React.FC<StressLevelIndicatorProps> = ({
  onFilterChange,
  currentFilter,
}) => {
  const theme = useTheme();

  const stressLevels = [
    {
      level: 'all',
      label: 'All Emails',
      icon: null,
      description: 'View all emails regardless of stress level',
    },
    {
      level: 'high',
      label: 'High Stress',
      icon: <ErrorOutlineIcon />,
      description: 'Emails that may require immediate attention or cause anxiety',
    },
    {
      level: 'medium',
      label: 'Medium Stress',
      icon: <InfoOutlinedIcon />,
      description: 'Emails that need attention but aren\'t urgent',
    },
    {
      level: 'low',
      label: 'Low Stress',
      icon: <CheckCircleOutlineIcon />,
      description: 'Routine or non-urgent emails',
    },
  ];

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        <Typography variant="h6">Stress Levels</Typography>
        <Tooltip title="Filter emails by their stress level to manage your inbox more effectively">
          <InfoIcon color="action" />
        </Tooltip>
      </Box>

      <Box display="flex" flexWrap="wrap" gap={1}>
        {stressLevels.map(({ level, label, icon, description }) => (
          <Tooltip key={level} title={description} arrow>
            <StressChip
              stressLevel={level}
              label={label}
              icon={icon}
              variant={currentFilter === level ? "filled" : "outlined"}
              onClick={() => onFilterChange(level)}
              clickable
              aria-label={`Filter by ${label}`}
            />
          </Tooltip>
        ))}
      </Box>

      {currentFilter !== 'all' && (
        <Typography 
          variant="body2" 
          color="textSecondary" 
          mt={2}
          role="status"
          aria-live="polite"
        >
          Showing {currentFilter} stress level emails
        </Typography>
      )}
    </Box>
  );
}; 