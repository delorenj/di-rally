/**
 * Hooks Implementation - Decorator Pattern
 * 
 * This file implements the Decorator Pattern through command hooks. These hooks
 * allow capabilities to be added to commands without modifying their code.
 * 
 * WHAT IS THE DECORATOR PATTERN?
 * The Decorator Pattern attaches additional responsibilities to objects dynamically.
 * Decorators provide a flexible alternative to subclassing for extending functionality.
 * 
 * REAL-WORLD BENEFITS:
 * 1. Separation of Concerns: Core business logic in commands, cross-cutting concerns in hooks
 * 2. Reusability: The same hooks can be applied to different commands
 * 3. Composability: Hooks can be mixed and matched to create different capability stacks
 * 4. Open/Closed Principle: Extend functionality without modifying existing code
 * 
 * ALTERNATIVE APPROACHES:
 * - Inheritance: Create subclasses for each combination of capabilities (class explosion)
 * - Aspect-Oriented Programming: Use aspects to inject cross-cutting concerns (more complex)
 * - Direct Modification: Add capabilities directly to command code (tight coupling)
 * 
 * WHY THIS IS BETTER:
 * The decorator approach keeps commands focused on business logic while allowing
 * technical concerns to be added declaratively. This makes the system more modular,
 * testable, and maintainable.
 * 
 * HOW HOOKS WORK WITH THE BUILDER PATTERN:
 * The "withX" methods in the command builder create a fluent interface for adding
 * these hooks to commands. This combination of Builder and Decorator patterns
 * creates a powerful, expressive way to compose capabilities.
 */

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
 * 
 * This implements the "withLogging" capability using the Decorator Pattern.
 * It's a cross-cutting concern that shouldn't be mixed with business logic.
 * 
 * BENEFITS OF SEPARATING LOGGING:
 * 1. Commands stay focused on business logic
 * 2. Logging can be configured differently for different scenarios
 * 3. Logging implementation can be changed without affecting commands
 * 
 * @param logger The logger service to use
 * @returns A hook that logs command execution
 */
export function createLoggingHook(logger: Logger): PreInvokeHook {
  return async (command, context) => {
    logger.log(`⚡ Executing command ${command.commandId} for event ${context.event.type}`);
    logger.log(`📊 Payload: ${JSON.stringify(context.event.payload)}`);
  };
}

/**
 * Creates a hook that records metrics about command execution
 * 
 * This implements the "withMetrics" capability using the Decorator Pattern.
 * Metrics collection is a perfect example of a cross-cutting concern that
 * should be separated from business logic.
 * 
 * BENEFITS OF SEPARATING METRICS:
 * 1. Consistent metrics collection across all commands
 * 2. Business logic remains clean and focused
 * 3. Metrics implementation can be changed without affecting commands
 * 
 * @param metrics The metrics service to use
 * @returns A hook that records metrics after command execution
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
 * 
 * This implements the "withValidation" capability using the Decorator Pattern.
 * Validation is a perfect pre-condition check that can be applied consistently
 * across different commands.
 * 
 * BENEFITS OF SEPARATING VALIDATION:
 * 1. Consistent validation rules across the system
 * 2. Commands don't need to repeat validation logic
 * 3. Validation can be turned on/off based on environment or context
 * 
 * @param validator The validation service to use
 * @returns A hook that validates event payloads before command execution
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
 * 
 * This implements the "withAuth" capability using the Decorator Pattern.
 * Security checks are critical cross-cutting concerns that should be
 * consistently applied and separated from business logic.
 * 
 * BENEFITS OF SEPARATING AUTHORIZATION:
 * 1. Consistent security enforcement across the system
 * 2. Business logic remains clean and focused
 * 3. Security policies can be updated without changing commands
 * 
 * @param authService The auth service to use
 * @returns A hook that checks authorization before command execution
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
 * 
 * This implements a business-specific "withRevenueAnalytics" capability.
 * It demonstrates how the Decorator Pattern can be used for business
 * capabilities, not just technical cross-cutting concerns.
 * 
 * BENEFITS OF THIS APPROACH:
 * 1. Analytics logic can be reused across different commands
 * 2. Commands stay focused on their primary business responsibility
 * 3. Analytics can be added/removed without changing command code
 * 
 * @returns A hook that calculates revenue analytics after command execution
 */
export function createRevenueAnalyticsHook(): PostInvokeHook {
  return async (command, context) => {
    // Only process events that have potential revenue
    if (context.event.payload.potentialRevenue) {
      const revenue = context.event.payload.potentialRevenue;
      console.log(`📈 Revenue Analytics: Processing $${revenue.toFixed(2)}`);
      
      // Calculate various business metrics
      // These calculations are in a hook because they're secondary
      // to the main business operation but still important
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
 * 
 * This implements a business-specific "withCommissionCalculator" capability.
 * It demonstrates how pre-invoke hooks can enhance the event data before
 * the command processes it.
 * 
 * BENEFITS OF THIS APPROACH:
 * 1. Commission calculation logic is consistent across the system
 * 2. Commands can focus on their core responsibility
 * 3. Commission rules can be updated in one place
 * 
 * @returns A hook that calculates commissions before command execution
 */
export function createCommissionCalculatorHook(): PreInvokeHook {
  return async (command, context) => {
    // Only process rep assignment events
    if (context.event.type === 'ASSIGN_REP' || context.event.type === 'STORE_MATCHED') {
      console.log(`💼 Commission Calculator: Analyzing potential earnings...`);
      
      // Calculate tiered commission structure based on match value
      // This business logic is in a hook because it's a shared calculation
      // that might be used by multiple commands
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
      // This shows how hooks can enhance the context for commands
      context.state.commissionRate = commissionRate;
      context.state.projectedCommission = projectedCommission;
      
      console.log(`💵 Projected Commission: $${projectedCommission.toFixed(2)}`);
    }
  };
}

/**
 * Creates a hook that enhances events with AI matching predictions
 * 
 * This implements a fancy "withAIMatchPrediction" capability to demonstrate
 * how complex business enhancements can be added as hooks.
 * 
 * BENEFITS OF THIS APPROACH:
 * 1. AI functionality can be added without complicating commands
 * 2. The same AI enhancement can be applied to multiple commands
 * 3. AI implementation can be updated without changing command code
 * 
 * @returns A hook that adds AI predictions before command execution
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
      // This complex transformation is a perfect candidate for a hook
      // because it enhances the data without being core business logic
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
      // This shows how hooks can transform the event data before processing
      context.event.payload.productList = enhancedProducts;
      
      console.log(`🧠 AI Match Prediction complete: ${enhancedProducts.length} products analyzed`);
    }
  };
}