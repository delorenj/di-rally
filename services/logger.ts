import { Logger } from '../core/types';

/**
 * A simple console-based logger implementation
 */
export class ConsoleLogger implements Logger {
  log(message: string): void {
    console.log(`[INFO] ${message}`);
  }

  error(message: string, error?: Error): void {
    console.error(`[ERROR] ${message}`, error);
  }
}