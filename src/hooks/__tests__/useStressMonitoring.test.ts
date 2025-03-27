import { renderHook } from '@testing-library/react-hooks';
import { useStressMonitoring } from '../useStressMonitoring';
import { mockEmails } from '@/test/utils/mockData';

describe('useStressMonitoring', () => {
  it('calculates stress levels correctly', () => {
    const { result } = renderHook(() => useStressMonitoring(mockEmails));
    
    expect(result.current.overallStressLevel).toBeDefined();
    expect(result.current.needsBreak).toBeDefined();
    expect(result.current.highPriorityCount).toBeGreaterThanOrEqual(0);
  });

  it('suggests breaks when stress is high', () => {
    const highStressEmails = Array(5).fill({
      ...mockEmails[0],
      stress_level: 'HIGH'
    });

    const { result } = renderHook(() => useStressMonitoring(highStressEmails));
    
    expect(result.current.needsBreak).toBe(true);
    expect(result.current.overallStressLevel).toBe('HIGH');
  });
}); 