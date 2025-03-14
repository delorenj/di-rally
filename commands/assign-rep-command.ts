import { TransactionCommand, TransactionEvent, CommandContext } from '../core/types';

/**
 * Command that handles assigning a rep to follow up on store-product matches
 */
export class AssignRepCommand implements TransactionCommand {
  commandId = 'assign-rep-' + Math.random().toString(36).substring(2, 9);
  
  constructor(private event: TransactionEvent<{matchId: string, storeId: string, potentialRevenue?: number}>) {}
  
  async invoke(context: CommandContext): Promise<void> {
    console.log(`👨‍💼 Finding a rep for match ${this.event.payload.matchId}`);
    
    // Add some simulated business logic delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Simulate rep selection algorithm - in real life, this would use geographic data, rep capacity, etc.
    const repId = 'REP-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    
    // Calculate estimated commission for the rep - a motivating metric!
    const commissionRate = 0.15; // 15% commission
    const estimatedCommission = 
      (this.event.payload.potentialRevenue || 1000) * commissionRate;
    
    console.log(`💵 Estimated commission for rep: $${estimatedCommission.toFixed(2)}`);
    
    // Add side effect event
    context.eventCollector.addEvent({
      id: Math.random().toString(36).substring(2, 9),
      type: 'REP_ASSIGNED',
      payload: {
        matchId: this.event.payload.matchId,
        storeId: this.event.payload.storeId,
        repId,
        estimatedCommission,
        expectedFollowupDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3) // 3 days from now
      },
      metadata: {
        correlationId: this.event.metadata.correlationId,
        causationId: this.event.id,
        timestamp: new Date(),
        source: 'rep-assignment-service'
      }
    });
    
    console.log(`🚀 Rep ${repId} assigned to match ${this.event.payload.matchId}!`);
  }
}