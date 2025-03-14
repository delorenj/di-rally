import { AuthService } from '../core/types';

/**
 * A basic auth service that checks if sources are authorized for specific events
 */
export class BasicAuthService implements AuthService {
  private authorizedSources: Map<string, string[]> = new Map([
    ['rep-portal', ['MATCH_STORE_TO_PRODUCT', 'CANCEL_MATCH', 'ASSIGN_REP']],
    ['matching-service', ['STORE_MATCHED', 'MATCH_UPDATED']],
    ['brand-portal', ['PRODUCT_ADDED', 'PRODUCT_UPDATED']],
    ['store-portal', ['STORE_CONFIRMED_MATCH', 'STORE_REJECTED_MATCH']]
  ]);

  checkAuthorization(source: string, eventType: string): boolean {
    const allowedEvents = this.authorizedSources.get(source) || [];
    const isAuthorized = allowedEvents.includes(eventType);
    
    if (!isAuthorized) {
      console.log(`🔒 Authorization failed: ${source} is not authorized for ${eventType}`);
    }
    
    return isAuthorized;
  }
}