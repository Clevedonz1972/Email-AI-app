import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Popover,
  TextField,
  Button,
  CircularProgress,
  Autocomplete,
  SelectChangeEvent,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  WbSunny as SunnyIcon,
  Cloud as CloudIcon,
  Opacity as RainIcon,
  AcUnit as SnowIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { 
  weatherService, 
  useWeatherPreferences, 
  WeatherData,
  TemperatureScale,
  getTemperatureSymbol 
} from '@/services/weatherService';

// Popular cities for the location dropdown
const POPULAR_LOCATIONS = [
  'London',
  'New York',
  'Tokyo',
  'Sydney',
  'Paris',
  'Berlin',
  'Moscow',
  'Toronto',
  'Cape Town',
  'Dubai',
  'Singapore'
];

// Temperature scale information
const TEMPERATURE_SCALE_INFO = {
  celsius: {
    name: 'Celsius (°C)',
    description: 'Developed by Anders Celsius in 1742. In the Celsius scale, water freezes at 0°C and boils at 100°C at standard atmospheric pressure.',
    funFacts: [
      'Originally, Celsius proposed a scale where 0° was the boiling point and 100° was the freezing point of water, which was reversed after his death.',
      'The Celsius scale used to be called "centigrade" until 1948 when it was renamed to honor Anders Celsius.',
      'Most countries around the world use the Celsius scale for everyday temperature measurement.'
    ]
  },
  fahrenheit: {
    name: 'Fahrenheit (°F)',
    description: 'Created by Daniel Gabriel Fahrenheit in 1724. In the Fahrenheit scale, water freezes at 32°F and boils at 212°F at standard atmospheric pressure.',
    funFacts: [
      'Fahrenheit based his scale on three reference points: 0°F was the temperature of a mixture of ice, water, and ammonium chloride; 32°F was the freezing point of water; and 96°F was approximately human body temperature.',
      'The United States is one of the few countries that still uses Fahrenheit for everyday temperature measurement.',
      'Fahrenheit developed the first mercury thermometer, which allowed for more accurate temperature readings.'
    ]
  },
  kelvin: {
    name: 'Kelvin (K)',
    description: 'Established by William Thomson, 1st Baron Kelvin, in 1848. The Kelvin scale is an absolute temperature scale that starts at absolute zero (−273.15°C), the theoretical point where all thermal motion ceases.',
    funFacts: [
      'The Kelvin scale doesn\'t use "degrees" - temperatures are simply expressed as Kelvins (e.g., 273.15 K).',
      'The size of one Kelvin is identical to the size of one degree Celsius.',
      'Kelvin is the primary unit of temperature measurement in the scientific community and is one of the seven base units in the International System of Units (SI).',
      'At absolute zero (0 K), all molecular motion theoretically stops, though quantum effects still create some minimal energy.'
    ]
  }
};

interface WeatherWidgetProps {
  compact?: boolean; // Option for a more compact display
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ compact = false }) => {
  const { preferences, updatePreferences } = useWeatherPreferences();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<HTMLDivElement | null>(null);
  const [selectedLocation, setSelectedLocation] = useState(preferences.location);
  const [selectedTempScale, setSelectedTempScale] = useState<TemperatureScale>(preferences.tempScale);
  const [scaleInfoOpen, setScaleInfoOpen] = useState(false);

  const settingsOpen = Boolean(settingsAnchorEl);

  // Fetch weather data
  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await weatherService.getWeather(preferences.location, preferences.tempScale);
      setWeatherData(data);
    } catch (err) {
      setError('Could not load weather data');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchWeather();
    // Refresh weather data every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [preferences.location, preferences.tempScale]);

  // Settings popover handlers
  const handleSettingsClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };

  const handleSaveSettings = () => {
    updatePreferences({
      location: selectedLocation,
      tempScale: selectedTempScale
    });
    handleSettingsClose();
  };
  
  const handleOpenScaleInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScaleInfoOpen(true);
  };

  const handleCloseScaleInfo = () => {
    setScaleInfoOpen(false);
  };

  // Icon selection based on weather description
  const getWeatherIcon = () => {
    if (!weatherData) return <CloudIcon />;
    
    const description = weatherData.description.toLowerCase();
    
    if (description.includes('rain') || description.includes('shower')) {
      return <RainIcon />;
    }
    if (description.includes('snow')) {
      return <SnowIcon />;
    }
    if (description.includes('clear') || description.includes('sunny')) {
      return <SunnyIcon />;
    }
    return <CloudIcon />;
  };

  // Helper function to format temperature
  const formatTemperature = (temp: number): string => {
    return `${Math.round(temp)}${getTemperatureSymbol(preferences.tempScale)}`;
  };

  // Render the widget
  return (
    <Paper 
      sx={{ 
        p: compact ? 1 : 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        mb: 3,
        bgcolor: '#333',
        color: '#fff',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        '&:hover': {
          bgcolor: '#444'
        }
      }}
      onClick={handleSettingsClick}
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 1 }}>
          <CircularProgress size={24} sx={{ color: '#fff' }} />
        </Box>
      ) : error ? (
        <Box sx={{ color: 'error.main', width: '100%', textAlign: 'center' }}>
          {error}
        </Box>
      ) : weatherData && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationIcon sx={{ mr: 0.5, color: '#fff' }} />
            <Typography variant="body1" sx={{ mr: 2, color: '#fff' }}>
              {weatherData.location}, {weatherData.country}
            </Typography>
            {getWeatherIcon()}
            <Typography variant="body1" sx={{ ml: 1, color: '#fff' }}>
              {formatTemperature(weatherData.temperature)} {weatherData.description}
            </Typography>
          </Box>
          
          {!compact && (
            <Box>
              <Typography variant="body2" sx={{ color: '#ccc' }}>
                {weatherService.getWeatherRecommendation(weatherData, preferences.tempScale)}
              </Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Click to change settings">
              <Typography variant="caption" sx={{ color: '#ccc', fontSize: '12px' }}>
                Click to change settings
              </Typography>
            </Tooltip>
          </Box>
          
          {/* Settings Popover */}
          <Popover
            open={settingsOpen}
            anchorEl={settingsAnchorEl}
            onClose={handleSettingsClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box sx={{ p: 3, width: 300 }}>
              <Typography variant="h6" gutterBottom>
                Weather Settings
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Autocomplete
                  value={selectedLocation}
                  onChange={(_, newValue) => {
                    if (newValue) setSelectedLocation(newValue);
                  }}
                  inputValue={selectedLocation}
                  onInputChange={(_, newInputValue) => {
                    setSelectedLocation(newInputValue);
                  }}
                  options={POPULAR_LOCATIONS}
                  freeSolo
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Location"
                      placeholder="Enter city name"
                      fullWidth
                      margin="normal"
                    />
                  )}
                />
              </Box>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <InputLabel id="temp-scale-label">Temperature Scale</InputLabel>
                  <Tooltip title="Learn about temperature scales">
                    <IconButton 
                      size="small" 
                      onClick={handleOpenScaleInfo}
                      sx={{ ml: 1 }}
                    >
                      <InfoIcon fontSize="small" color="info" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Select
                  labelId="temp-scale-label"
                  value={selectedTempScale}
                  label="Temperature Scale"
                  onChange={(e: SelectChangeEvent<string>) => 
                    setSelectedTempScale(e.target.value as TemperatureScale)
                  }
                >
                  <MenuItem value="celsius">Celsius (°C)</MenuItem>
                  <MenuItem value="fahrenheit">Fahrenheit (°F)</MenuItem>
                  <MenuItem value="kelvin">Kelvin (K)</MenuItem>
                </Select>
              </FormControl>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={handleSettingsClose} sx={{ mr: 1 }}>
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleSaveSettings}
                  disabled={!selectedLocation}
                >
                  Save
                </Button>
              </Box>
            </Box>
          </Popover>
          
          {/* Temperature Scale Info Dialog */}
          <Dialog
            open={scaleInfoOpen}
            onClose={handleCloseScaleInfo}
            maxWidth="md"
            aria-labelledby="temperature-scales-dialog-title"
          >
            <DialogTitle id="temperature-scales-dialog-title">
              Temperature Scales Explained
            </DialogTitle>
            <DialogContent dividers>
              {Object.entries(TEMPERATURE_SCALE_INFO).map(([scale, info]) => (
                <Box key={scale} sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom color="primary">
                    {info.name}
                  </Typography>
                  
                  <Typography variant="body1" paragraph>
                    {info.description}
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom color="secondary">
                    Interesting Facts:
                  </Typography>
                  
                  <Box component="ul" sx={{ pl: 2 }}>
                    {info.funFacts.map((fact, index) => (
                      <Typography component="li" key={index} variant="body2" paragraph>
                        {fact}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              ))}
              
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="info.main">
                  Conversion Formulas:
                </Typography>
                <Typography variant="body2" component="div">
                  <ul>
                    <li>Celsius to Fahrenheit: °F = (°C × 9/5) + 32</li>
                    <li>Fahrenheit to Celsius: °C = (°F − 32) × 5/9</li>
                    <li>Celsius to Kelvin: K = °C + 273.15</li>
                    <li>Kelvin to Celsius: °C = K − 273.15</li>
                    <li>Fahrenheit to Kelvin: K = (°F − 32) × 5/9 + 273.15</li>
                    <li>Kelvin to Fahrenheit: °F = (K − 273.15) × 9/5 + 32</li>
                  </ul>
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseScaleInfo} color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Paper>
  );
}; 