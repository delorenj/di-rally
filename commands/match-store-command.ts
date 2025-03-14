import { TransactionCommand, TransactionEvent, CommandContext } from '../core/types';

/**
 * Command Pattern Implementation - Store Product Matching
 * 
 * This file implements the Command Pattern for matching stores to products.
 * 
 * WHAT IS THE COMMAND PATTERN?
 * The Command Pattern encapsulates a request as an object, allowing you to:
 * - Parameterize clients with different requests
 * - Queue or log requests
 * - Support undoable operations
 * 
 * In our system, commands encapsulate business operations triggered by events.
 * They contain the core business logic while cross-cutting concerns (logging,
 * validation, etc.) are handled by hooks.
 * 
 * REAL-WORLD BENEFITS:
 * 1. Single Responsibility: Each command handles one specific business operation
 * 2. Testability: Commands can be tested in isolation
 * 3. Auditability: Each operation is explicitly represented
 * 4. Extensibility: New operations can be added without modifying existing code
 * 
 * HOW THIS FITS WITH OTHER PATTERNS:
 * - Commands are built by the Builder Pattern (command-builder.ts)
 * - Commands are executed by the Mediator Pattern (transaction-manager.ts)
 * - Commands are enhanced by the Decorator Pattern (hooks)
 */

/**
 * MatchStoreToProductCommand - Handles the core business logic of matching stores to products
 * 
 * This command implements the core business operation of matching stores to products,
 * which is a fundamental part of the RepRally business. It:
 * 1. Analyzes the store and product data
 * 2. Calculates potential revenue
 * 3. Creates a match record
 * 4. Emits a side effect event for further processing
 * 
 * Notice how this command focuses ONLY on the business logic, not on:
 * - Logging (handled by logging hook)
 * - Validation (handled by validation hook)
 * - Authorization (handled by auth hook)
 * - Metrics (handled by metrics hook)
 * 
 * This separation of concerns makes the code much cleaner and more maintainable.
 */
export class MatchStoreToProductCommand implements TransactionCommand {
  /** Unique identifier for this command instance */
  commandId = 'match-store-' + Math.random().toString(36).substring(2, 9);
  
  /**
   * Creates a new match command for the given event
   * 
   * Using constructor injection to receive the event provides:
   * - Clear documentation of dependencies
   * - Immutability (the event can't be changed after creation)
   * - Testability (easy to provide mock events)
   * 
   * @param event The event triggering this command
   */
  constructor(private event: TransactionEvent<{storeId: string, productList: any[]}>) {}
  
  /**
   * Executes the command's business logic
   * 
   * This method contains the core business logic for matching stores to products.
   * It's kept focused on just that logic, with cross-cutting concerns handled by hooks.
   * 
   * The Command Pattern shines here because:
   * 1. The business logic is encapsulated in a single place
   * 2. The operation can be treated as a first-class object
   * 3. The execution can be enhanced with hooks without modifying this code
   * 
   * @param context The execution context
   */
  async invoke(context: CommandContext): Promise<void> {
    // Log the operation (business logging, not technical logging)
    console.log(`🏪 Matching store ${this.event.payload.storeId} to products`);
    console.log(`📦 Products to match: ${this.event.payload.productList.length}`);
    
    // Add some simulated business logic delay
    // In a real system, this would be actual business processing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate match ID - in a real system, this might come from a database
    const matchId = 'MATCH-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    
    // Calculate potential revenue - a key business metric for RepRally
    // This demonstrates how commands contain important business calculations
    const potentialRevenue = this.event.payload.productList.reduce((sum, product) => {
      return sum + (product.price * product.estimatedVolume);
    }, 0);
    
    console.log(`💰 Potential revenue from match: ${potentialRevenue.toFixed(2)}`);
    
    // Create a side effect event - this demonstrates the Event Sourcing pattern
    // Each command can generate events that trigger further processing
    context.eventCollector.addEvent({
      id: Math.random().toString(36).substring(2, 9),
      type: 'STORE_MATCHED',
      payload: {
        matchId,
        storeId: this.event.payload.storeId,
        products: this.event.payload.productList.map(p => p.id),
        potentialRevenue,
        status: 'MATCHED'
      },
      metadata: {
        // Maintain correlation ID for tracing the entire business process
        correlationId: this.event.metadata.correlationId,
        // Set causation ID to track what caused this event
        causationId: this.event.id,
        timestamp: new Date(),
        source: 'matching-service'
      }
    });
    
    // Log successful completion
    console.log(`✅ Store ${this.event.payload.storeId} matched successfully! Match ID: ${matchId}`);
  }
}