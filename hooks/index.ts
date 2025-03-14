import { 
  PreInvokeHook, 
  PostInvokeHook, 
  Logger, 
  MetricsService, 
  ValidationService, 
  AuthService 
} from '../core/types';

/**
 * Creates a hook that logs command execution information
 * This demonstrates the "withLogging" capability
 */
export function createLoggingHook(logger: Logger): PreInvokeHook {
  return async (command, context) => {
    logger.log(`⚡ Executing command ${command.commandId} for event ${context.event.type}`);
    logger.log(`📊 Payload: ${JSON.stringify(context.event.payload)}`);
  };
}

/**
 * Creates a hook that records metrics about command execution
 * This demonstrates the "withMetrics" capability
 */
export function createMetricsHook(metrics: MetricsService): PostInvokeHook {
  return async (command, context) => {
    metrics.recordExecution(command.commandId, {
      eventType: context.event.type,
      sideEffects: context.eventCollector.getEvents().length,
      executionTime: new Date().toISOString()
    });
  };
}

/**
 * Creates a hook that validates event payloads
 * This demonstrates the "withValidation" capability
 */
export function createValidationHook(validator: ValidationService): PreInvokeHook {
  return async (command, context) => {
    console.log(`🔍 Validating payload for ${context.event.type}...`);
    const isValid = validator.validate(context.event.type, context.event.payload);
    if (!isValid) {
      console.log(`❌ Validation failed for ${context.event.type}`);
      throw new Error(`Invalid event payload for ${context.event.type}`);
    }
    console.log(`✅ Validation passed for ${context.event.type}`);
  };
}

/**
 * Creates a hook that checks authorization
 * This demonstrates the "withAuth" capability
 */
export function createAuthHook(authService: AuthService): PreInvokeHook {
  return async (command, context) => {
    console.log(`🔒 Checking authorization for ${context.event.metadata.source}...`);
    const isAuthorized = authService.checkAuthorization(
      context.event.metadata.source,
      context.event.type
    );
    
    if (!isAuthorized) {
      console.log(`⛔ Authorization denied for ${context.event.metadata.source}`);
      throw new Error(`Unauthorized source: ${context.event.metadata.source}`);
    }
    console.log(`✅ Authorization approved for ${context.event.metadata.source}`);
  };
}

/**
 * Creates a hook that adds revenue analytics
 * This demonstrates a RepRally-specific "withRevenueAnalytics" capability
 */
export function createRevenueAnalyticsHook(): PostInvokeHook {
  return async (command, context) => {
    // Only process events that have potential revenue
    if (context.event.payload.potentialRevenue) {
      const revenue = context.event.payload.potentialRevenue;
      console.log(`📈 Revenue Analytics: Processing $${revenue.toFixed(2)}`);
      
      // Calculate various business metrics
      const companyRevenue = revenue * 0.20; // 20% cut for RepRally
      const repCommission = revenue * 0.15; // 15% commission for reps
      const brandExposure = revenue * 2.5; // 2.5x leverage on brand exposure
      
      console.log(`💰 Company Revenue: $${companyRevenue.toFixed(2)}`);
      console.log(`💵 Rep Commission: $${repCommission.toFixed(2)}`);
      console.log(`🔍 Brand Exposure Value: $${brandExposure.toFixed(2)}`);
      
      // In a real implementation, we'd store these analytics or forward them
      // to a business intelligence system
    }
  };
}

/**
 * Creates a hook that adds commission calculation
 * This demonstrates a RepRally-specific "withCommissionCalculator" capability
 */
export function createCommissionCalculatorHook(): PreInvokeHook {
  return async (command, context) => {
    // Only process rep assignment events
    if (context.event.type === 'ASSIGN_REP' || context.event.type === 'STORE_MATCHED') {
      console.log(`💼 Commission Calculator: Analyzing potential earnings...`);
      
      // Calculate tiered commission structure based on match value
      const baseRevenue = context.event.payload.potentialRevenue || 1000;
      let commissionRate = 0.10; // Default 10%
      
      if (baseRevenue > 10000) {
        commissionRate = 0.20; // 20% for big deals
        console.log(`🌟 Premium commission rate applied: 20%`);
      } else if (baseRevenue > 5000) {
        commissionRate = 0.15; // 15% for medium deals
        console.log(`⭐ Enhanced commission rate applied: 15%`);
      } else {
        console.log(`✨ Standard commission rate applied: 10%`);
      }
      
      const projectedCommission = baseRevenue * commissionRate;
      
      // Attach this data to the context so the command can use it
      context.state.commissionRate = commissionRate;
      context.state.projectedCommission = projectedCommission;
      
      console.log(`💵 Projected Commission: $${projectedCommission.toFixed(2)}`);
    }
  };
}

/**
 * Creates a hook that enhances events with AI matching predictions
 * This demonstrates a fancy "withAIMatchPrediction" capability
 */
export function createAIPredictionHook(): PreInvokeHook {
  return async (command, context) => {
    if (context.event.type === 'MATCH_STORE_TO_PRODUCT') {
      console.log(`🤖 AI Match Predictor: Analyzing store-product compatibility...`);
      
      // In a real system, this would call a machine learning service
      // Here we'll just simulate it with some random scoring
      const products = context.event.payload.productList || [];
      const storeId = context.event.payload.storeId;
      
      // Generate "AI" predictions for each product
      const enhancedProducts = products.map((product: any) => {
        // Calculate a match score between 0-100
        const baseScore = Math.floor(Math.random() * 60) + 40; // 40-100 range for demo
        const volatility = Math.floor(Math.random() * 10) - 5; // +/- 5 points variation
        const matchScore = Math.min(100, Math.max(0, baseScore + volatility));
        
        // For demo purposes, generate some "reasoning"
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
      
      // Replace the product list with our enhanced list
      context.event.payload.productList = enhancedProducts;
      
      console.log(`🧠 AI Match Prediction complete: ${enhancedProducts.length} products analyzed`);
    }
  };
}
