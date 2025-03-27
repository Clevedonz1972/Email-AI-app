import { ReportHandler } from 'web-vitals';
import * as Sentry from '@sentry/react';
import { reportWebVitals } from '../performance';

type MetricName = 'FCP' | 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'INP';

interface PerformanceMetrics {
  FCP: number;  // First Contentful Paint
  LCP: number;  // Largest Contentful Paint
  FID: number;  // First Input Delay
  CLS: number;  // Cumulative Layout Shift
  TTFB: number; // Time to First Byte
  INP: number;  // Interaction to Next Paint
}

interface PerformanceMetric {
  name: MetricName;
  value: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    FCP: 0,
    LCP: 0,
    FID: 0,
    CLS: 0,
    TTFB: 0,
    INP: 0
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
    const name = metric.name as MetricName;
    // Update metrics
    this.metrics[name] = metric.value;

    // Send to analytics
    this.reportMetric(metric as PerformanceMetric);

    // Check against thresholds
    this.checkThresholds(metric as PerformanceMetric);
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

  private setupErrorMonitoring() {
    window.addEventListener('error', (event) => {
      this.reportError(event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.reportError(event.reason);
    });
  }

  private checkThresholds(metric: PerformanceMetric) {
    const thresholds: Record<MetricName, number> = {
      FCP: 2000,  // 2 seconds
      LCP: 2500,  // 2.5 seconds
      FID: 100,   // 100ms
      CLS: 0.1,   // 0.1
      TTFB: 600,  // 600ms
      INP: 200    // 200ms
    };

    if (metric.value > thresholds[metric.name]) {
      this.reportThresholdViolation(metric);
    }
  }

  private reportMetric(metric: PerformanceMetric) {
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

  private reportLongTask(entry: PerformanceEntry) {
    Sentry.captureMessage('Long Task Detected', {
      level: 'warning',
      extra: {
        duration: entry.duration,
        startTime: entry.startTime,
        name: entry.name
      }
    });
  }

  private reportThresholdViolation(metric: PerformanceMetric) {
    Sentry.captureMessage('Performance Threshold Violation', {
      level: 'warning',
      extra: {
        metric: metric.name,
        value: metric.value,
        rating: metric.rating
      }
    });
  }

  private reportError(error: Error | unknown) {
    Sentry.captureException(error, {
      tags: {
        type: 'performance_error'
      }
    });
  }
}

export const performanceMonitor = new PerformanceMonitor(); 