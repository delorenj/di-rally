# Plan for Adding Comprehensive Comments

## Core Concepts to Explain

1. **Dependency Injection Pattern**
   - What: A technique where object dependencies are "injected" rather than created internally
   - Why: Promotes loose coupling, testability, and flexibility
   - Where: `di-container.ts`

2. **Builder Pattern**
   - What: A pattern that allows constructing complex objects step by step
   - Why: Provides flexibility in object creation, readability, and immutability
   - Where: `command-builder.ts`

3. **Command Pattern**
   - What: Encapsulates a request as an object
   - Why: Decouples sender from receiver, enables queueing, logging, and undo operations
   - Where: `commands/*.ts`

4. **Decorator Pattern**
   - What: Attaches additional responsibilities to objects dynamically
   - Why: Extends functionality without modifying original code
   - Where: `hooks/index.ts`

5. **Factory Pattern**
   - What: Creates objects without specifying exact class
   - Why: Centralizes object creation logic, simplifies client code
   - Where: Used in DI container and command builder

## Comment Structure

For each file, comments should include:

1. **File Header**: Overall purpose and patterns used
2. **Class/Interface Headers**: Role in the design pattern implementation
3. **Method Headers**: Purpose and how they contribute to the pattern
4. **Inline Comments**: Explanations of complex logic or pattern-specific implementations
5. **"Real-world Benefits"**: Practical advantages for maintainability, scalability, etc.

## Files to Update (in order)

1. `core/types.ts` - Define the interfaces and types
2. `core/di-container.ts` - Dependency Injection implementation
3. `core/command-builder.ts` - Builder pattern implementation
4. `core/transaction-manager.ts` - Command orchestration
5. `commands/*.ts` - Command implementations
6. `hooks/index.ts` - Hook implementations (Decorator pattern)
7. `services/*.ts` - Service implementations
8. `index.ts` - Main demo file showing everything working together