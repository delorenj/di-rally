/**
 * DI Rally - Design Pattern Demonstration (in Typescript !)
 *
 * This file brings together all the design patterns demonstrated in this project:
 *
 * 1. DEPENDENCY INJECTION PATTERN
 *    - What: Objects receive their dependencies rather than creating them
 *    - Why: Loose coupling, testability, flexibility
 *    - Where: DIContainer class and service registration
 *
 * 2. BUILDER PATTERN
 *    - What: Step-by-step construction of complex objects
 *    - Why: Flexible object creation, readable configuration
 *    - Where: ShadowTransactionCommandBuilder with "withX" methods
 *
 * 3. COMMAND PATTERN
 *    - What: Encapsulates a request as an object
 *    - Why: Decouples sender from receiver, enables queueing and logging
 *    - Where: MatchStoreToProductCommand and AssignRepCommand
 *
 * 4. DECORATOR PATTERN
 *    - What: Attaches additional responsibilities to objects dynamically
 *    - Why: Extends functionality without modifying original code
 *    - Where: Pre-invoke and post-invoke hooks
 *
 * 5. FACTORY PATTERN
 *    - What: Creates objects without specifying exact class
 *    - Why: Centralizes object creation logic
 *    - Where: Command factories in the builder
 *
 * 6. STRATEGY PATTERN
 *    - What: Defines a family of interchangeable algorithms
 *    - Why: Runtime selection of behavior
 *    - Where: Logger, MetricsService, ValidationService implementations
 *
 * 7. MEDIATOR PATTERN
 *    - What: Coordinates interactions between objects
 *    - Why: Reduces direct connections between objects
 *    - Where: TransactionManager handling events
 *
 * REAL-WORLD BENEFITS OF THESE PATTERNS:
 * - Maintainability: Clean separation of concerns makes code easier to understand
 * - Extensibility: New capabilities can be added without changing existing code
 * - Testability: Components can be tested in isolation with mock dependencies
 * - Flexibility: Different configurations can be composed for different scenarios
 *
 * These patterns could seem overengineery. But they're not really THAT engineered. Just remembered and reapplied.
 * real problems that you'll encounter as applications grow in complexity:
 * - How to add new features without breaking existing ones
 * - How to test complex systems reliably
 * - How to maintain code that multiple developers work on
 * - How to adapt to changing requirements over time
 */

import { DIContainer, SERVICE_IDENTIFIERS } from "./core/di-container";
import { ShadowTransactionCommandBuilder } from "./core/command-builder";
import { DefaultTransactionManager } from "./core/transaction-manager";
import {
  TransactionEvent,
  TransactionManager,
  TransactionCommandBuilder,
  EventCollector
} from "./core/types";

// Import services - these implement the Strategy Pattern
// Each service has a defined interface and could have multiple implementations
import { ConsoleLogger } from "./services/logger";
import { SimpleMetricsService } from "./services/metrics";
import { JSONSchemaValidator } from "./services/validator";
import { BasicAuthService } from "./services/auth";
import { FifoEventCollector } from "./services/event-collector";

// Import commands - these implement the Command Pattern
// Each command encapsulates a business operation
import { MatchStoreToProductCommand } from "./commands/match-store-command";
import { RepCheckIn } from "./commands/rep-check-in-command";

// Import hooks - these implement the Decorator Pattern
// Hooks add cross-cutting concerns to commands without modifying them
import {
  createLoggingHook,
  createMetricsHook,
  createValidationHook,
  createAuthHook,
  createRevenueAnalyticsHook,
  createCommissionCalculatorHook,
  createAIPredictionHook
} from "./hooks";

/**
 * Main Demo Function
 *
 * This function demonstrates how all the design patterns work together to create
 * a flexible, maintainable system. It shows:
 *
 * 1. How the Dependency Injection container is configured
 * 2. How services are registered and resolved
 * 3. How commands are built with different capability stacks
 * 4. How events flow through the system
 *
 * DESIGN PATTERNS IN ACTION:
 * - Dependency Injection: Service registration and resolution
 * - Builder Pattern: Command builder with "withX" methods
 * - Command Pattern: Events triggering command execution
 * - Decorator Pattern: Hooks adding capabilities to commands
 * - Factory Pattern: Command creation based on event types
 * - Strategy Pattern: Different service implementations
 * - Mediator Pattern: Transaction manager coordinating event processing
 *
 *  Pay attention to how these patterns work together to create a system that's:
 * - Modular: Components can be developed and tested independently
 * - Flexible: Capabilities can be added or removed without changing core code
 * - Maintainable: Clear separation of concerns makes the code easier to understand
 * - Extensible: New features can be added without breaking existing functionality
 */
async function runRepRallyDemo() {
  console.log("🚀 REP RALLY COMMAND SYSTEM DEMO 🚀");
  console.log("===================================");
  console.log("Showcasing the power of our Dependency Injection pattern");
  console.log("---------------------------------------------------");

  // First, let's set up our DI container
  // This is the DEPENDENCY INJECTION PATTERN in action - centralizing all dependencies
  console.log("\n📦 SETTING UP DI CONTAINER...");
  const container = new DIContainer();

  // Register our core services
  // This demonstrates how the DI container decouples service creation from usage
  // Benefits:
  // 1. Services can be swapped without changing consumers
  // 2. Lifetimes (singleton/transient) are managed centrally
  // 3. Dependencies are explicit and traceable

  // Register logger as a singleton (one instance shared by all consumers)
  // This shows the STRATEGY PATTERN - ConsoleLogger is one strategy for logging
  container.register(SERVICE_IDENTIFIERS.LOGGER, {
    useClass: ConsoleLogger,
    lifetime: "singleton" // Singleton ensures all components use the same logger instance
  });

  // Register metrics service
  // In a real app, we could swap this with a CloudMetricsService without changing consumers
  container.register(SERVICE_IDENTIFIERS.METRICS_SERVICE, {
    useClass: SimpleMetricsService,
    lifetime: "singleton"
  });

  // Register validation service
  // This could be swapped with different validation implementations (JSON Schema, Yup, etc.)
  container.register(SERVICE_IDENTIFIERS.VALIDATION_SERVICE, {
    useClass: JSONSchemaValidator,
    lifetime: "singleton"
  });

  // Register auth service
  // In a real app, this might be swapped with OAuth, JWT, or other auth strategies
  container.register(SERVICE_IDENTIFIERS.AUTH_SERVICE, {
    useClass: BasicAuthService,
    lifetime: "singleton"
  });

  // Register event collector
  // This service collects side effects from commands
  container.register(SERVICE_IDENTIFIERS.EVENT_COLLECTOR, {
    useClass: FifoEventCollector,
    lifetime: "singleton"
  });

  // Set up our command builder with factories
  // This demonstrates the FACTORY PATTERN combined with the BUILDER PATTERN
  container.register(SERVICE_IDENTIFIERS.COMMAND_BUILDER, {
    useFactory: () => {
      // Create a new builder - this implements the BUILDER PATTERN
      const builder = new ShadowTransactionCommandBuilder();

      // Register command factories - this implements the FACTORY PATTERN
      // Each factory creates a command for a specific event type
      // Benefits:
      // 1. Centralized command creation logic
      // 2. Events are decoupled from their handlers
      // 3. New command types can be added without changing existing code

      // Factory for MATCH_STORE_TO_PRODUCT events
      // This maps events to the appropriate command implementation
      builder.registerCommandFactory(
        "MATCH_STORE_TO_PRODUCT",
        (event) => new MatchStoreToProductCommand(event)
      );

      // Factory for STORE_MATCHED events
      // Notice how different event types can map to different command classes
      builder.registerCommandFactory(
        "STORE_MATCHED",
        (event) => new RepCheckIn(event)
      );

      return builder;
    },
    lifetime: "singleton" // Singleton ensures consistent command creation throughout the app
  });

  // The transaction manager with our composed capabilities
  // This demonstrates the MEDIATOR PATTERN and DECORATOR PATTERN working together
  container.register(SERVICE_IDENTIFIERS.TRANSACTION_MANAGER, {
    useFactory: (container) => {
      // Resolve dependencies from the container - this is Dependency Injection in action
      const commandBuilder = container.resolve<TransactionCommandBuilder>(
        SERVICE_IDENTIFIERS.COMMAND_BUILDER
      );
      const eventCollector = container.resolve<EventCollector>(
        SERVICE_IDENTIFIERS.EVENT_COLLECTOR
      );

=      // We compose capabilities onto our command builder using the builder pattern
=      console.log("\n✨ COMPOSING CAPABILITIES WITH BUILDER PATTERN...");

      // Each withX call creates a new builder with the additional capability
      // This is the DECORATOR PATTERN in action - adding behavior without modifying commands
      const enhancedBuilder = commandBuilder
        // Add pre-invoke hooks for processing before command execution
        // These hooks run in the order they're added

        // Add logging capability - records what commands are executing
        .withPreInvokeHook(
          createLoggingHook(container.resolve(SERVICE_IDENTIFIERS.LOGGER))
        )

        // Add validation capability - ensures events have valid payloads
        .withPreInvokeHook(
          createValidationHook(
            container.resolve(SERVICE_IDENTIFIERS.VALIDATION_SERVICE)
          )
        )

        // Add authorization capability - checks if the source is allowed to trigger this event
        .withPreInvokeHook(
          createAuthHook(container.resolve(SERVICE_IDENTIFIERS.AUTH_SERVICE))
        )

        // Add AI prediction capability - enhances data with ML predictions
        // Note how business-specific capabilities can be composed just like technical ones
        .withPreInvokeHook(createAIPredictionHook())

        // Add commission calculator - prepares commission data for commands
        .withPreInvokeHook(createCommissionCalculatorHook())

        // Add post-invoke hooks for processing after command execution
        // These run after the command completes successfully

        // Add metrics capability - records performance and execution data
        .withPostInvokeHook(
          createMetricsHook(
            container.resolve(SERVICE_IDENTIFIERS.METRICS_SERVICE)
          )
        )

        // Add revenue analytics - calculates business metrics from results
        .withPostInvokeHook(createRevenueAnalyticsHook());

      // The beauty of this approach is that we can create different capability stacks
      // for different scenarios without changing any command code!
      console.log("✅ CAPABILITY COMPOSITION COMPLETE!");

      // Create the transaction manager with our enhanced builder
      // This implements the MEDIATOR PATTERN - centralizing event handling
      return new DefaultTransactionManager(enhancedBuilder, eventCollector);
    },
    lifetime: "singleton" // Singleton ensures consistent event processing
  });

  // Get our transaction manager from the DI container
  // This is where we see the benefits of Dependency Injection - we just ask for what we need
  const manager = container.resolve<TransactionManager>(
    SERVICE_IDENTIFIERS.TRANSACTION_MANAGER
  );
  const eventCollector = container.resolve<EventCollector>(
    SERVICE_IDENTIFIERS.EVENT_COLLECTOR
  );

  // Create a sample match store event
  // This demonstrates the Event-Driven Architecture pattern, where events trigger processing
  console.log("\n📝 CREATING SAMPLE STORE-PRODUCT MATCH EVENT...");
  const matchEvent: TransactionEvent = {
    // Each event has a unique ID
    id: Math.random().toString(36).substring(2, 9),
    // The type determines which command will handle it
    type: "MATCH_STORE_TO_PRODUCT",
    // The payload contains the business data
    payload: {
      storeId: "STORE-QUICKMART-123",
      productList: [
        {
          id: "PROD-KRATOM-SUPREME",
          name: "Kratom Supreme Extract",
          price: 29.99,
          estimatedVolume: 120, // units per month
          category: "Wellness"
        },
        {
          id: "PROD-CBD-RELAX",
          name: "CBD Relaxation Gummies",
          price: 19.99,
          estimatedVolume: 200, // units per month
          category: "Wellness"
        },
        {
          id: "PROD-VAPE-CLOUD",
          name: "Cloud Chaser Vape Pen",
          price: 39.99,
          estimatedVolume: 80, // units per month
          category: "Vaping"
        }
      ]
    },
    // Metadata provides context about the event
    metadata: {
      // Correlation ID links related events together
      correlationId: "CORR-" + Math.random().toString(36).substring(2, 9),
      // Causation ID identifies what caused this event (empty for initial events)
      causationId: "",
      // When the event occurred
      timestamp: new Date(),
      // Which system component generated the event
      source: "rep-portal"
    }
  };

  // Process the match event
  // This is the MEDIATOR PATTERN in action - the manager coordinates processing
  console.log("\n🔄 PROCESSING STORE-PRODUCT MATCH...");
  await manager.processEvent(matchEvent);

  // Get the side effects generated by our command
  // This demonstrates the EVENT SOURCING pattern - commands produce events
  console.log("\n📊 CHECKING SIDE EFFECTS...");
  const sideEffects = eventCollector.getEvents();
  console.log(`Found ${sideEffects.length} side effects to process`);

  // Process the first side effect (STORE_MATCHED)
  // This shows how events can trigger chains of processing
  if (sideEffects.length > 0) {
    const storeMatchedEvent = sideEffects[0];
    console.log(`\n🔄 PROCESSING SIDE EFFECT: ${storeMatchedEvent.type}`);
    // The same manager processes different event types with different commands
    await manager.processEvent(storeMatchedEvent);

    // Notice how we've created a chain of processing:
    // 1. MATCH_STORE_TO_PRODUCT event → MatchStoreToProductCommand
    // 2. STORE_MATCHED event → AssignRepCommand
    //
    // This event-driven approach enables:
    // - Loose coupling between processing steps
    // - Clear audit trail of what happened
    // - Ability to replay events for debugging
    // - Parallel processing of independent events
  }

  // Demonstrate different capability stacks
  // This shows the real power of our design patterns working together
  console.log("\n🧪 DEMONSTRATING DIFFERENT CAPABILITY COMPOSITIONS");

  // 1. A minimal capability stack with just logging
  // This demonstrates how we can create a lightweight configuration for simple scenarios
  console.log("\n🔍 CREATING MINIMAL CAPABILITY STACK (LOGGING ONLY)...");
  const basicBuilder = container
    .resolve<TransactionCommandBuilder>(SERVICE_IDENTIFIERS.COMMAND_BUILDER)
    // Only add logging, nothing else
    .withPreInvokeHook(
      createLoggingHook(container.resolve(SERVICE_IDENTIFIERS.LOGGER))
    );

  // Create a manager with the minimal capability stack
  const basicManager = new DefaultTransactionManager(
    basicBuilder,
    eventCollector
  );

  // 2. A security-focused stack with auth and validation
  // This demonstrates how we can create a stack focused on security concerns
  console.log("\n🔒 CREATING SECURITY-FOCUSED CAPABILITY STACK...");
  const securityBuilder = container
    .resolve<TransactionCommandBuilder>(SERVICE_IDENTIFIERS.COMMAND_BUILDER)
    // Add authorization checks
    .withPreInvokeHook(
      createAuthHook(container.resolve(SERVICE_IDENTIFIERS.AUTH_SERVICE))
    )
    // Add payload validation
    .withPreInvokeHook(
      createValidationHook(
        container.resolve(SERVICE_IDENTIFIERS.VALIDATION_SERVICE)
      )
    );

  // Create a manager with the security-focused stack
  const securityManager = new DefaultTransactionManager(
    securityBuilder,
    eventCollector
  );

  // 3. An analytics-heavy stack
  // This demonstrates how we can create a stack focused on business intelligence
  console.log("\n📈 CREATING ANALYTICS-FOCUSED CAPABILITY STACK...");
  const analyticsBuilder = container
    .resolve<TransactionCommandBuilder>(SERVICE_IDENTIFIERS.COMMAND_BUILDER)
    // Add basic logging
    .withPreInvokeHook(
      createLoggingHook(container.resolve(SERVICE_IDENTIFIERS.LOGGER))
    )
    // Add AI predictions for enhanced data
    .withPreInvokeHook(createAIPredictionHook())
    // Add performance metrics collection
    .withPostInvokeHook(
      createMetricsHook(container.resolve(SERVICE_IDENTIFIERS.METRICS_SERVICE))
    )
    // Add business revenue analytics
    .withPostInvokeHook(createRevenueAnalyticsHook());

  // Create a manager with the analytics-focused stack
  const analyticsManager = new DefaultTransactionManager(
    analyticsBuilder,
    eventCollector
  );

  // BENEFITS FOR DEVELOPERS:
  // This capability composition approach means:
  // 1. You can start simple and add complexity as needed
  // 2. You can create different configurations for different environments
  //    (e.g., development, testing, production)
  // 3. You can add new capabilities without changing existing code
  // 4. You can test different capability combinations easily

  // Summarize what we've demonstrated
  console.log("\n✅ DEMO COMPLETED SUCCESSFULLY!");
  console.log("This showcase demonstrates how our design patterns enable:");
  console.log("1. Clean separation of concerns");
  console.log("2. Flexible capability composition");
  console.log("3. Type-safe dependency injection");
  console.log("4. Runtime configuration of behavior stacks");

  console.log("\nREAL-WORLD BENEFITS FOR DEVELOPERS:");
  console.log("• Maintainability: Changes are isolated to specific components");
  console.log("• Testability: Components can be tested in isolation");
  console.log(
    "• Extensibility: New features can be added without breaking existing code"
  );
  console.log(
    "• Scalability: The system can grow in complexity without becoming unmanageable"
  );

  console.log(
    "\nThe 'withX' pattern shown here is particularly powerful for building"
  );
  console.log("maintainable, modular systems that can evolve over time!");

  console.log(
    " * These patterns could seem overengineery. But they're not really THAT engineered. Just remembered and reapplied."
  );
  console.log(
    "Learning these patterns will make you a more effective developer and help you build better software!"
  );
}

// Run the demo
// This is where execution begins - everything else is just definitions
runRepRallyDemo().catch((err) => console.error("Demo failed:", err));
