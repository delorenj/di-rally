import { DIContainer, SERVICE_IDENTIFIERS } from './core/di-container';
import { ShadowTransactionCommandBuilder } from './core/command-builder';
import { DefaultTransactionManager } from './core/transaction-manager';
import { TransactionEvent, TransactionManager, TransactionCommandBuilder, EventCollector } from './core/types';

// Import services
import { ConsoleLogger } from './services/logger';
import { SimpleMetricsService } from './services/metrics';
import { JSONSchemaValidator } from './services/validator';
import { BasicAuthService } from './services/auth';
import { FifoEventCollector } from './services/event-collector';

// Import commands
import { MatchStoreToProductCommand } from './commands/match-store-command';
import { AssignRepCommand } from './commands/assign-rep-command';

// Import hooks
import { 
  createLoggingHook, 
  createMetricsHook, 
  createValidationHook, 
  createAuthHook,
  createRevenueAnalyticsHook,
  createCommissionCalculatorHook,
  createAIPredictionHook
} from './hooks';

/**
 * Main demo function to showcase our DI pattern in action
 */
async function runRepRallyDemo() {
  console.log("🚀 REP RALLY COMMAND SYSTEM DEMO 🚀");
  console.log("===================================");
  console.log("Showcasing the power of our Dependency Injection pattern");
  console.log("---------------------------------------------------");
  
  // First, let's set up our DI container
  console.log("\n📦 SETTING UP DI CONTAINER...");
  const container = new DIContainer();
  
  // Register our core services
  container.register(SERVICE_IDENTIFIERS.LOGGER, {
    useClass: ConsoleLogger,
    lifetime: 'singleton'
  });
  
  container.register(SERVICE_IDENTIFIERS.METRICS_SERVICE, {
    useClass: SimpleMetricsService,
    lifetime: 'singleton'
  });
  
  container.register(SERVICE_IDENTIFIERS.VALIDATION_SERVICE, {
    useClass: JSONSchemaValidator,
    lifetime: 'singleton'
  });
  
  container.register(SERVICE_IDENTIFIERS.AUTH_SERVICE, {
    useClass: BasicAuthService,
    lifetime: 'singleton'
  });
  
  container.register(SERVICE_IDENTIFIERS.EVENT_COLLECTOR, {
    useClass: FifoEventCollector,
    lifetime: 'singleton'
  });
  
  // Set up our command builder with factories
  container.register(SERVICE_IDENTIFIERS.COMMAND_BUILDER, {
    useFactory: () => {
      const builder = new ShadowTransactionCommandBuilder();
      
      // Register command factories
      builder.registerCommandFactory('MATCH_STORE_TO_PRODUCT', 
        (event) => new MatchStoreToProductCommand(event));
      
      builder.registerCommandFactory('STORE_MATCHED', 
        (event) => new AssignRepCommand(event));
      
      return builder;
    },
    lifetime: 'singleton'
  });
  
  // The transaction manager with our composed capabilities
  container.register(SERVICE_IDENTIFIERS.TRANSACTION_MANAGER, {
    useFactory: (container) => {
      const commandBuilder = container.resolve<TransactionCommandBuilder>(SERVICE_IDENTIFIERS.COMMAND_BUILDER);
      const eventCollector = container.resolve<EventCollector>(SERVICE_IDENTIFIERS.EVENT_COLLECTOR);
      
      // THIS IS WHERE THE MAGIC HAPPENS!
      // We compose capabilities onto our command builder using the builder pattern
      console.log("\n✨ COMPOSING CAPABILITIES WITH BUILDER PATTERN...");
      const enhancedBuilder = commandBuilder
        // Add pre-invoke hooks for processing before command execution
        .withPreInvokeHook(createLoggingHook(container.resolve(SERVICE_IDENTIFIERS.LOGGER)))
        .withPreInvokeHook(createValidationHook(container.resolve(SERVICE_IDENTIFIERS.VALIDATION_SERVICE)))
        .withPreInvokeHook(createAuthHook(container.resolve(SERVICE_IDENTIFIERS.AUTH_SERVICE)))
        .withPreInvokeHook(createAIPredictionHook()) // Our AI prediction capability
        .withPreInvokeHook(createCommissionCalculatorHook()) // Our commission calculator
        
        // Add post-invoke hooks for processing after command execution
        .withPostInvokeHook(createMetricsHook(container.resolve(SERVICE_IDENTIFIERS.METRICS_SERVICE)))
        .withPostInvokeHook(createRevenueAnalyticsHook()); // Our revenue analytics capability
      
      console.log("✅ CAPABILITY COMPOSITION COMPLETE!");
      
      return new DefaultTransactionManager(enhancedBuilder, eventCollector);
    },
    lifetime: 'singleton'
  });
  
  // Get our transaction manager
  const manager = container.resolve<TransactionManager>(SERVICE_IDENTIFIERS.TRANSACTION_MANAGER);
  const eventCollector = container.resolve<EventCollector>(SERVICE_IDENTIFIERS.EVENT_COLLECTOR);
  
  // Create a sample match store event
  console.log("\n📝 CREATING SAMPLE STORE-PRODUCT MATCH EVENT...");
  const matchEvent: TransactionEvent = {
    id: Math.random().toString(36).substring(2, 9),
    type: 'MATCH_STORE_TO_PRODUCT',
    payload: {
      storeId: 'STORE-QUICKMART-123',
      productList: [
        { 
          id: 'PROD-KRATOM-SUPREME', 
          name: 'Kratom Supreme Extract', 
          price: 29.99,
          estimatedVolume: 120, // units per month
          category: 'Wellness'
        },
        { 
          id: 'PROD-CBD-RELAX', 
          name: 'CBD Relaxation Gummies', 
          price: 19.99,
          estimatedVolume: 200, // units per month
          category: 'Wellness'
        },
        { 
          id: 'PROD-VAPE-CLOUD', 
          name: 'Cloud Chaser Vape Pen', 
          price: 39.99,
          estimatedVolume: 80, // units per month
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
  
  // Process the match event
  console.log("\n🔄 PROCESSING STORE-PRODUCT MATCH...");
  await manager.processEvent(matchEvent);
  
  // Get the side effects generated by our command
  console.log("\n📊 CHECKING SIDE EFFECTS...");
  const sideEffects = eventCollector.getEvents();
  console.log(`Found ${sideEffects.length} side effects to process`);
  
  // Process the first side effect (STORE_MATCHED)
  if (sideEffects.length > 0) {
    const storeMatchedEvent = sideEffects[0];
    console.log(`\n🔄 PROCESSING SIDE EFFECT: ${storeMatchedEvent.type}`);
    await manager.processEvent(storeMatchedEvent);
  }
  
  // Demonstrate different capability stacks
  console.log("\n🧪 DEMONSTRATING DIFFERENT CAPABILITY COMPOSITIONS");
  
  // 1. A minimal capability stack with just logging
  console.log("\n🔍 CREATING MINIMAL CAPABILITY STACK (LOGGING ONLY)...");
  const basicBuilder = container.resolve<TransactionCommandBuilder>(SERVICE_IDENTIFIERS.COMMAND_BUILDER)
    .withPreInvokeHook(createLoggingHook(container.resolve(SERVICE_IDENTIFIERS.LOGGER)));
  
  const basicManager = new DefaultTransactionManager(basicBuilder, eventCollector);
  
  // 2. A security-focused stack with auth and validation
  console.log("\n🔒 CREATING SECURITY-FOCUSED CAPABILITY STACK...");
  const securityBuilder = container.resolve<TransactionCommandBuilder>(SERVICE_IDENTIFIERS.COMMAND_BUILDER)
    .withPreInvokeHook(createAuthHook(container.resolve(SERVICE_IDENTIFIERS.AUTH_SERVICE)))
    .withPreInvokeHook(createValidationHook(container.resolve(SERVICE_IDENTIFIERS.VALIDATION_SERVICE)));
  
  const securityManager = new DefaultTransactionManager(securityBuilder, eventCollector);
  
  // 3. An analytics-heavy stack
  console.log("\n📈 CREATING ANALYTICS-FOCUSED CAPABILITY STACK...");
  const analyticsBuilder = container.resolve<TransactionCommandBuilder>(SERVICE_IDENTIFIERS.COMMAND_BUILDER)
    .withPreInvokeHook(createLoggingHook(container.resolve(SERVICE_IDENTIFIERS.LOGGER)))
    .withPreInvokeHook(createAIPredictionHook())
    .withPostInvokeHook(createMetricsHook(container.resolve(SERVICE_IDENTIFIERS.METRICS_SERVICE)))
    .withPostInvokeHook(createRevenueAnalyticsHook());
  
  const analyticsManager = new DefaultTransactionManager(analyticsBuilder, eventCollector);
  
  console.log("\n✅ DEMO COMPLETED SUCCESSFULLY!");
  console.log("This showcase demonstrates how our DI pattern enables:");
  console.log("1. Clean separation of concerns");
  console.log("2. Flexible capability composition");
  console.log("3. Type-safe dependency injection");
  console.log("4. Runtime configuration of behavior stacks");
  console.log("\nThe 'withX' pattern shown here is particularly powerful for building");
  console.log("maintainable, modular systems that can evolve over time!");
}

// Run the demo
runRepRallyDemo().catch(err => console.error('Demo failed:', err));
