/**
 * Core Type Definitions
 * 
 * This file defines the fundamental interfaces used throughout the application.
 * These interfaces establish a contract that all implementations must follow,
 * which is a key principle in building loosely coupled systems.
 * 
 * By defining these interfaces separately from their implementations, we enable:
 * 1. Multiple implementations of the same interface (polymorphism)
 * 2. Easy mocking for unit tests
 * 3. Clear separation of concerns
 * 4. Documentation of the expected behavior
 */

/**
 * Event Metadata - Contains contextual information about an event
 * 
 * The metadata pattern helps with tracing, debugging, and understanding
 * the flow of events through a system. It's especially valuable in
 * distributed systems where events pass through multiple services.
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
 * Using events as the primary communication mechanism creates a system that:
 * - Has a clear audit trail of all actions
 * - Can be replayed for debugging or recovery
 * - Allows for loose coupling between components
 * 
 * This is a simplified version of the event sourcing pattern.
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
 * without requiring tight coupling to specific implementations. This pattern:
 * - Simplifies testing by allowing mock contexts
 * - Enables commands to be reused in different scenarios
 * - Provides a clean way to pass state between hooks and commands
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
 * - Parameterization of clients with different requests
 * - Queueing of requests
 * - Logging of requests
 * - Supporting undoable operations
 * 
 * In our system, commands represent business operations triggered by events.
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
 * This implements the Collecting Parameter pattern, where a parameter
 * collects information during the execution of a method.
 * 
 * Benefits:
 * - Avoids direct dependencies on event publishing mechanisms
 * - Makes side effects explicit and trackable
 * - Simplifies testing by allowing inspection of produced events
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
 * to commands without modifying their code. This is a powerful way to:
 * - Add cross-cutting concerns like logging, validation, and metrics
 * - Compose functionality in a mix-and-match way
 * - Keep the core command logic focused on business rules
 */
export type PreInvokeHook = (command: TransactionCommand, context: CommandContext) => Promise<void>;
export type PostInvokeHook = (command: TransactionCommand, context: CommandContext) => Promise<void>;

/**
 * TransactionCommandBuilder - Implements the Builder Pattern
 * 
 * The Builder Pattern separates the construction of complex objects
 * from their representation. In our case, it builds commands with
 * all their associated hooks.
 * 
 * Benefits:
 * - Fluent interface for adding capabilities
 * - Immutable builder instances for thread safety
 * - Encapsulates the complexity of wiring hooks to commands
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
 * 
 * Benefits:
 * - Single entry point for event processing
 * - Centralized error handling
 * - Decouples event producers from command execution details
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
 * specifying how they are implemented.
 * 
 * Benefits:
 * - Swappable implementations (e.g., console logger vs. file logger)
 * - Testability through mock implementations
 * - Clear documentation of service capabilities
 */

/**
 * Logger - Service for recording application information
 */
export interface Logger {
  /** Records informational messages */
  log(message: string): void;
  /** Records error messages */
  error(message: string, error?: Error): void;
}

/**
 * MetricsService - Service for recording performance and business metrics
 */
export interface MetricsService {
  /** Records information about command execution */
  recordExecution(commandId: string, data: Record<string, any>): void;
}

/**
 * ValidationService - Service for validating event payloads
 */
export interface ValidationService {
  /** Validates that an event payload meets expected schema */
  validate(eventType: string, payload: any): boolean;
}

/**
 * AuthService - Service for checking authorization
 */
export interface AuthService {
  /** Checks if a source is authorized to trigger an event type */
  checkAuthorization(source: string, eventType: string): boolean;
}