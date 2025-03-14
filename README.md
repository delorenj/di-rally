# DI Rally - Design Pattern Demo

This project demonstrates a dependency injection (DI) pattern for a command-based system. It showcases how to use various design patterns including:

- Dependency Injection
- Builder Pattern
- Command Pattern
- Factory Pattern
- Decorator Pattern

## Features

- Clean separation of concerns
- Flexible capability composition
- Type-safe dependency injection
- Runtime configuration of behavior stacks

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

```bash
npm install
```

### Running the Demo

```bash
npm start
```

## Project Structure

- `core/`: Core interfaces and implementations
  - `di-container.ts`: Dependency injection container
  - `command-builder.ts`: Builder pattern implementation
  - `transaction-manager.ts`: Command orchestration
  - `types.ts`: Type definitions
- `commands/`: Command implementations
- `services/`: Service implementations
- `hooks/`: Capability hooks for extending functionality

## The "withX" Pattern

The project demonstrates the "withX" pattern which allows for composing capabilities onto commands:

```typescript
const enhancedBuilder = commandBuilder
  .withPreInvokeHook(createLoggingHook(logger))
  .withPreInvokeHook(createValidationHook(validator))
  .withPostInvokeHook(createMetricsHook(metricsService));
```

This pattern is particularly powerful for building maintainable, modular systems that can evolve over time.

## Design Pattern Visualizations

The following diagrams visualize the key design patterns used in this project and how they work together.

### Dependency Injection Pattern

```mermaid
graph TD
    A[Client Code] -->|Requests service| B[DI Container]
    B -->|Resolves| C[Service Interface]
    C -->|Implements| D[Service Implementation A]
    C -->|Implements| E[Service Implementation B]
    B -->|Registers| D
    B -->|Registers| E
    
    subgraph "Runtime Selection"
        B
    end
    
    subgraph "Compile-time Contract"
        C
    end
    
    subgraph "Implementations"
        D
        E
    end
    
    classDef container fill:#f9f,stroke:#333,stroke-width:2px;
    classDef interface fill:#bbf,stroke:#333,stroke-width:1px;
    classDef implementation fill:#bfb,stroke:#333,stroke-width:1px;
    
    class B container;
    class C interface;
    class D,E implementation;
```

**Benefits:**
- Loose coupling between components
- Easy to swap implementations
- Simplified testing with mock implementations
- Centralized dependency management

### Builder Pattern with "withX" Methods

```mermaid
graph LR
    A[Base Builder] -->|withPreInvokeHook| B[Builder + PreHook1]
    B -->|withPreInvokeHook| C[Builder + PreHook1 + PreHook2]
    C -->|withPostInvokeHook| D[Builder + PreHook1 + PreHook2 + PostHook]
    D -->|buildCommand| E[Decorated Command]
    
    subgraph "Immutable Builder Chain"
        A
        B
        C
        D
    end
    
    subgraph "Final Product"
        E
    end
    
    classDef builder fill:#fbb,stroke:#333,stroke-width:1px;
    classDef product fill:#bbf,stroke:#333,stroke-width:2px;
    
    class A,B,C,D builder;
    class E product;
```

**Benefits:**
- Fluent interface for configuration
- Immutable builder instances
- Clear separation between construction and representation
- Flexible capability composition

### Command Pattern

```mermaid
graph TD
    A[Event] -->|Triggers| B[Command Builder]
    B -->|Creates| C[Command]
    C -->|Executes| D[Business Logic]
    D -->|Produces| E[Side Effects]
    
    subgraph "Encapsulation"
        C
        D
    end
    
    classDef event fill:#fbb,stroke:#333,stroke-width:1px;
    classDef command fill:#bbf,stroke:#333,stroke-width:2px;
    classDef logic fill:#bfb,stroke:#333,stroke-width:1px;
    classDef effect fill:#fbf,stroke:#333,stroke-width:1px;
    
    class A event;
    class B,C command;
    class D logic;
    class E effect;
```

**Benefits:**
- Encapsulates business operations
- Decouples sender from receiver
- Enables command history and undo operations
- Supports queueing and prioritization

### How Patterns Work Together

```mermaid
graph TD
    A[Event] -->|Received by| B[Transaction Manager]
    B -->|Uses| C[DI Container]
    C -->|Resolves| D[Command Builder]
    D -->|Creates| E[Command]
    E -->|Enhanced with| F[Pre-Invoke Hooks]
    E -->|Enhanced with| G[Post-Invoke Hooks]
    E -->|Executes| H[Business Logic]
    H -->|Produces| I[Side Effects]
    
    subgraph "Mediator Pattern"
        B
    end
    
    subgraph "Dependency Injection Pattern"
        C
    end
    
    subgraph "Builder Pattern"
        D
    end
    
    subgraph "Command Pattern"
        E
        H
    end
    
    subgraph "Decorator Pattern"
        F
        G
    end
    
    classDef mediator fill:#f9f,stroke:#333,stroke-width:2px;
    classDef di fill:#bbf,stroke:#333,stroke-width:2px;
    classDef builder fill:#fbb,stroke:#333,stroke-width:2px;
    classDef command fill:#bfb,stroke:#333,stroke-width:2px;
    classDef decorator fill:#fbf,stroke:#333,stroke-width:2px;
    
    class B mediator;
    class C di;
    class D builder;
    class E,H command;
    class F,G decorator;
```

**Benefits of Combined Patterns:**
- Clean separation of concerns
- Highly testable components
- Flexible capability composition
- Extensible architecture that evolves gracefully