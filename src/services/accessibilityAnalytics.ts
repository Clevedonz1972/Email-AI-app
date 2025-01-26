import { logger } from '../utils/logger';

interface FeatureUsage {
  featureId: string;
  timestamp: number;
  duration?: number;
  successful: boolean;
  context?: string;
}

interface FeatureMetrics {
  totalUses: number;
  successRate: number;
  avgDuration?: number;
  lastUsed: number;
}

class AccessibilityAnalytics {
  private usageData: Map<string, FeatureMetrics> = new Map();

  trackFeatureUsage(usage: FeatureUsage) {
    const existing = this.usageData.get(usage.featureId) || {
      totalUses: 0,
      successRate: 1,
      lastUsed: 0
    };

    const updated: FeatureMetrics = {
      totalUses: existing.totalUses + 1,
      successRate: this.calculateSuccessRate(existing, usage.successful),
      avgDuration: this.updateAverageDuration(existing, usage.duration),
      lastUsed: usage.timestamp
    };

    this.usageData.set(usage.featureId, updated);
    this.logUsageData(usage, updated);
  }

  private calculateSuccessRate(existing: FeatureMetrics, successful: boolean): number {
    const totalAttempts = existing.totalUses + 1;
    const successfulAttempts = (existing.successRate * existing.totalUses) + (successful ? 1 : 0);
    return successfulAttempts / totalAttempts;
  }

  private updateAverageDuration(existing: FeatureMetrics, duration?: number): number | undefined {
    if (!duration) return existing.avgDuration;
    if (!existing.avgDuration) return duration;
    return (existing.avgDuration * existing.totalUses + duration) / (existing.totalUses + 1);
  }

  private logUsageData(usage: FeatureUsage, metrics: FeatureMetrics) {
    logger.log('info', 'Accessibility Feature Usage', {
      feature: usage.featureId,
      metrics,
      context: usage.context
    });
  }

  getFeatureMetrics(featureId: string): FeatureMetrics | undefined {
    return this.usageData.get(featureId);
  }

  generateUsageReport(): Record<string, FeatureMetrics> {
    const report: Record<string, FeatureMetrics> = {};
    this.usageData.forEach((metrics, featureId) => {
      report[featureId] = metrics;
    });
    return report;
  }
}

export const accessibilityAnalytics = new AccessibilityAnalytics(); 