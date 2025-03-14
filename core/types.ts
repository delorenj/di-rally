/**
 * Core Type Definitions
 * 
 * This file defines the fundamental interfaces used throughout the application.
 * I've been preaching the importance of solid interfaces for decades - they're
 * the contract that all implementations must follow, and they're the key to
 * building systems that don't fall apart when you look at them funny.
 * 
 * By defining these interfaces separately from their implementations, we enable:
 * 1. Multiple implementations of the same interface (polymorphism)
 * 2. Easy mocking for unit tests (absolute game-changer for testing)
 * 3. Clear separation of concerns (each piece does one thing well)
 * 4. Documentation of the expected behavior (interfaces are self-documenting)
 * 
 * I've seen too many codebases where interfaces are an afterthought, and it
 * always ends in tears. Get your interfaces right, and the rest will follow.
 */

/**
 * Event Metadata - Contains contextual information about an event
 * 
 * The metadata pattern helps with tracing, debugging, and understanding
 * the flow of events through a system. I've been using this pattern since
 * the early days of SOA, and it's even more crucial in today's distributed
 * microservice architectures. Without good metadata, you're flying blind.
 */
export interface EventMetadata {
  /** Links related events in a business process */
  correlationId: string;
  /** Identifies the event that caused this event (event sourcing pattern) */
  causationId: string;
  /** When the event occurred */
  timestamp: Date;
  /** Which system component generated the event */
  source: string;
}

/**
 * TransactionEvent - The core message format in our event-driven architecture
 * 
 * Events are immutable records of something that happened in the system.
 * I've been building event-driven systems since before it was cool, and
 * using events as the primary communication mechanism creates a system that:
 * - Has a clear audit trail of all actions (crucial for compliance)
 * - Can be replayed for debugging or recovery (saved my ass many times)
 * - Allows for loose coupling between components (no more spaghetti code)
 * 
 * This is a simplified version of the event sourcing pattern that I've
 * used in production systems processing millions of transactions daily.
 */
export interface TransactionEvent<T = any> {
  /** Unique identifier for the event */
  id: string;
  /** The type of event (used for routing and processing) */
  type: string;
  /** The actual data payload of the event */
  payload: T;
  /** Contextual information about the event */
  metadata: EventMetadata;
}

/**
 * CommandContext - The execution context for commands
 * 
 * The context pattern provides commands with everything they need to execute,
 * without requiring tight coupling to specific implementations. I've been using
 * this pattern for years, and it's a game-changer for testability. This pattern:
 * - Simplifies testing by allowing mock contexts (no more complex setup)
 * - Enables commands to be reused in different scenarios (DRY principle)
 * - Provides a clean way to pass state between hooks and commands (no global state)
 * 
 * I've seen too many systems where context is implicit or global, and it always
 * leads to maintenance nightmares. Explicit context is the way to go.
 */
export interface CommandContext {
  /** The event that triggered this command */
  event: TransactionEvent;
  /** Temporary state that can be shared between hooks and commands */
  state: any;
  /** Collector for any side-effect events generated during execution */
  eventCollector: EventCollector;
}

/**
 * TransactionCommand - Implements the Command Pattern
 * 
 * The Command Pattern encapsulates a request as an object, allowing:
 * - Parameterization of clients with different requests (flexibility)
 * - Queueing of requests (great for high-throughput systems)
 * - Logging of requests (audit trails for free)
 * - Supporting undoable operations (crucial for user-facing systems)
 * 
 * I've been using this pattern since the 90s, and it's still one of my favorites.
 * In our system, commands represent business operations triggered by events.
 * It's a clean way to encapsulate business logic and keep it separate from
 * the plumbing code.
 */
export interface TransactionCommand {
  /** Unique identifier for the command instance */
  commandId: string;
  /** Executes the command's business logic */
  invoke(context: CommandContext): Promise<void>;
}

/**
 * EventCollector - Manages side effects from commands
 * 
 * This implements the Collecting Parameter pattern, which is one of those
 * underappreciated patterns that doesn't get enough love. I've been using it
 * for years to make side effects explicit and testable.
 * 
 * Benefits:
 * - Avoids direct dependencies on event publishing mechanisms (loose coupling)
 * - Makes side effects explicit and trackable (no more hidden surprises)
 * - Simplifies testing by allowing inspection of produced events (testability FTW)
 * 
 * I've seen too many systems where side effects are scattered throughout the code,
 * making it impossible to reason about what's happening. This pattern fixes that.
 */
export interface EventCollector {
  /** Adds a new event to the collection */
  addEvent(event: TransactionEvent): void;
  /** Retrieves all collected events */
  getEvents(): TransactionEvent[];
  /** Clears all collected events */
  clear(): void;
}

/**
 * Hook Types - Define function signatures for pre and post command execution
 * 
 * Hooks implement the Decorator Pattern, allowing behavior to be added
 * to commands without modifying their code. I've been using this approach
 * since the early 2000s, and it's a powerful way to:
 * - Add cross-cutting concerns like logging, validation, and metrics (AOP-lite)
 * - Compose functionality in a mix-and-match way (no more class explosion)
 * - Keep the core command logic focused on business rules (separation of concerns)
 * 
 * This pattern has saved me countless hours of refactoring and debugging over the years.
 */
export type PreInvokeHook = (command: TransactionCommand, context: CommandContext) => Promise<void>;
export type PostInvokeHook = (command: TransactionCommand, context: CommandContext) => Promise<void>;

/**
 * TransactionCommandBuilder - Implements the Builder Pattern
 * 
 * The Builder Pattern separates the construction of complex objects
 * from their representation. I've been using this pattern since Java days,
 * and it's even better in TypeScript. In our case, it builds commands with
 * all their associated hooks.
 * 
 * Benefits:
 * - Fluent interface for adding capabilities (reads like English)
 * - Immutable builder instances for thread safety (no more race conditions)
 * - Encapsulates the complexity of wiring hooks to commands (no more boilerplate)
 * 
 * I've seen this pattern transform codebases from spaghetti messes to
 * clean, maintainable systems. It's one of my go-to patterns for complex object creation.
 */
export interface TransactionCommandBuilder {
  /** Creates a command for the given event with all registered hooks */
  buildCommand(event: TransactionEvent): TransactionCommand;
  /** Adds a hook to run before command execution */
  withPreInvokeHook(hook: PreInvokeHook): TransactionCommandBuilder;
  /** Adds a hook to run after command execution */
  withPostInvokeHook(hook: PostInvokeHook): TransactionCommandBuilder;
}

/**
 * TransactionManager - Orchestrates the processing of events
 * 
 * This implements the Mediator Pattern by centralizing the logic
 * for handling events and delegating to the appropriate commands.
 * I've been using this pattern for years to simplify complex workflows.
 * 
 * Benefits:
 * - Single entry point for event processing (no more scattered handlers)
 * - Centralized error handling (consistent error management)
 * - Decouples event producers from command execution details (loose coupling)
 * 
 * This pattern has been a lifesaver in large-scale systems where event
 * handling would otherwise be scattered across the codebase.
 */
export interface TransactionManager {
  /** Processes an event by building and executing the appropriate command */
  processEvent(event: TransactionEvent): Promise<void>;
  /** Handles errors that occur during event processing */
  handleError(event: TransactionEvent, error: Error): Promise<void>;
}

/**
 * Service Interfaces - Define contracts for system services
 * 
 * These interfaces enable the Dependency Injection pattern by
 * defining what capabilities a service must provide without
 * specifying how they are implemented. I've been using this approach
 * since the early days of IoC containers, and it's still the best way
 * to build loosely coupled systems.
 * 
 * Benefits:
 * - Swappable implementations (e.g., console logger vs. file logger)
 * - Testability through mock implementations (crucial for unit testing)
 * - Clear documentation of service capabilities (self-documenting code)
 * 
 * I've seen too many systems where services are tightly coupled to their
 * implementations, making them impossible to test or extend. This approach
 * fixes that mess.
 */

/**
 * Logger - Service for recording application information
 * 
 * Never underestimate the importance of good logging. I've spent too many
 * late nights debugging production issues with inadequate logs. A good
 * logging service is worth its weight in gold when things go sideways.
 */
export interface Logger {
  /** Records informational messages */
  log(message: string): void;
  /** Records error messages */
  error(message: string, error?: Error): void;
}

/**
 * MetricsService - Service for recording performance and business metrics
 * 
 * If you're not measuring it, you can't improve it. I've been preaching
 * the importance of metrics for decades, and it's still one of the most
 * underutilized tools in a developer's arsenal.
 */
export interface MetricsService {
  /** Records information about command execution */
  recordExecution(commandId: string, data: Record<string, any>): void;
}

/**
 * ValidationService - Service for validating event payloads
 * 
 * Garbage in, garbage out. I've seen too many systems fail because they
 * didn't validate their inputs properly. This service ensures that events
 * meet the expected schema before processing.
 */
export interface ValidationService {
  /** Validates that an event payload meets expected schema */
  validate(eventType: string, payload: any): boolean;
}

/**
 * AuthService - Service for checking authorization
 * 
 * Security should never be an afterthought. I've been building secure systems
 * since before most developers knew what OAuth was, and proper authorization
 * is crucial for any system handling sensitive data.
 */
export interface AuthService {
  /** Checks if a source is authorized to trigger an event type */
  checkAuthorization(source: string, eventType: string): boolean;
}