import { 
  TransactionCommandBuilder, 
  TransactionCommand, 
  TransactionEvent,
  PreInvokeHook,
  PostInvokeHook,
  CommandContext
} from './types';

/**
 * The ShadowTransactionCommandBuilder is where the magic happens!
 * It implements our capability composition pattern, allowing us to
 * stack behaviors onto our commands without modifying their core logic.
 */
export class ShadowTransactionCommandBuilder implements TransactionCommandBuilder {
  private preInvokeHooks: PreInvokeHook[] = [];
  private postInvokeHooks: PostInvokeHook[] = [];
  private commandFactories: Map<string, (event: TransactionEvent) => TransactionCommand> = new Map();
  
  registerCommandFactory(eventType: string, factory: (event: TransactionEvent) => TransactionCommand): void {
    this.commandFactories.set(eventType, factory);
  }
  
  buildCommand(event: TransactionEvent): TransactionCommand {
    const factory = this.commandFactories.get(event.type);
    if (!factory) {
      throw new Error(`No command factory registered for event type: ${event.type}`);
    }
    
    const baseCommand = factory(event);
    return this.wrapWithHooks(baseCommand);
  }
  
  /**
   * This is the heart of our builder pattern - it allows us to add capabilities
   * in a fluent, immutable way. Each call returns a new builder with the added hook.
   */
  withPreInvokeHook(hook: PreInvokeHook): TransactionCommandBuilder {
    // Create a new builder with the additional hook - immutability FTW!
    const newBuilder = new ShadowTransactionCommandBuilder();
    
    // Copy over existing factories and hooks
    this.commandFactories.forEach((factory, eventType) => {
      newBuilder.registerCommandFactory(eventType, factory);
    });
    
    newBuilder.preInvokeHooks = [...this.preInvokeHooks, hook];
    newBuilder.postInvokeHooks = [...this.postInvokeHooks];
    
    return newBuilder;
  }
  
  withPostInvokeHook(hook: PostInvokeHook): TransactionCommandBuilder {
    // Create a new builder with the additional hook
    const newBuilder = new ShadowTransactionCommandBuilder();
    
    // Copy over existing factories and hooks
    this.commandFactories.forEach((factory, eventType) => {
      newBuilder.registerCommandFactory(eventType, factory);
    });
    
    newBuilder.preInvokeHooks = [...this.preInvokeHooks];
    newBuilder.postInvokeHooks = [...this.postInvokeHooks, hook];
    
    return newBuilder;
  }
  
  /**
   * The wrapper method creates a decorator around our command that
   * executes all hooks in the right order.
   */
  private wrapWithHooks(command: TransactionCommand): TransactionCommand {
    // Return a decorated command that includes all hooks
    return {
      commandId: command.commandId,
      invoke: async (context: CommandContext) => {
        // Execute pre-invoke hooks
        for (const hook of this.preInvokeHooks) {
          await hook(command, context);
        }
        
        // Execute the actual command
        await command.invoke(context);
        
        // Execute post-invoke hooks
        for (const hook of this.postInvokeHooks) {
          await hook(command, context);
        }
      }
    };
  }
}