/**
 * NO PATTERNS EXAMPLE
 * 
 * This file demonstrates what the same functionality would look like WITHOUT
 * using proper design patterns. This is deliberately "bad code" to show
 * why patterns are important.
 * 
 * PROBLEMS WITH THIS APPROACH:
 * 1. Tight coupling: Components directly depend on each other
 * 2. Poor separation of concerns: Business logic mixed with infrastructure
 * 3. Code duplication: Same logic repeated in multiple places
 * 4. Hard to test: Can't easily mock dependencies
 * 5. Hard to extend: Adding new features requires changing existing code
 * 6. Brittle: Changes in one part can break other parts
 * 
 * COMPARE THIS WITH THE PATTERN-BASED APPROACH:
 * The main project demonstrates how design patterns solve these problems
 * by providing clean separation of concerns, loose coupling, and extensibility.
 */

// Hard-coded logger (no interface or dependency injection)
// Problem: Can't easily change or mock for testing
function logMessage(message: string): void {
  console.log(`[INFO] ${message}`);
}

function logError(message: string, error?: Error): void {
  console.error(`[ERROR] ${message}`, error);
}

// Hard-coded metrics service (no interface or dependency injection)
// Problem: Can't easily change or mock for testing
function recordMetrics(commandName: string, data: any): void {
  console.log(`[METRICS] ${commandName}:`, data);
}

// Hard-coded validation (no interface or dependency injection)
// Problem: Can't easily change validation rules or mock for testing
function validateEvent(eventType: string, payload: any): boolean {
  // Hard-coded validation rules for each event type
  if (eventType === 'MATCH_STORE_TO_PRODUCT') {
    return payload.storeId && Array.isArray(payload.productList);
  } else if (eventType === 'STORE_MATCHED') {
    return payload.matchId && payload.storeId;
  }
  return false;
}

// Hard-coded authorization (no interface or dependency injection)
// Problem: Can't easily change authorization rules or mock for testing
function checkAuthorization(source: string, eventType: string): boolean {
  // Hard-coded authorization rules
  if (source === 'rep-portal') {
    return true;
  }
  return false;
}

// Global variable for collected events (no encapsulation)
// Problem: Any part of the code can modify this, leading to bugs
const collectedEvents: any[] = [];

// Hard-coded command execution (no command pattern)
// Problem: Business logic mixed with infrastructure concerns
function processMatchStoreToProductEvent(event: any): void {
  try {
    // Logging logic mixed with business logic
    logMessage(`⚡ Executing match store command for event ${event.type}`);
    logMessage(`📊 Payload: ${JSON.stringify(event.payload)}`);
    
    // Validation logic mixed with business logic
    logMessage(`🔍 Validating payload for ${event.type}...`);
    const isValid = validateEvent(event.type, event.payload);
    if (!isValid) {
      logMessage(`❌ Validation failed for ${event.type}`);
      throw new Error(`Invalid event payload for ${event.type}`);
    }
    logMessage(`✅ Validation passed for ${event.type}`);
    
    // Authorization logic mixed with business logic
    logMessage(`🔒 Checking authorization for ${event.metadata.source}...`);
    const isAuthorized = checkAuthorization(event.metadata.source, event.type);
    if (!isAuthorized) {
      logMessage(`⛔ Authorization denied for ${event.metadata.source}`);
      throw new Error(`Unauthorized source: ${event.metadata.source}`);
    }
    logMessage(`✅ Authorization approved for ${event.metadata.source}`);
    
    // AI prediction logic mixed with business logic
    logMessage(`🤖 AI Match Predictor: Analyzing store-product compatibility...`);
    const products = event.payload.productList || [];
    const enhancedProducts = products.map((product: any) => {
      const baseScore = Math.floor(Math.random() * 60) + 40;
      const volatility = Math.floor(Math.random() * 10) - 5;
      const matchScore = Math.min(100, Math.max(0, baseScore + volatility));
      
      const reasons = [];
      if (matchScore > 90) {
        reasons.push('Similar store demographics', 'High regional demand', 'Strong category affinity');
      } else if (matchScore > 70) {
        reasons.push('Good category fit', 'Positive regional trends');
      } else {
        reasons.push('Basic demographic match', 'Potential to test market');
      }
      
      return {
        ...product,
        aiMatchScore: matchScore,
        aiMatchConfidence: matchScore > 80 ? 'HIGH' : matchScore > 60 ? 'MEDIUM' : 'LOW',
        aiMatchReasons: reasons
      };
    });
    
    // Replace the product list with enhanced list
    event.payload.productList = enhancedProducts;
    logMessage(`🧠 AI Match Prediction complete: ${enhancedProducts.length} products analyzed`);
    
    // Commission calculation logic mixed with business logic
    logMessage(`💼 Commission Calculator: Analyzing potential earnings...`);
    const baseRevenue = event.payload.productList.reduce((sum: number, product: any) => {
      return sum + (product.price * product.estimatedVolume);
    }, 0);
    
    let commissionRate = 0.10;
    if (baseRevenue > 10000) {
      commissionRate = 0.20;
      logMessage(`🌟 Premium commission rate applied: 20%`);
    } else if (baseRevenue > 5000) {
      commissionRate = 0.15;
      logMessage(`⭐ Enhanced commission rate applied: 15%`);
    } else {
      logMessage(`✨ Standard commission rate applied: 10%`);
    }
    
    const projectedCommission = baseRevenue * commissionRate;
    logMessage(`💵 Projected Commission: $${projectedCommission.toFixed(2)}`);
    
    // Actual business logic for matching store to product
    logMessage(`🏪 Matching store ${event.payload.storeId} to products`);
    logMessage(`📦 Products to match: ${event.payload.productList.length}`);
    
    // Simulate business logic delay
    setTimeout(() => {
      // Generate match ID
      const matchId = 'MATCH-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      
      // Calculate potential revenue
      const potentialRevenue = event.payload.productList.reduce((sum: number, product: any) => {
        return sum + (product.price * product.estimatedVolume);
      }, 0);
      
      logMessage(`💰 Potential revenue from match: ${potentialRevenue.toFixed(2)}`);
      
      // Create side effect event - no encapsulation
      const sideEffectEvent = {
        id: Math.random().toString(36).substring(2, 9),
        type: 'STORE_MATCHED',
        payload: {
          matchId,
          storeId: event.payload.storeId,
          products: event.payload.productList.map((p: any) => p.id),
          potentialRevenue,
          status: 'MATCHED'
        },
        metadata: {
          correlationId: event.metadata.correlationId,
          causationId: event.id,
          timestamp: new Date(),
          source: 'matching-service'
        }
      };
      
      // Add to global events array - no encapsulation
      collectedEvents.push(sideEffectEvent);
      
      logMessage(`✅ Store ${event.payload.storeId} matched successfully! Match ID: ${matchId}`);
      
      // Metrics logic mixed with business logic
      recordMetrics('match-store-command', {
        eventType: event.type,
        sideEffects: 1,
        executionTime: new Date().toISOString()
      });
      
      // Revenue analytics logic mixed with business logic
      logMessage(`📈 Revenue Analytics: Processing $${potentialRevenue.toFixed(2)}`);
      const companyRevenue = potentialRevenue * 0.20;
      const repCommission = potentialRevenue * 0.15;
      const brandExposure = potentialRevenue * 2.5;
      
      logMessage(`💰 Company Revenue: $${companyRevenue.toFixed(2)}`);
      logMessage(`💵 Rep Commission: $${repCommission.toFixed(2)}`);
      logMessage(`🔍 Brand Exposure Value: $${brandExposure.toFixed(2)}`);
      
      // Process the side effect event - tight coupling
      processStoreMatchedEvent(sideEffectEvent);
    }, 500);
  } catch (error) {
    // Error handling mixed with business logic
    logError(`Error processing event ${event.type}:`, error as Error);
  }
}

// Duplicated logic for the second command - no reuse
function processStoreMatchedEvent(event: any): void {
  try {
    // Duplicate logging logic
    logMessage(`⚡ Executing assign rep command for event ${event.type}`);
    logMessage(`📊 Payload: ${JSON.stringify(event.payload)}`);
    
    // Duplicate validation logic
    logMessage(`🔍 Validating payload for ${event.type}...`);
    const isValid = validateEvent(event.type, event.payload);
    if (!isValid) {
      logMessage(`❌ Validation failed for ${event.type}`);
      throw new Error(`Invalid event payload for ${event.type}`);
    }
    logMessage(`✅ Validation passed for ${event.type}`);
    
    // Duplicate authorization logic
    logMessage(`🔒 Checking authorization for ${event.metadata.source}...`);
    const isAuthorized = checkAuthorization(event.metadata.source, event.type);
    if (!isAuthorized) {
      logMessage(`⛔ Authorization denied for ${event.metadata.source}`);
      throw new Error(`Unauthorized source: ${event.metadata.source}`);
    }
    logMessage(`✅ Authorization approved for ${event.metadata.source}`);
    
    // Business logic for assigning rep
    logMessage(`👨‍💼 Finding a rep for match ${event.payload.matchId}`);
    
    // Simulate business logic delay
    setTimeout(() => {
      // Generate rep ID
      const repId = 'REP-' + Math.random().toString(36).substring(2, 9).toUpperCase();
      
      // Calculate commission
      const commissionRate = 0.15;
      const estimatedCommission = (event.payload.potentialRevenue || 1000) * commissionRate;
      
      logMessage(`💵 Estimated commission for rep: ${estimatedCommission.toFixed(2)}`);
      
      // Create side effect event - duplicate code
      const sideEffectEvent = {
        id: Math.random().toString(36).substring(2, 9),
        type: 'REP_ASSIGNED',
        payload: {
          matchId: event.payload.matchId,
          storeId: event.payload.storeId,
          repId,
          estimatedCommission,
          expectedFollowupDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3)
        },
        metadata: {
          correlationId: event.metadata.correlationId,
          causationId: event.id,
          timestamp: new Date(),
          source: 'rep-assignment-service'
        }
      };
      
      // Add to global events array - no encapsulation
      collectedEvents.push(sideEffectEvent);
      
      logMessage(`🚀 Rep ${repId} assigned to match ${event.payload.matchId}!`);
      
      // Duplicate metrics logic
      recordMetrics('assign-rep-command', {
        eventType: event.type,
        sideEffects: 1,
        executionTime: new Date().toISOString()
      });
    }, 700);
  } catch (error) {
    // Duplicate error handling
    logError(`Error processing event ${event.type}:`, error as Error);
  }
}

// Main function to run the demo
async function runNoPatternDemo() {
  console.log("🚀 NO PATTERNS DEMO - THE MESSY WAY 🚀");
  console.log("======================================");
  
  // Create sample event - hard-coded, no builder pattern
  const matchEvent = {
    id: Math.random().toString(36).substring(2, 9),
    type: 'MATCH_STORE_TO_PRODUCT',
    payload: {
      storeId: 'STORE-QUICKMART-123',
      productList: [
        { 
          id: 'PROD-KRATOM-SUPREME', 
          name: 'Kratom Supreme Extract', 
          price: 29.99,
          estimatedVolume: 120,
          category: 'Wellness'
        },
        { 
          id: 'PROD-CBD-RELAX', 
          name: 'CBD Relaxation Gummies', 
          price: 19.99,
          estimatedVolume: 200,
          category: 'Wellness'
        },
        { 
          id: 'PROD-VAPE-CLOUD', 
          name: 'Cloud Chaser Vape Pen', 
          price: 39.99,
          estimatedVolume: 80,
          category: 'Vaping'
        }
      ]
    },
    metadata: {
      correlationId: 'CORR-' + Math.random().toString(36).substring(2, 9),
      causationId: '',
      timestamp: new Date(),
      source: 'rep-portal'
    }
  };
  
  // Process the event - no mediator pattern
  console.log("\n🔄 PROCESSING STORE-PRODUCT MATCH...");
  processMatchStoreToProductEvent(matchEvent);
  
  // Wait for async operations to complete
  setTimeout(() => {
    console.log("\n✅ DEMO COMPLETED!");
    console.log("\nPROBLEMS WITH THIS APPROACH:");
    console.log("1. Tight coupling: Components directly depend on each other");
    console.log("2. Poor separation of concerns: Business logic mixed with infrastructure");
    console.log("3. Code duplication: Same logic repeated in multiple places");
    console.log("4. Hard to test: Can't easily mock dependencies");
    console.log("5. Hard to extend: Adding new features requires changing existing code");
    console.log("6. Brittle: Changes in one part can break other parts");
    console.log("\nThis is why design patterns are important!");
  }, 3000);
}

// Run the demo
runNoPatternDemo();