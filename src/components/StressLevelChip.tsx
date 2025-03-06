import { styled } from '@mui/material/styles';
import { Chip } from '@mui/material';
import { colors, StressLevel } from '@/theme/index';

interface StressChipProps {
  stressLevel: StressLevel;
}

export const StressLevelChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'stressLevel'
})<StressChipProps>(({ theme, stressLevel }) => ({
  margin: theme.spacing(0.5),
  '&.MuiChip-root': {
    borderColor: colors.stress[stressLevel],
    color: colors.stress[stressLevel],
    '&.Mui-selected': {
      backgroundColor: colors.stress[stressLevel],
    }
  }
})); 