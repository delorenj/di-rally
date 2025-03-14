import { ValidationService } from '../core/types';

/**
 * A validation service that checks event payloads against expected schemas
 */
export class JSONSchemaValidator implements ValidationService {
  // In a real implementation, this would use JSON Schema validation
  validate(eventType: string, payload: any): boolean {
    // Simple validation logic for demo purposes
    if (eventType === 'MATCH_STORE_TO_PRODUCT') {
      return Boolean(
        payload && 
        payload.storeId && 
        payload.productList &&
        Array.isArray(payload.productList) &&
        payload.productList.length > 0
      );
    }
    
    if (eventType === 'STORE_MATCHED') {
      return Boolean(
        payload && 
        payload.matchId &&
        payload.storeId
      );
    }
    
    if (eventType === 'ASSIGN_REP') {
      return Boolean(
        payload &&
        payload.matchId &&
        payload.repId
      );
    }
    
    // Default to true for other events
    return true;
  }
}