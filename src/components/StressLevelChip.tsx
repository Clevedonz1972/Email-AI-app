import { styled } from '@mui/material/styles';
import { Chip } from '@mui/material';
import { colors, StressLevel } from '../theme/theme';

interface StressChipProps {
  stressLevel: StressLevel;
}

export const StressLevelChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'stressLevel'
})<StressChipProps>(({ theme, stressLevel }) => ({
  margin: theme.spacing(0.5),
  '&.MuiChip-root': {
    borderColor: colors[stressLevel],
    color: colors[stressLevel],
    '&.Mui-selected': {
      backgroundColor: colors[stressLevel],
    }
  }
})); 