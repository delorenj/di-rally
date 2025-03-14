import { 
  TransactionManager, 
  TransactionCommandBuilder, 
  TransactionEvent,
  EventCollector,
  CommandContext
} from './types';

/**
 * The DefaultTransactionManager orchestrates the handling of events
 * by building and executing the appropriate commands.
 */
export class DefaultTransactionManager implements TransactionManager {
  constructor(
    private commandBuilder: TransactionCommandBuilder,
    private eventCollector: EventCollector
  ) {}
  
  async processEvent(event: TransactionEvent): Promise<void> {
    try {
      // Build command with all registered capabilities
      const command = this.commandBuilder.buildCommand(event);
      
      // Prepare context
      const context: CommandContext = {
        event,
        state: {},
        eventCollector: this.eventCollector
      };
      
      // Execute command
      await command.invoke(context);
    } catch (error) {
      await this.handleError(event, error as Error);
    }
  }
  
  async handleError(event: TransactionEvent, error: Error): Promise<void> {
    console.error(`Error processing event ${event.type}:`, error);
    // In a real implementation, this would handle error recovery, retries, etc.
  }
}