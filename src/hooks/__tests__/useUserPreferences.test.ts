import { renderHook, act } from '@testing-library/react';
import { useUserPreferences } from '../useUserPreferences';

describe('useUserPreferences', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('should load default preferences', () => {
    const { result } = renderHook(() => useUserPreferences());
    
    expect(result.current.preferences).toEqual({
      reduceMotion: false,
      highContrast: false,
      enableSound: false,
      largeText: false
    });
  });

  it('should update preferences', () => {
    const { result } = renderHook(() => useUserPreferences());

    act(() => {
      result.current.updatePreference('reduceMotion', true);
    });

    expect(result.current.preferences.reduceMotion).toBe(true);
    expect(document.documentElement.classList.contains('reduce-motion')).toBe(true);
  });
}); 