import { ReportHandler } from 'web-vitals';
import * as Sentry from '@sentry/react';

interface PerformanceMetrics {
  FCP: number;  // First Contentful Paint
  LCP: number;  // Largest Contentful Paint
  FID: number;  // First Input Delay
  CLS: number;  // Cumulative Layout Shift
  TTFB: number; // Time to First Byte
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    FCP: 0,
    LCP: 0,
    FID: 0,
    CLS: 0,
    TTFB: 0
  };

  init() {
    // Monitor web vitals
    reportWebVitals(this.handleVitals);

    // Monitor user interactions
    this.setupInteractionMonitoring();

    // Monitor errors
    this.setupErrorMonitoring();
  }

  private handleVitals: ReportHandler = (metric) => {
    // Update metrics
    this.metrics[metric.name] = metric.value;

    // Send to analytics
    this.reportMetric(metric);

    // Check against thresholds
    this.checkThresholds(metric);
  };

  private setupInteractionMonitoring() {
    // Monitor focus times
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 5000) {  // Long task threshold
          this.reportLongTask(entry);
        }
      });
    });

    observer.observe({ entryTypes: ['longtask'] });
  }

  private checkThresholds(metric: any) {
    const thresholds = {
      FCP: 2000,  // 2 seconds
      LCP: 2500,  // 2.5 seconds
      FID: 100,   // 100ms
      CLS: 0.1,   // 0.1
      TTFB: 600   // 600ms
    };

    if (metric.value > thresholds[metric.name]) {
      this.reportThresholdViolation(metric);
    }
  }

  private reportMetric(metric: any) {
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureMessage('Performance Metric', {
        level: 'info',
        extra: {
          metricName: metric.name,
          value: metric.value,
          rating: metric.rating
        }
      });
    }
  }
}

export const performanceMonitor = new PerformanceMonitor(); 