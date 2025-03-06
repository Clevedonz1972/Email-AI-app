import { renderHook, act } from '@testing-library/react-hooks';
import { useFocusAssistance } from '../../hooks/useFocusAssistance';

jest.useFakeTimers();

describe('useFocusAssistance', () => {
  it('should initialize with default settings', () => {
    const { result } = renderHook(() => useFocusAssistance());
    
    expect(result.current.settings).toEqual({
      readingGuide: false,
      highlightCurrentLine: true,
      dimSurroundingText: false,
      readingSpeed: 'medium',
      autoBreaks: true,
      focusTimeLimit: 25
    });
  });

  it('should trigger break after focus time limit', () => {
    const { result } = renderHook(() => useFocusAssistance());
    
    act(() => {
      jest.advanceTimersByTime(25 * 60 * 1000); // 25 minutes
    });

    expect(result.current.needsBreak).toBe(true);
  });

  it('should reset break state', () => {
    const { result } = renderHook(() => useFocusAssistance());
    
    act(() => {
      jest.advanceTimersByTime(25 * 60 * 1000);
      result.current.resetBreak();
    });

    expect(result.current.needsBreak).toBe(false);
  });
}); 