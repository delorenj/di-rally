import { 
  TransactionManager, 
  TransactionCommandBuilder, 
  TransactionEvent,
  EventCollector,
  CommandContext
} from './types';

/**
 * Transaction Manager Implementation
 * 
 * This file implements the Mediator Pattern, which provides a central point
 * for coordinating event processing in the system.
 * 
 * WHAT IS THE MEDIATOR PATTERN?
 * The Mediator Pattern defines an object that encapsulates how a set of objects
 * interact. In our case, the TransactionManager mediates between events and
 * the commands that handle them.
 * 
 * REAL-WORLD BENEFITS:
 * 1. Centralized Control: Single entry point for all event processing
 * 2. Consistent Error Handling: All errors are handled in one place
 * 3. Simplified Client Code: Event producers don't need to know about commands
 * 4. Easier Monitoring: Single place to add logging, metrics, and tracing
 * 
 * ALTERNATIVE APPROACHES:
 * - Direct Command Execution: Clients create and execute commands directly (more coupling)
 * - Event Bus: Events are published to a bus and subscribers handle them (more complex)
 * 
 * WHY THIS IS BETTER:
 * The mediator approach keeps the system modular while providing a clear, consistent
 * flow for event processing. It's easier to understand, test, and extend.
 */

/**
 * DefaultTransactionManager - Orchestrates event processing
 * 
 * This class is responsible for:
 * 1. Receiving events from various sources
 * 2. Building the appropriate command with all capabilities
 * 3. Creating the execution context
 * 4. Invoking the command
 * 5. Handling any errors that occur
 * 
 * It acts as a mediator between event producers and command handlers.
 */
export class DefaultTransactionManager implements TransactionManager {
  /**
   * Creates a new transaction manager
   * 
   * Uses constructor injection to receive its dependencies, which is
   * a best practice for dependency injection. This makes dependencies
   * explicit and enables easier testing.
   * 
   * @param commandBuilder Builder that creates commands with capabilities
   * @param eventCollector Collector for side-effect events
   */
  constructor(
    private commandBuilder: TransactionCommandBuilder,
    private eventCollector: EventCollector
  ) {}
  
  /**
   * Processes an event by building and executing the appropriate command
   * 
   * This is the main entry point for event processing. It:
   * 1. Builds the appropriate command with all capabilities
   * 2. Creates a context for the command execution
   * 3. Invokes the command
   * 4. Handles any errors that occur
   * 
   * This centralized approach ensures consistent handling of all events.
   * 
   * @param event The event to process
   */
  async processEvent(event: TransactionEvent): Promise<void> {
    try {
      // Build command with all registered capabilities
      // This leverages the Builder Pattern from command-builder.ts
      const command = this.commandBuilder.buildCommand(event);
      
      // Prepare context for command execution
      // The context contains everything the command needs to execute
      const context: CommandContext = {
        event,
        state: {}, // Empty state object for hooks to share data
        eventCollector: this.eventCollector
      };
      
      // Execute command with all its hooks
      // This is where the business logic happens
      await command.invoke(context);
    } catch (error) {
      // Centralized error handling for all commands
      await this.handleError(event, error as Error);
    }
  }
  
  /**
   * Handles errors that occur during event processing
   * 
   * Centralizing error handling ensures consistent treatment of errors
   * across all commands. In a production system, this would include:
   * - Logging the error with context
   * - Deciding whether to retry
   * - Notifying monitoring systems
   * - Possibly compensating transactions
   * 
   * @param event The event that was being processed
   * @param error The error that occurred
   */
  async handleError(event: TransactionEvent, error: Error): Promise<void> {
    console.error(`Error processing event ${event.type}:`, error);
    // In a real implementation, this would handle error recovery, retries, etc.
    // For example:
    // - Add the event to a retry queue
    // - Send an alert to operations
    // - Create a compensating transaction
  }
}