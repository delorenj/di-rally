/**
 * Dependency Injection Container Implementation
 * 
 * This file implements the Dependency Injection (DI) pattern, which is one of the
 * most powerful patterns for building maintainable, testable applications.
 * 
 * WHAT IS DEPENDENCY INJECTION?
 * Instead of components creating their dependencies directly, dependencies are
 * "injected" from the outside. This inverts the control of dependency creation.
 * 
 * REAL-WORLD BENEFITS:
 * 1. Testability: Services can be easily mocked for unit testing
 * 2. Flexibility: Implementations can be swapped without changing consumers
 * 3. Centralized Configuration: All dependencies are configured in one place
 * 4. Lifecycle Management: Container can manage object lifetimes (singleton vs transient)
 * 
 * ALTERNATIVE APPROACHES:
 * - Service Locator: Components look up their dependencies (more coupling)
 * - Direct Instantiation: Components create their dependencies (tight coupling)
 * 
 * WHY THIS IS BETTER:
 * DI leads to cleaner, more modular code where components focus on their core
 * responsibilities rather than managing dependencies.
 */

/** 
 * ServiceIdentifier - A unique token that identifies a service in the container
 * 
 * Using symbols provides guaranteed uniqueness and prevents accidental collisions
 * that might occur with string identifiers.
 */
export type ServiceIdentifier = symbol;

/**
 * ServiceDefinition - Defines how a service should be created
 * 
 * This interface shows the flexibility of our DI container by supporting
 * multiple ways to create services:
 * - Class instantiation (useClass)
 * - Factory functions (useFactory)
 * - Existing values (useValue)
 * 
 * It also supports different lifecycles:
 * - Singleton: One instance shared throughout the application
 * - Transient: New instance created on each resolution
 */
export interface ServiceDefinition {
  /** Class to instantiate when resolving this service */
  useClass?: new (...args: any[]) => any;
  /** Factory function to call when resolving this service */
  useFactory?: (container: DIContainer) => any;
  /** Existing value to use when resolving this service */
  useValue?: any;
  /** Lifecycle of the service (singleton or transient) */
  lifetime?: 'singleton' | 'transient';
}

/**
 * DIContainer - The core dependency injection container
 * 
 * This class implements a simple but powerful DI container that:
 * - Registers service definitions
 * - Resolves services when needed
 * - Manages service lifecycles
 * 
 * In a production system, you might use an established DI library like
 * InversifyJS, tsyringe, or NestJS's built-in DI, but this implementation
 * shows the core concepts without external dependencies.
 */
export class DIContainer {
  /** Map of service definitions by their identifiers */
  private services: Map<ServiceIdentifier, ServiceDefinition> = new Map();
  /** Cache of singleton instances */
  private instances: Map<ServiceIdentifier, any> = new Map();

  /**
   * Registers a service with the container
   * 
   * Registration is separate from resolution, allowing all services
   * to be configured at application startup before any are used.
   * 
   * @param id Unique identifier for the service
   * @param definition How the service should be created
   */
  register(id: ServiceIdentifier, definition: ServiceDefinition): void {
    this.services.set(id, definition);
  }

  /**
   * Resolves a service from the container
   * 
   * This is where the DI magic happens! When a component needs a dependency,
   * it asks the container to resolve it, and the container creates or returns
   * the appropriate instance.
   * 
   * @param id Identifier of the service to resolve
   * @returns The resolved service instance
   */
  resolve<T>(id: ServiceIdentifier): T {
    const definition = this.services.get(id);
    if (!definition) {
      throw new Error(`Service not registered: ${String(id)}`);
    }

    // Check if we have a singleton instance already
    if (definition.lifetime === 'singleton' && this.instances.has(id)) {
      return this.instances.get(id) as T;
    }

    // Create new instance using the appropriate method
    let instance: T;
    if (definition.useClass) {
      // Class-based instantiation
      instance = new definition.useClass() as T;
    } else if (definition.useFactory) {
      // Factory-based instantiation (allows for more complex creation logic)
      instance = definition.useFactory(this) as T;
    } else if (definition.useValue) {
      // Value-based resolution (for constants or existing instances)
      instance = definition.useValue as T;
    } else {
      throw new Error('Invalid service definition');
    }

    // Store singleton instances for future resolutions
    if (definition.lifetime === 'singleton') {
      this.instances.set(id, instance);
    }

    return instance;
  }

  /**
   * Clears all cached singleton instances
   * 
   * This is particularly useful for testing, where you might want
   * to reset the container between tests.
   */
  clearInstances(): void {
    this.instances.clear();
  }
}

/**
 * Service Identifiers
 * 
 * Using symbols as service identifiers provides type safety and prevents
 * accidental collisions. This is better than string identifiers because:
 * 1. Symbols are guaranteed to be unique
 * 2. TypeScript can enforce correct usage
 * 3. Refactoring tools work better with symbols than with string literals
 * 
 * This approach is similar to how Angular's DI system uses injection tokens.
 */
export const SERVICE_IDENTIFIERS = {
  LOGGER: Symbol('LOGGER'),
  METRICS_SERVICE: Symbol('METRICS_SERVICE'),
  VALIDATION_SERVICE: Symbol('VALIDATION_SERVICE'),
  AUTH_SERVICE: Symbol('AUTH_SERVICE'),
  EVENT_COLLECTOR: Symbol('EVENT_COLLECTOR'),
  COMMAND_BUILDER: Symbol('COMMAND_BUILDER'),
  TRANSACTION_MANAGER: Symbol('TRANSACTION_MANAGER')
};