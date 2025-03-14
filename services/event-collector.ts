import { EventCollector, TransactionEvent } from '../core/types';

/**
 * The FifoEventCollector collects side effect events in a first-in-first-out manner
 */
export class FifoEventCollector implements EventCollector {
  private events: TransactionEvent[] = [];

  addEvent(event: TransactionEvent): void {
    this.events.push(event);
    console.log(`📝 Collected side effect: ${event.type}`);
  }

  getEvents(): TransactionEvent[] {
    return [...this.events];
  }

  clear(): void {
    this.events = [];
    console.log('🧹 Event collector cleared');
  }
}