import axios from 'axios';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// OpenWeatherMap API key - Replace with your own key in a production environment
// In a real app, this would be stored securely in environment variables
const OPENWEATHER_API_KEY = 'replace_with_your_api_key';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Models
export type TemperatureScale = 'celsius' | 'fahrenheit' | 'kelvin';

export interface WeatherPreferences {
  location: string;
  tempScale: TemperatureScale;
  autoDetect: boolean;
}

export interface WeatherData {
  location: string;
  country: string;
  temperature: number;
  temperatureFeelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  updated: Date;
}

// Mock data for development
const MOCK_WEATHER_DATA: Record<string, WeatherData> = {
  'London': {
    location: 'London',
    country: 'GB',
    temperature: 15, // Celsius by default
    temperatureFeelsLike: 13,
    description: 'Cloudy',
    icon: '04d',
    humidity: 76,
    windSpeed: 5.1,
    updated: new Date()
  },
  'New York': {
    location: 'New York',
    country: 'US',
    temperature: 22, // Celsius by default
    temperatureFeelsLike: 24,
    description: 'Clear sky',
    icon: '01d',
    humidity: 65,
    windSpeed: 3.6,
    updated: new Date()
  },
  'Tokyo': {
    location: 'Tokyo',
    country: 'JP',
    temperature: 26, // Celsius by default
    temperatureFeelsLike: 28,
    description: 'Light rain',
    icon: '10d',
    humidity: 83,
    windSpeed: 4.2,
    updated: new Date()
  },
  'Sydney': {
    location: 'Sydney',
    country: 'AU',
    temperature: 24, // Celsius by default
    temperatureFeelsLike: 25,
    description: 'Sunny',
    icon: '01d',
    humidity: 56,
    windSpeed: 6.7,
    updated: new Date()
  }
};

// Temperature conversion functions
export const convertTemperature = (temp: number, fromScale: TemperatureScale, toScale: TemperatureScale): number => {
  if (fromScale === toScale) return temp;
  
  // First convert to Kelvin as a common intermediate
  let kelvin = temp;
  if (fromScale === 'celsius') {
    kelvin = temp + 273.15;
  } else if (fromScale === 'fahrenheit') {
    kelvin = (temp - 32) * 5/9 + 273.15;
  }
  
  // Then convert from Kelvin to the target scale
  if (toScale === 'celsius') {
    return Math.round((kelvin - 273.15) * 10) / 10;
  } else if (toScale === 'fahrenheit') {
    return Math.round(((kelvin - 273.15) * 9/5 + 32) * 10) / 10;
  }
  
  // Return Kelvin by default
  return Math.round(kelvin * 10) / 10;
};

export const getTemperatureSymbol = (scale: TemperatureScale): string => {
  switch(scale) {
    case 'celsius': return '°C';
    case 'fahrenheit': return '°F';
    case 'kelvin': return 'K';
    default: return '°C';
  }
};

// Weather service implementation
export const weatherService = {
  async getWeather(location: string, scale: TemperatureScale = 'celsius', useMock: boolean = true): Promise<WeatherData> {
    if (useMock) {
      const mockData = MOCK_WEATHER_DATA[location] || MOCK_WEATHER_DATA['London'];
      
      // Return a copy to prevent accidental mutation
      const result = { ...mockData };
      
      // Convert temperature to requested scale
      if (scale !== 'celsius') {
        result.temperature = convertTemperature(result.temperature, 'celsius', scale);
        result.temperatureFeelsLike = convertTemperature(result.temperatureFeelsLike, 'celsius', scale);
      }
      
      return result;
    }
    
    try {
      const response = await axios.get(OPENWEATHER_BASE_URL, {
        params: {
          q: location,
          appid: OPENWEATHER_API_KEY,
          units: scale === 'celsius' ? 'metric' : scale === 'fahrenheit' ? 'imperial' : 'standard'
        }
      });
      
      const data = response.data;
      
      return {
        location: data.name,
        country: data.sys.country,
        temperature: data.main.temp,
        temperatureFeelsLike: data.main.feels_like,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        updated: new Date()
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw new Error('Failed to fetch weather data. Please try again later.');
    }
  },
  
  getDefaultPreferences(): WeatherPreferences {
    return {
      location: 'London',
      tempScale: 'celsius',
      autoDetect: false
    };
  },
  
  // Function to get weather icon URL
  getWeatherIconUrl(iconCode: string): string {
    return `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
  },
  
  // Function to get a weather recommendation based on conditions
  getWeatherRecommendation(data: WeatherData, scale: TemperatureScale): string {
    // Convert to celsius for consistent logic
    const tempC = scale === 'celsius' 
      ? data.temperature 
      : convertTemperature(data.temperature, scale, 'celsius');
    
    const description = data.description.toLowerCase();
    
    if (description.includes('rain') || description.includes('shower')) {
      return 'Don\'t forget your umbrella today! ☔';
    }
    
    if (description.includes('snow')) {
      return 'Bundle up and watch for snow today! ❄️';
    }
    
    if (tempC < 5) {
      return 'It\'s very cold today. Wear a heavy coat! 🧥';
    }
    
    if (tempC < 15) {
      return 'A bit cool today. Maybe bring a light jacket! 🧥';
    }
    
    if (tempC > 30) {
      return 'It\'s very hot today. Stay hydrated! 💧';
    }
    
    if (tempC > 25) {
      return 'Warm weather today. Dress lightly! 👕';
    }
    
    if (description.includes('clear') || description.includes('sunny')) {
      return 'Beautiful weather today. Enjoy the sunshine! ☀️';
    }
    
    return 'Have a great day!';
  }
};

// Custom hook for weather preferences
export const useWeatherPreferences = () => {
  const [preferences, setPreferences] = useLocalStorage<WeatherPreferences>(
    'weather-preferences',
    weatherService.getDefaultPreferences()
  );
  
  const updatePreferences = (newPreferences: Partial<WeatherPreferences>) => {
    setPreferences(prev => ({
      ...prev,
      ...newPreferences
    }));
  };
  
  return {
    preferences,
    updatePreferences
  };
}; 