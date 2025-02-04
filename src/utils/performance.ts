import { ReportHandler } from 'web-vitals';

const vitalsUrl = 'https://vitals.vercel-analytics.com/v1/vitals';

function getConnectionSpeed() {
  const navigator = window.navigator as any;
  if (navigator.connection) {
    return navigator.connection.effectiveType;
  }
  return 'unknown';
}

const sendToAnalytics = (metric: any, options?: { debug?: boolean }) => {
  const body = {
    dsn: process.env.REACT_APP_VERCEL_ANALYTICS_ID,
    id: metric.id,
    page: window.location.pathname,
    href: window.location.href,
    event_name: metric.name,
    value: metric.value.toString(),
    speed: getConnectionSpeed(),
  };

  if (process.env.NODE_ENV === 'development' && options?.debug) {
    console.log('[Performance]', body);
    return;
  }

  const blob = new Blob([new URLSearchParams(body).toString()], {
    type: 'application/x-www-form-urlencoded',
  });
  if (navigator.sendBeacon) {
    navigator.sendBeacon(vitalsUrl, blob);
  } else {
    fetch(vitalsUrl, {
      body: blob,
      method: 'POST',
      credentials: 'omit',
      keepalive: true,
    });
  }
};

export function reportWebVitals(onPerfEntry?: ReportHandler) {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
}

export const initializePerformanceMonitoring = () => {
  reportWebVitals(sendToAnalytics);
};

export const measurePerformance = (componentName: string) => {
  const start = performance.now();
  return () => {
    const end = performance.now();
    const duration = end - start;
    
    // Send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Google Analytics
      window.gtag?.('event', 'performance', {
        event_category: 'Component Render',
        event_label: componentName,
        value: Math.round(duration)
      });
    }
  };
}; 