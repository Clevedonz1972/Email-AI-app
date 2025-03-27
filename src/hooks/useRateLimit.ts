import { useState, useCallback, useRef } from 'react';

interface RateLimitConfig {
  maxAttempts: number;
  timeWindow: number; // in milliseconds
  cooldownPeriod: number; // in milliseconds
}

export const useRateLimit = (config: RateLimitConfig) => {
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [cooldownEnd, setCooldownEnd] = useState<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const checkRateLimit = useCallback(() => {
    const now = Date.now();

    if (isBlocked) {
      if (cooldownEnd && now >= cooldownEnd) {
        setIsBlocked(false);
        setAttempts(0);
        setCooldownEnd(null);
      } else {
        return {
          blocked: true,
          remainingTime: cooldownEnd ? cooldownEnd - now : 0
        };
      }
    }

    setAttempts(prev => {
      const newAttempts = prev + 1;
      
      if (newAttempts >= config.maxAttempts) {
        setIsBlocked(true);
        const end = now + config.cooldownPeriod;
        setCooldownEnd(end);
        
        // Reset after cooldown
        timeoutRef.current = setTimeout(() => {
          setIsBlocked(false);
          setAttempts(0);
          setCooldownEnd(null);
        }, config.cooldownPeriod);

        return 0;
      }
      
      // Reset attempts after time window
      setTimeout(() => {
        setAttempts(prev => Math.max(0, prev - 1));
      }, config.timeWindow);

      return newAttempts;
    });

    return { blocked: false, remainingTime: 0 };
  }, [config, isBlocked, cooldownEnd]);

  return {
    checkRateLimit,
    isBlocked,
    attempts,
    cooldownEnd
  };
}; 