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
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  useSettings, 
  SortCriteria, 
  PriorityFilter, 
  StressSensitivity, 
  BreakReminderFrequency 
} from '../../contexts/SettingsContext';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import InfoIcon from '@mui/icons-material/Info';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

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

const priorityTooltips: Record<Exclude<PriorityFilter, 'ALL'>, string> = {
  HIGH: "Show high-priority emails that need immediate attention. Useful during focused work sessions.",
  MEDIUM: "Show medium-priority emails for regular task processing. Good for standard work hours.",
  LOW: "Show low-priority emails for when you have extra time. Perfect for end-of-day cleanup."
};

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { preferences, updatePreferences } = useAccessibility();
  const navigate = useNavigate();

  const handlePriorityFilterChange = (priority: Exclude<PriorityFilter, 'ALL'>) => {
    const newFilters = settings.priorityFilters.includes(priority)
      ? settings.priorityFilters.filter(p => p !== priority)
      : [...settings.priorityFilters, priority];
    updateSettings({ priorityFilters: newFilters });
  };

  const handleDarkModeChange = (checked: boolean) => {
    // Update both contexts for compatibility
    updateSettings({ ...settings, darkMode: checked });
    updatePreferences({ colorScheme: checked ? 'dark' : 'light' });
  };

  const priorityOptions: Array<Exclude<PriorityFilter, 'ALL'>> = ['HIGH', 'MEDIUM', 'LOW'];

  const resetAllTooltips = () => {
    // Find all tooltip keys in localStorage and reset them
    const keys = Object.keys(localStorage);
    const tooltipKeys = keys.filter(k => k.startsWith('tooltip_dismissed_'));
    
    tooltipKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Show confirmation
    alert(`Reset ${tooltipKeys.length} dismissed tooltip(s). Tooltips will now appear again when you hover over info icons.`);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton 
            onClick={() => navigate('/dashboard')}
            aria-label="Back to dashboard"
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
                  checked={preferences.colorScheme === 'dark'}
                  onChange={(e) => handleDarkModeChange(e.target.checked)}
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
            Stress Management & Neurodiversity Support
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              These settings are specifically designed to help neurodiverse users (ADHD, autism, anxiety) 
              manage stress and navigate communications more effectively.
            </Typography>
          </Box>
          
          <SettingItem>
            <Box>
              <Typography>Stress Sensitivity</Typography>
              <Typography variant="body2" color="text.secondary">
                Adjusts how the app identifies potentially stressful content
              </Typography>
            </Box>
            <FormControl sx={{ minWidth: 200 }}>
              <Select
                value={settings.stressSensitivity || "MEDIUM"}
                onChange={(e) => updateSettings({ stressSensitivity: e.target.value as StressSensitivity })}
                aria-label="Stress sensitivity level"
              >
                <MenuItem value="LOW">Low (Only flag major stressors)</MenuItem>
                <MenuItem value="MEDIUM">Medium (Balanced detection)</MenuItem>
                <MenuItem value="HIGH">High (Flag subtle stressors)</MenuItem>
              </Select>
            </FormControl>
          </SettingItem>
          
          <SettingItem>
            <Box>
              <Typography>Cognitive Load Reduction</Typography>
              <Typography variant="body2" color="text.secondary">
                Simplifies complex emails to reduce cognitive processing demands
              </Typography>
            </Box>
            <FormControl>
              <Switch
                checked={settings.cognitiveLoadReduction || false}
                onChange={(e) => updateSettings({ cognitiveLoadReduction: e.target.checked })}
                inputProps={{ 'aria-label': 'Cognitive load reduction' }}
              />
            </FormControl>
          </SettingItem>
          
          <SettingItem>
            <Box>
              <Typography>Break Reminders</Typography>
              <Typography variant="body2" color="text.secondary">
                Set frequency of break reminders during high-stress periods
              </Typography>
            </Box>
            <FormControl sx={{ minWidth: 200 }}>
              <Select
                value={settings.breakReminderFrequency || "AS_NEEDED"}
                onChange={(e) => updateSettings({ breakReminderFrequency: e.target.value as BreakReminderFrequency })}
                aria-label="Break reminder frequency"
              >
                <MenuItem value="DISABLED">Disabled</MenuItem>
                <MenuItem value="AS_NEEDED">As Needed (Based on stress)</MenuItem>
                <MenuItem value="HOURLY">Hourly Reminder</MenuItem>
                <MenuItem value="FREQUENT">Every 30 Minutes</MenuItem>
              </Select>
            </FormControl>
          </SettingItem>
          
          <SettingItem>
            <Box>
              <Typography>Task Breakdown Assistance</Typography>
              <Typography variant="body2" color="text.secondary">
                AI helps break down complex email requests into manageable tasks
              </Typography>
            </Box>
            <FormControl>
              <Switch
                checked={settings.taskBreakdownAssistance || true}
                onChange={(e) => updateSettings({ taskBreakdownAssistance: e.target.checked })}
                inputProps={{ 'aria-label': 'Task breakdown assistance' }}
              />
            </FormControl>
          </SettingItem>
          
          <SettingItem>
            <Box>
              <Typography>Anxiety Triggers</Typography>
              <Typography variant="body2" color="text.secondary">
                Customize words that may trigger anxiety or overwhelm
              </Typography>
            </Box>
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => {
                // This would open a dialog to manage anxiety triggers
                // For now we'll just add a sample list
                updateSettings({ 
                  anxietyTriggers: [
                    "urgent", "ASAP", "immediately", "deadline", "overdue", "critical"
                  ] 
                });
              }}
            >
              Manage Triggers
            </Button>
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
            <Box>
              <Typography gutterBottom>Priority Filters</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select which priority levels to display. You can show/hide different priorities to focus on specific tasks.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              {priorityOptions.map((priority) => (
                <Tooltip 
                  key={priority}
                  title={priorityTooltips[priority]}
                  arrow
                  placement="top"
                >
                  <Chip
                    label={priority}
                    onClick={() => handlePriorityFilterChange(priority)}
                    color={settings.priorityFilters.includes(priority) ? 'primary' : 'default'}
                    variant={settings.priorityFilters.includes(priority) ? 'filled' : 'outlined'}
                  />
                </Tooltip>
              ))}
            </Stack>
          </SettingItem>
        </SettingsSection>

        <SettingsSection>
          <Typography variant="h6" gutterBottom>
            Help & Accessibility
          </Typography>

          <SettingItem>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <InfoIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography>Tooltip Help</Typography>
            </Box>
            <Button 
              variant="outlined" 
              startIcon={<RestartAltIcon />}
              onClick={resetAllTooltips}
              size="small"
            >
              Reset All Tooltips
            </Button>
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