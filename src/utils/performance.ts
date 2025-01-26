import { ReportHandler } from 'web-vitals';

const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
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