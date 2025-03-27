import { testUsers, testScenarios, testMetrics, TestUser } from '../setup/testConfig';

interface TestResult {
  userId: string;
  scenarioId: string;
  taskResults: {
    taskName: string;
    completed: boolean;
    timeSpent: number;
    errorCount: number;
    satisfactionScore?: number;
  }[];
  feedback: string;
  accessibilityIssues: string[];
}

export class UserTestRunner {
  private results: TestResult[] = [];
  private currentUser: TestUser | null = null;
  private startTime: number = 0;

  async runTests() {
    for (const user of testUsers) {
      this.currentUser = user;
      console.log(`Starting test session for user ${user.id} with needs: ${user.needs.join(', ')}`);

      for (const scenario of testScenarios) {
        console.log(`\nExecuting scenario: ${scenario.name}`);
        
        const scenarioResult: TestResult = {
          userId: user.id,
          scenarioId: scenario.id,
          taskResults: [],
          feedback: '',
          accessibilityIssues: []
        };

        for (const task of scenario.tasks) {
          console.log(`\nTask: ${task}`);
          this.startTime = Date.now();

          const taskResult = await this.executeTask(task);
          scenarioResult.taskResults.push(taskResult);

          // Check against success metrics
          if (taskResult.timeSpent > testMetrics.timeOnTask.target) {
            console.warn(`Task took longer than target time: ${taskResult.timeSpent}s`);
          }
          if (taskResult.errorCount > testMetrics.errorRate.target) {
            console.warn(`Task had more errors than target: ${taskResult.errorCount}`);
          }
        }

        this.results.push(scenarioResult);
      }
    }

    return this.generateReport();
  }

  private async executeTask(task: string) {
    // This would be replaced with actual task execution in a real testing environment
    return {
      taskName: task,
      completed: true,
      timeSpent: (Date.now() - this.startTime) / 1000,
      errorCount: 0,
      satisfactionScore: 5
    };
  }

  private generateReport() {
    const report = {
      summary: {
        totalUsers: testUsers.length,
        totalScenarios: testScenarios.length,
        overallCompletionRate: 0,
        averageSatisfactionScore: 0
      },
      detailedResults: this.results,
      accessibilityFindings: [] as string[]
    };

    // Calculate overall metrics
    let totalTasks = 0;
    let completedTasks = 0;
    let totalSatisfactionScore = 0;
    let totalScores = 0;

    this.results.forEach(result => {
      result.taskResults.forEach(task => {
        totalTasks++;
        if (task.completed) completedTasks++;
        if (task.satisfactionScore) {
          totalSatisfactionScore += task.satisfactionScore;
          totalScores++;
        }
      });
    });

    report.summary.overallCompletionRate = (completedTasks / totalTasks) * 100;
    report.summary.averageSatisfactionScore = totalSatisfactionScore / totalScores;

    return report;
  }
} 