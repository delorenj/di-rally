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
 * This file implements the Mediator Pattern, which is one of those patterns
 * that doesn't get enough love. I've been using it since the early 2000s to
 * provide a central point for coordinating event processing in complex systems.
 * 
 * WHAT IS THE MEDIATOR PATTERN?
 * The Mediator Pattern defines an object that encapsulates how a set of objects
 * interact. In our case, the TransactionManager mediates between events and
 * the commands that handle them. It's like air traffic control for your events.
 * 
 * REAL-WORLD BENEFITS:
 * 1. Centralized Control: Single entry point for all event processing (no more scattered handlers)
 * 2. Consistent Error Handling: All errors are handled in one place (saved my bacon many times)
 * 3. Simplified Client Code: Event producers don't need to know about commands (loose coupling FTW)
 * 4. Easier Monitoring: Single place to add logging, metrics, and tracing (ops teams will love you)
 * 
 * ALTERNATIVE APPROACHES:
 * - Direct Command Execution: Clients create and execute commands directly (more coupling, harder to maintain)
 * - Event Bus: Events are published to a bus and subscribers handle them (more complex, harder to debug)
 * 
 * WHY THIS IS BETTER:
 * The mediator approach keeps the system modular while providing a clear, consistent
 * flow for event processing. I've used this pattern in high-throughput financial systems
 * processing millions of transactions daily. It scales beautifully and makes debugging
 * a hell of a lot easier when things go wrong at 3AM.
 */

/**
 * DefaultTransactionManager - Orchestrates event processing
 * 
 * This class is the conductor of our event processing symphony. It's responsible for:
 * 1. Receiving events from various sources
 * 2. Building the appropriate command with all capabilities
 * 3. Creating the execution context
 * 4. Invoking the command
 * 5. Handling any errors that occur
 * 
 * It acts as a mediator between event producers and command handlers, keeping
 * everything nice and decoupled. I've been refining this pattern for years,
 * and it's one of my favorite ways to structure complex business logic.
 */
export class DefaultTransactionManager implements TransactionManager {
  /**
   * Creates a new transaction manager
   * 
   * Uses constructor injection to receive its dependencies, which is
   * a best practice for dependency injection. I've been doing this since
   * before DI was cool. This makes dependencies explicit and enables easier testing.
   * No more hunting through code to figure out what a class depends on.
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
   * This is the main entry point for event processing - the heart of the system.
   * I've designed it to be simple on the surface but powerful underneath:
   * 
   * 1. Builds the appropriate command with all capabilities
   * 2. Creates a context for the command execution
   * 3. Invokes the command
   * 4. Handles any errors that occur
   * 
   * This centralized approach ensures consistent handling of all events.
   * I've seen too many systems where event handling is scattered across
   * the codebase, leading to inconsistent error handling and duplicate code.
   * This approach fixes that mess.
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
   * across all commands. I've been burned too many times by inconsistent
   * error handling, so I'm religious about centralizing it.
   * 
   * In a production system, this would include:
   * - Logging the error with context (I prefer structured logging)
   * - Deciding whether to retry (based on error type)
   * - Notifying monitoring systems (PagerDuty anyone?)
   * - Possibly compensating transactions (crucial for financial systems)
   * 
   * I've seen this pattern save entire systems during outages. When
   * everything's going to hell, having a single place to handle errors
   * is worth its weight in gold.
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