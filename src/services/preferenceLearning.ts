import { logger } from '../utils/logger';

interface UserBehavior {
  timestamp: number;
  action: string;
  context: string;
  duration?: number;
  successful: boolean;
}

interface PreferenceRecommendation {
  setting: string;
  value: any;
  confidence: number;
  reason: string;
}

class PreferenceLearningService {
  private behaviors: UserBehavior[] = [];
  private readonly ANALYSIS_THRESHOLD = 10;

  trackBehavior(behavior: UserBehavior) {
    this.behaviors.push(behavior);
    logger.log('info', 'User Behavior Tracked', { behavior });

    if (this.behaviors.length >= this.ANALYSIS_THRESHOLD) {
      this.analyzePreferences();
    }
  }

  private analyzePreferences(): PreferenceRecommendation[] {
    const recommendations: PreferenceRecommendation[] = [];

    // Analyze reading speed
    const readingBehaviors = this.behaviors.filter(b => b.context === 'reading');
    if (readingBehaviors.length > 0) {
      const avgDuration = readingBehaviors.reduce((acc, curr) => acc + (curr.duration || 0), 0) / readingBehaviors.length;
      recommendations.push(this.getReadingSpeedRecommendation(avgDuration));
    }

    // Analyze error patterns
    const errorRate = this.behaviors.filter(b => !b.successful).length / this.behaviors.length;
    if (errorRate > 0.2) {
      recommendations.push({
        setting: 'reducedMotion',
        value: true,
        confidence: 0.8,
        reason: 'High error rate detected, suggesting possible distraction from animations'
      });
    }

    logger.log('info', 'Preference Analysis Complete', { recommendations });
    return recommendations;
  }

  private getReadingSpeedRecommendation(avgDuration: number): PreferenceRecommendation {
    // Example thresholds - adjust based on real user data
    if (avgDuration > 5000) {
      return {
        setting: 'textSpacing',
        value: 'increased',
        confidence: 0.7,
        reason: 'User shows pattern of slower reading speed'
      };
    }
    return {
      setting: 'textSpacing',
      value: 'normal',
      confidence: 0.6,
      reason: 'User shows comfortable reading speed'
    };
  }
}

export const preferenceLearning = new PreferenceLearningService(); 