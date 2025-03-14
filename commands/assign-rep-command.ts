import { TransactionCommand, TransactionEvent, CommandContext } from '../core/types';

/**
 * Command Pattern Implementation - Rep Assignment
 * 
 * This file implements the Command Pattern for assigning sales representatives
 * to store-product matches. It demonstrates how the Command Pattern enables
 * clean separation of business logic from cross-cutting concerns.
 * 
 * WHAT MAKES THIS A GOOD COMMAND?
 * 1. It has a single responsibility (assigning a rep)
 * 2. It focuses on business logic, not technical concerns
 * 3. It produces events to communicate its results
 * 4. It's stateless and idempotent (could be safely retried)
 * 
 * REAL-WORLD BENEFITS OF THE COMMAND PATTERN:
 * 1. Business Logic Isolation: Core logic is separated from infrastructure concerns
 * 2. Auditability: Each business operation is explicitly represented
 * 3. Testability: Commands can be tested without the surrounding infrastructure
 * 4. Reusability: The same command can be used in different workflows
 * 
 * This command is part of a chain of business operations:
 * 1. Match stores to products (MatchStoreToProductCommand)
 * 2. Assign rep to match (AssignRepCommand) <-- You are here
 * 3. Future commands could handle rep follow-up, sales tracking, etc.
 */

/**
 * AssignRepCommand - Handles the core business logic of assigning reps to matches
 * 
 * This command is responsible for:
 * 1. Selecting the appropriate sales rep for a store-product match
 * 2. Calculating the estimated commission
 * 3. Setting a follow-up timeline
 * 4. Recording the assignment for tracking
 * 
 * Notice how this command is triggered by an event from the previous command
 * (MatchStoreToProductCommand). This is an example of the Event-Driven Architecture
 * pattern, where commands produce events that trigger other commands.
 */
export class AssignRepCommand implements TransactionCommand {
  /** Unique identifier for this command instance */
  commandId = 'assign-rep-' + Math.random().toString(36).substring(2, 9);
  
  /**
   * Creates a new rep assignment command for the given event
   * 
   * The typed event payload shows how TypeScript enhances the Command Pattern
   * by providing type safety for event data. This helps prevent bugs and
   * makes the code more self-documenting.
   * 
   * @param event The event triggering this command
   */
  constructor(private event: TransactionEvent<{matchId: string, storeId: string, potentialRevenue?: number}>) {}
  
  /**
   * Executes the rep assignment business logic
   * 
   * This method demonstrates how commands encapsulate business operations.
   * It contains the core logic for assigning a rep to a match, calculating
   * commission, and setting follow-up expectations.
   * 
   * The Command Pattern allows this business logic to be:
   * - Enhanced with cross-cutting concerns via hooks
   * - Executed in different contexts (real-time, batch, etc.)
   * - Tracked and audited consistently
   * 
   * @param context The execution context
   */
  async invoke(context: CommandContext): Promise<void> {
    // Log the operation start
    console.log(`👨‍💼 Finding a rep for match ${this.event.payload.matchId}`);
    
    // Add some simulated business logic delay
    // In a real system, this might involve database queries, API calls, etc.
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Simulate rep selection algorithm
    // In a real system, this would use:
    // - Geographic proximity to the store
    // - Rep capacity and current workload
    // - Rep expertise with the product category
    // - Past performance with similar stores
    const repId = 'REP-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    
    // Calculate estimated commission for the rep
    // This is a key business calculation that motivates the rep
    // Notice how business logic like this belongs in commands, not in hooks
    const commissionRate = 0.15; // 15% commission
    const estimatedCommission = 
      (this.event.payload.potentialRevenue || 1000) * commissionRate;
    
    console.log(`💵 Estimated commission for rep: ${estimatedCommission.toFixed(2)}`);
    
    // Create a side effect event to record the assignment
    // This demonstrates the Event Sourcing pattern working with Command Pattern
    context.eventCollector.addEvent({
      id: Math.random().toString(36).substring(2, 9),
      type: 'REP_ASSIGNED',
      payload: {
        matchId: this.event.payload.matchId,
        storeId: this.event.payload.storeId,
        repId,
        estimatedCommission,
        // Set follow-up expectations - 3 days from now
        expectedFollowupDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3)
      },
      metadata: {
        // Maintain the correlation ID from the original event
        correlationId: this.event.metadata.correlationId,
        // Set causation ID to track what caused this event
        causationId: this.event.id,
        timestamp: new Date(),
        source: 'rep-assignment-service'
      }
    });
    
    // Log successful completion
    console.log(`🚀 Rep ${repId} assigned to match ${this.event.payload.matchId}!`);
    
    // In a real system, this might also:
    // - Send a notification to the rep
    // - Update the match status in a database
    // - Schedule a follow-up reminder
  }
}