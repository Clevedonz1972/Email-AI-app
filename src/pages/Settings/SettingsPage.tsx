import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Switch,
  FormControl,
  FormControlLabel,
  Select,
  MenuItem,
  Slider,
  Chip,
  Stack,
  Button,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useSettings, SortCriteria, PriorityFilter } from '../../contexts/SettingsContext';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const SettingsSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const SettingItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2, 0),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
}));

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const navigate = useNavigate();

  const handlePriorityFilterChange = (priority: PriorityFilter) => {
    const newFilters = settings.priorityFilters.includes(priority)
      ? settings.priorityFilters.filter(p => p !== priority)
      : [...settings.priorityFilters, priority];
    updateSettings({ priorityFilters: newFilters });
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton 
            onClick={() => navigate('/')}
            aria-label="Back to emails"
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Settings
          </Typography>
        </Box>

        <SettingsSection>
          <Typography variant="h6" gutterBottom>
            Appearance
          </Typography>
          
          <SettingItem>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.darkMode}
                  onChange={(e) => updateSettings({ darkMode: e.target.checked })}
                  inputProps={{ 'aria-label': 'Dark mode' }}
                />
              }
              label="Dark Mode"
            />
          </SettingItem>

          <SettingItem>
            <Typography>Font Size</Typography>
            <Box sx={{ width: 200 }}>
              <Slider
                value={settings.fontSize}
                min={12}
                max={24}
                step={1}
                onChange={(_, value) => updateSettings({ fontSize: value as number })}
                aria-label="Font size"
                valueLabelDisplay="auto"
              />
            </Box>
          </SettingItem>

          <SettingItem>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.reduceAnimations}
                  onChange={(e) => updateSettings({ reduceAnimations: e.target.checked })}
                  inputProps={{ 'aria-label': 'Reduce animations' }}
                />
              }
              label="Reduce Animations"
            />
          </SettingItem>
        </SettingsSection>

        <SettingsSection>
          <Typography variant="h6" gutterBottom>
            Email Display
          </Typography>

          <SettingItem>
            <Typography>Sort Emails By</Typography>
            <FormControl sx={{ minWidth: 200 }}>
              <Select
                value={settings.sortBy}
                onChange={(e) => updateSettings({ sortBy: e.target.value as SortCriteria })}
                aria-label="Sort emails by"
              >
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="priority">Priority</MenuItem>
                <MenuItem value="sender">Sender</MenuItem>
              </Select>
            </FormControl>
          </SettingItem>

          <SettingItem>
            <Typography>Priority Filters</Typography>
            <Stack direction="row" spacing={1}>
              {(['HIGH', 'MEDIUM', 'LOW'] as PriorityFilter[]).map((priority) => (
                <Chip
                  key={priority}
                  label={priority}
                  onClick={() => handlePriorityFilterChange(priority)}
                  color={settings.priorityFilters.includes(priority) ? 'primary' : 'default'}
                  variant={settings.priorityFilters.includes(priority) ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>
          </SettingItem>
        </SettingsSection>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
          <Button
            variant="outlined"
            onClick={resetSettings}
            aria-label="Reset all settings to default values"
          >
            Reset to Defaults
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              // Save settings to persistent storage
              localStorage.setItem('emailAppSettings', JSON.stringify(settings));
            }}
          >
            Save Changes
          </Button>
        </Box>
      </Box>
    </Container>
  );
}; 