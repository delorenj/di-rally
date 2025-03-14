import { 
  TransactionCommandBuilder, 
  TransactionCommand, 
  TransactionEvent,
  PreInvokeHook,
  PostInvokeHook,
  CommandContext
} from './types';

/**
 * Command Builder Implementation
 * 
 * Alright, this is where the real magic happens. I've been refining this approach for decades,
 * and it combines three of my favorite patterns working in beautiful harmony:
 * 
 * 1. Builder Pattern: For fluent, step-by-step construction of commands
 * 2. Factory Pattern: For creating commands based on event types
 * 3. Decorator Pattern: For wrapping commands with additional behaviors
 * 
 * WHAT IS THE BUILDER PATTERN?
 * The Builder Pattern separates the construction of a complex object from its
 * representation. I've seen so many codebases where these concerns get mixed together,
 * and it always ends in tears. Trust me on this one.
 * 
 * WHAT IS THE "withX" PATTERN?
 * The "withX" pattern is my personal favorite way to implement a fluent interface.
 * I started using this back in the Java days, and it's even better in TypeScript.
 * Each "withX" method returns a new builder instance with the additional capability added.
 * It reads like English and makes your code self-documenting.
 * 
 * REAL-WORLD BENEFITS:
 * 1. Composable Capabilities: Mix and match behaviors without touching the core logic
 * 2. Immutability: Each builder configuration is isolated and thread-safe (saved my ass many times)
 * 3. Readability: The chain of "withX" calls clearly shows what capabilities are included
 * 4. Extensibility: New capabilities can be added without changing existing code (Open/Closed Principle FTW)
 * 
 * ALTERNATIVE APPROACHES:
 * - Inheritance: Create subclasses for each combination of behaviors (leads to class explosion - I've seen codebases with 50+ subclasses, absolute nightmare)
 * - Aspect-Oriented Programming: Use aspects to inject cross-cutting concerns (more complex and often overkill)
 * - Direct Modification: Modify command classes directly (reduces reusability and leads to spaghetti code)
 * 
 * WHY THIS IS BETTER:
 * This approach keeps commands focused on their core business logic while allowing
 * capabilities like logging, validation, and metrics to be added declaratively.
 * I've maintained systems using this pattern for 10+ years without major rewrites.
 * Junior devs pick it up quickly, and senior devs appreciate the clean separation of concerns.
 */

/**
 * ShadowTransactionCommandBuilder - Implements the Builder Pattern for commands
 * 
 * I named this "Shadow" because it creates a decorated "shadow" of the original
 * command that includes all the additional capabilities. It's a metaphor I've used
 * for years to explain the pattern to new team members.
 * 
 * This class is responsible for:
 * 1. Registering command factories for different event types
 * 2. Building commands with all their hooks (capabilities)
 * 3. Providing a fluent interface for adding capabilities
 */
export class ShadowTransactionCommandBuilder implements TransactionCommandBuilder {
  /** Hooks that run before command execution */
  private preInvokeHooks: PreInvokeHook[] = [];
  /** Hooks that run after command execution */
  private postInvokeHooks: PostInvokeHook[] = [];
  /** Factories for creating commands based on event types */
  private commandFactories: Map<string, (event: TransactionEvent) => TransactionCommand> = new Map();
  
  /**
   * Registers a factory function for creating commands of a specific event type
   * 
   * This implements the Factory Pattern, which I've been using since the 90s.
   * It centralizes object creation logic and keeps your codebase sane as it grows.
   * 
   * Benefits include:
   * - Encapsulation of creation logic (no more scattered new operators)
   * - Single place to modify when command creation needs to change
   * - Ability to map multiple event types to the same command if needed (DRY principle)
   * 
   * @param eventType The type of event this factory handles
   * @param factory Function that creates a command for the event
   */
  registerCommandFactory(eventType: string, factory: (event: TransactionEvent) => TransactionCommand): void {
    this.commandFactories.set(eventType, factory);
  }
  
  /**
   * Builds a command for the given event with all registered hooks
   * 
   * This method is where all the patterns come together:
   * 1. Finds the appropriate factory for the event type
   * 2. Creates the base command
   * 3. Wraps it with all registered hooks
   * 
   * It's like a well-orchestrated dance that's been refined over many projects.
   * 
   * @param event The event to build a command for
   * @returns A command decorated with all registered hooks
   */
  buildCommand(event: TransactionEvent): TransactionCommand {
    // Find the factory for this event type
    const factory = this.commandFactories.get(event.type);
    if (!factory) {
      throw new Error(`No command factory registered for event type: ${event.type}`);
    }
    
    // Create the base command
    const baseCommand = factory(event);
    // Wrap it with all hooks
    return this.wrapWithHooks(baseCommand);
  }
  
  /**
   * Adds a hook to run before command execution
   * 
   * This is the heart of our "withX" pattern. It creates a new builder with
   * the additional hook, preserving immutability. I've been using this approach
   * since before immutability was cool, and it's saved countless hours of debugging.
   * 
   * 1. Makes capability composition explicit and readable
   * 2. Ensures thread safety through immutability (no more race conditions)
   * 3. Allows different capability stacks for different scenarios
   * 
   * Real-world example: Adding logging, validation, and authorization
   * to commands that modify sensitive data, but only logging for
   * read-only commands. I've used this pattern to implement security
   * in financial systems handling millions of dollars in transactions.
   * 
   * @param hook Function to run before command execution
   * @returns A new builder with the additional hook
   */
  withPreInvokeHook(hook: PreInvokeHook): TransactionCommandBuilder {
    // Create a new builder with the additional hook - immutability FTW!
    const newBuilder = new ShadowTransactionCommandBuilder();
    
    // Copy over existing factories and hooks
    this.commandFactories.forEach((factory, eventType) => {
      newBuilder.registerCommandFactory(eventType, factory);
    });
    
    // Add the new hook to the copied list
    newBuilder.preInvokeHooks = [...this.preInvokeHooks, hook];
    newBuilder.postInvokeHooks = [...this.postInvokeHooks];
    
    return newBuilder;
  }
  
  /**
   * Adds a hook to run after command execution
   * 
   * Similar to withPreInvokeHook, but for post-execution hooks.
   * Post-invoke hooks are perfect for:
   * - Metrics collection (I've built entire performance monitoring systems with this)
   * - Notifications (alerting users or systems about completed operations)
   * - Logging successful completion (audit trails for compliance)
   * - Cleanup operations (releasing resources, closing connections)
   * 
   * @param hook Function to run after command execution
   * @returns A new builder with the additional hook
   */
  withPostInvokeHook(hook: PostInvokeHook): TransactionCommandBuilder {
    // Create a new builder with the additional hook
    const newBuilder = new ShadowTransactionCommandBuilder();
    
    // Copy over existing factories and hooks
    this.commandFactories.forEach((factory, eventType) => {
      newBuilder.registerCommandFactory(eventType, factory);
    });
    
    // Add the new hook to the copied list
    newBuilder.preInvokeHooks = [...this.preInvokeHooks];
    newBuilder.postInvokeHooks = [...this.postInvokeHooks, hook];
    
    return newBuilder;
  }
  
  /**
   * Wraps a command with all registered hooks
   * 
   * This implements the Decorator Pattern, which I've been using since
   * the GoF book came out in '94. It attaches additional responsibilities
   * to objects dynamically. The decorated command maintains the same interface
   * but adds behavior before and after the original method.
   * 
   * Benefits:
   * - Separation of concerns (core logic vs. cross-cutting concerns)
   * - Runtime composition of behaviors (no need to predict all combinations)
   * - Open/Closed Principle: extend functionality without modifying original code
   * 
   * I've used this pattern to add transaction management, security checks,
   * and performance monitoring to legacy systems without touching their core code.
   * It's like a superpower for maintaining old codebases.
   * 
   * @param command The original command to wrap
   * @returns A decorated command that includes all hooks
   */
  private wrapWithHooks(command: TransactionCommand): TransactionCommand {
    // Return a decorated command that includes all hooks
    return {
      commandId: command.commandId,
      invoke: async (context: CommandContext) => {
        // Execute pre-invoke hooks in registration order
        for (const hook of this.preInvokeHooks) {
          await hook(command, context);
        }
        
        // Execute the actual command (core business logic)
        await command.invoke(context);
        
        // Execute post-invoke hooks in registration order
        for (const hook of this.postInvokeHooks) {
          await hook(command, context);
        }
      }
    };
  }
}