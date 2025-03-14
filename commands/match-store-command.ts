import { TransactionCommand, TransactionEvent, CommandContext } from '../core/types';

/**
 * Command that handles matching stores to products - the heart of RepRally's business!
 */
export class MatchStoreToProductCommand implements TransactionCommand {
  commandId = 'match-store-' + Math.random().toString(36).substring(2, 9);
  
  constructor(private event: TransactionEvent<{storeId: string, productList: any[]}>) {}
  
  async invoke(context: CommandContext): Promise<void> {
    console.log(`🏪 Matching store ${this.event.payload.storeId} to products`);
    console.log(`📦 Products to match: ${this.event.payload.productList.length}`);
    
    // Add some simulated business logic delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate match ID and emit side effect
    const matchId = 'MATCH-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    
    // Calculate potential revenue - a key metric for RepRally
    const potentialRevenue = this.event.payload.productList.reduce((sum, product) => {
      return sum + (product.price * product.estimatedVolume);
    }, 0);
    
    console.log(`💰 Potential revenue from match: $${potentialRevenue.toFixed(2)}`);
    
    // Add side effect event to collector
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
        correlationId: this.event.metadata.correlationId,
        causationId: this.event.id,
        timestamp: new Date(),
        source: 'matching-service'
      }
    });
    
    console.log(`✅ Store ${this.event.payload.storeId} matched successfully! Match ID: ${matchId}`);
  }
}