import { Logger } from '../core/types';

/**
 * Logger Service Implementation
 * 
 * This file implements the Strategy Pattern by providing a concrete implementation
 * of the Logger interface. This demonstrates how dependency injection and interfaces
 * enable loose coupling and easy substitution of implementations.
 * 
 * WHAT IS THE STRATEGY PATTERN?
 * The Strategy Pattern defines a family of algorithms, encapsulates each one,
 * and makes them interchangeable. In our case, different logging strategies
 * (console, file, cloud, etc.) can be used interchangeably.
 * 
 * REAL-WORLD BENEFITS:
 * 1. Pluggable Components: Easily swap implementations without changing client code
 * 2. Environment-Specific Behavior: Use different loggers in development vs. production
 * 3. Testability: Easily mock the logger for unit tests
 * 4. Single Responsibility: Each logger implementation focuses on one output method
 * 
 * HOW THIS WORKS WITH DEPENDENCY INJECTION:
 * The DI container is configured to provide a specific Logger implementation.
 * Client code depends only on the Logger interface, not on this specific implementation.
 */

/**
 * ConsoleLogger - A simple console-based logger implementation
 * 
 * This class provides a concrete implementation of the Logger interface
 * that outputs to the console. In a real application, you might have multiple
 * implementations:
 * 
 * - FileLogger: Writes to log files
 * - CloudLogger: Sends logs to a cloud service
 * - CompositeLogger: Sends logs to multiple destinations
 * - FilteredLogger: Only logs messages that meet certain criteria
 * 
 * The beauty of the Strategy Pattern is that all these implementations
 * can be used interchangeably because they implement the same interface.
 */
export class ConsoleLogger implements Logger {
  /**
   * Logs an informational message
   * 
   * This simple implementation prefixes the message with "[INFO]" and
   * outputs it to the console. A more sophisticated implementation might:
   * - Add timestamps
   * - Include log levels
   * - Add context information
   * - Format the output for better readability
   * 
   * @param message The message to log
   */
  log(message: string): void {
    console.log(`[INFO] ${message}`);
  }

  /**
   * Logs an error message with optional error object
   * 
   * This method demonstrates how the Strategy Pattern allows different
   * implementations to handle the same method differently. For example,
   * a production logger might:
   * - Send errors to a monitoring service
   * - Include stack traces
   * - Add severity levels
   * - Group similar errors
   * 
   * @param message The error message
   * @param error Optional error object with stack trace
   */
  error(message: string, error?: Error): void {
    console.error(`[ERROR] ${message}`, error);
  }
}