// Core event interfaces
export interface EventMetadata {
  correlationId: string;
  causationId: string;
  timestamp: Date;
  source: string;
}

export interface TransactionEvent<T = any> {
  id: string;
  type: string;
  payload: T;
  metadata: EventMetadata;
}

// Command interfaces
export interface CommandContext {
  event: TransactionEvent;
  state: any;
  eventCollector: EventCollector;
}

export interface TransactionCommand {
  commandId: string;
  invoke(context: CommandContext): Promise<void>;
}

// Event collector for managing side effects
export interface EventCollector {
  addEvent(event: TransactionEvent): void;
  getEvents(): TransactionEvent[];
  clear(): void;
}

// Hook types for our builder pattern
export type PreInvokeHook = (command: TransactionCommand, context: CommandContext) => Promise<void>;
export type PostInvokeHook = (command: TransactionCommand, context: CommandContext) => Promise<void>;

// Command builder interface
export interface TransactionCommandBuilder {
  buildCommand(event: TransactionEvent): TransactionCommand;
  withPreInvokeHook(hook: PreInvokeHook): TransactionCommandBuilder;
  withPostInvokeHook(hook: PostInvokeHook): TransactionCommandBuilder;
}

// Transaction manager interface
export interface TransactionManager {
  processEvent(event: TransactionEvent): Promise<void>;
  handleError(event: TransactionEvent, error: Error): Promise<void>;
}

// Service interfaces
export interface Logger {
  log(message: string): void;
  error(message: string, error?: Error): void;
}

export interface MetricsService {
  recordExecution(commandId: string, data: Record<string, any>): void;
}

export interface ValidationService {
  validate(eventType: string, payload: any): boolean;
}

export interface AuthService {
  checkAuthorization(source: string, eventType: string): boolean;
}