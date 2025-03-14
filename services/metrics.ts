import { MetricsService } from '../core/types';

/**
 * A simple metrics service that logs metrics to the console
 */
export class SimpleMetricsService implements MetricsService {
  private metrics: Record<string, any[]> = {};

  recordExecution(commandId: string, data: Record<string, any>): void {
    if (!this.metrics[commandId]) {
      this.metrics[commandId] = [];
    }
    
    this.metrics[commandId].push({
      ...data,
      timestamp: new Date()
    });
    
    console.log(`[METRICS] Recorded execution of ${commandId}`);
    console.log(`[METRICS] Data: ${JSON.stringify(data)}`);
  }
}