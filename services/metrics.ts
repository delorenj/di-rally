import { MetricsService } from '../core/types';

/**
 * Metrics Service Implementation
 * 
 * This file demonstrates the Strategy Pattern and Repository Pattern working together.
 * It provides a concrete implementation of the MetricsService interface that
 * collects and stores metrics about command execution.
 * 
 * WHAT IS THE REPOSITORY PATTERN?
 * The Repository Pattern mediates between the domain and data mapping layers,
 * acting like an in-memory collection of domain objects. In our simple implementation,
 * we're storing metrics in memory, but a real implementation would persist them.
 * 
 * REAL-WORLD BENEFITS:
 * 1. Centralized Metrics Collection: Consistent gathering of performance data
 * 2. Separation of Concerns: Business logic doesn't need to know about metrics storage
 * 3. Pluggable Implementation: Can easily switch to different metrics backends
 * 4. Observability: Makes system behavior visible and measurable
 * 
 * HOW THIS WORKS WITH DEPENDENCY INJECTION:
 * The DI container provides this specific MetricsService implementation.
 * Client code depends only on the interface, not this concrete class.
 */

/**
 * SimpleMetricsService - A basic metrics collection service
 * 
 * This class provides a concrete implementation of the MetricsService interface
 * that stores metrics in memory and logs them to the console. In a real application,
 * you might have implementations that:
 * 
 * - Send metrics to Prometheus, Datadog, or other monitoring systems
 * - Store metrics in a time-series database
 * - Aggregate metrics for dashboards
 * - Trigger alerts based on metric thresholds
 * 
 * The Strategy Pattern allows all these implementations to be used interchangeably.
 */
export class SimpleMetricsService implements MetricsService {
  /** In-memory storage for metrics data, organized by command ID */
  private metrics: Record<string, any[]> = {};

  /**
   * Records metrics about a command execution
   * 
   * This method implements the Repository Pattern by providing a way to store
   * metrics data. It:
   * 1. Creates a collection for the command if it doesn't exist
   * 2. Adds the metrics data with a timestamp
   * 3. Logs the metrics for demonstration purposes
   * 
   * In a real implementation, this would send the metrics to a monitoring system.
   * 
   * @param commandId The ID of the command being measured
   * @param data The metrics data to record
   */
  recordExecution(commandId: string, data: Record<string, any>): void {
    // Initialize the collection for this command if needed
    if (!this.metrics[commandId]) {
      this.metrics[commandId] = [];
    }
    
    // Add the metrics with a timestamp
    this.metrics[commandId].push({
      ...data,
      timestamp: new Date()
    });
    
    // Log the metrics (in a real system, this would be sent to a monitoring service)
    console.log(`[METRICS] Recorded execution of ${commandId}`);
    console.log(`[METRICS] Data: ${JSON.stringify(data)}`);
    
    // In a production system, we might also:
    // - Calculate aggregates (min, max, avg, percentiles)
    // - Check for anomalies or threshold violations
    // - Trigger alerts for concerning patterns
    // - Expire old metrics data
  }
}