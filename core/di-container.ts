export type ServiceIdentifier = symbol;

export interface ServiceDefinition {
  useClass?: new (...args: any[]) => any;
  useFactory?: (container: DIContainer) => any;
  useValue?: any;
  lifetime?: 'singleton' | 'transient';
}

export class DIContainer {
  private services: Map<ServiceIdentifier, ServiceDefinition> = new Map();
  private instances: Map<ServiceIdentifier, any> = new Map();

  register(id: ServiceIdentifier, definition: ServiceDefinition): void {
    this.services.set(id, definition);
  }

  resolve<T>(id: ServiceIdentifier): T {
    const definition = this.services.get(id);
    if (!definition) {
      throw new Error(`Service not registered: ${String(id)}`);
    }

    // Check if we have a singleton instance already
    if (definition.lifetime === 'singleton' && this.instances.has(id)) {
      return this.instances.get(id) as T;
    }

    // Create new instance
    let instance: T;
    if (definition.useClass) {
      instance = new definition.useClass() as T;
    } else if (definition.useFactory) {
      instance = definition.useFactory(this) as T;
    } else if (definition.useValue) {
      instance = definition.useValue as T;
    } else {
      throw new Error('Invalid service definition');
    }

    // Store singleton instances
    if (definition.lifetime === 'singleton') {
      this.instances.set(id, instance);
    }

    return instance;
  }

  // Optional: method to clear instances (useful for testing)
  clearInstances(): void {
    this.instances.clear();
  }
}

// Service identifiers - these are the "tokens" we'll use to identify services
export const SERVICE_IDENTIFIERS = {
  LOGGER: Symbol('LOGGER'),
  METRICS_SERVICE: Symbol('METRICS_SERVICE'),
  VALIDATION_SERVICE: Symbol('VALIDATION_SERVICE'),
  AUTH_SERVICE: Symbol('AUTH_SERVICE'),
  EVENT_COLLECTOR: Symbol('EVENT_COLLECTOR'),
  COMMAND_BUILDER: Symbol('COMMAND_BUILDER'),
  TRANSACTION_MANAGER: Symbol('TRANSACTION_MANAGER')
};