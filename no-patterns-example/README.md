# No Patterns Example

This directory contains a demonstration of what the same functionality would look like **without** using proper design patterns. It's deliberately implemented in a "messy" way to highlight the problems that arise when not using patterns.

## Purpose

The purpose of this example is to:

1. Show the contrast between pattern-based and non-pattern-based code
2. Demonstrate why patterns are important
3. Illustrate the problems that patterns solve
4. Help developers appreciate the value of design patterns

## Problems Demonstrated

The code in this directory demonstrates the following problems:

### 1. Tight Coupling

Components directly depend on each other, making it hard to change one part without affecting others. For example:
- The event processing functions directly call the logger, validation, and authorization functions
- The `processMatchStoreToProductEvent` function directly calls `processStoreMatchedEvent`

### 2. Poor Separation of Concerns

Business logic is mixed with infrastructure concerns:
- Logging, validation, and authorization logic is embedded within business logic
- Event processing and error handling are intermingled

### 3. Code Duplication

The same logic is repeated in multiple places:
- Validation logic is duplicated across event handlers
- Authorization checks are duplicated
- Error handling is duplicated

### 4. Hard to Test

The code is difficult to test because:
- Dependencies can't be easily mocked
- Functions have side effects
- Business logic is mixed with infrastructure

### 5. Hard to Extend

Adding new features requires changing existing code:
- Adding a new event type requires modifying the main processing functions
- Adding new capabilities (like analytics) requires modifying every handler

### 6. Brittle

Changes in one part of the code can easily break other parts:
- Changing the validation logic might break the event handlers
- Changing the event structure affects multiple places

## How to Run

To run this example:

```bash
cd no-patterns-example
npx ts-node index.ts
```

## Contrast with Pattern-Based Approach

For comparison, the main project demonstrates how these problems are solved using:

1. **Dependency Injection Pattern**: Loose coupling between components
2. **Builder Pattern**: Flexible object creation
3. **Command Pattern**: Encapsulation of business operations
4. **Decorator Pattern**: Separation of cross-cutting concerns
5. **Factory Pattern**: Centralized object creation
6. **Strategy Pattern**: Interchangeable algorithms
7. **Mediator Pattern**: Coordinated interactions

The pattern-based approach results in code that is:
- More maintainable
- Easier to test
- More flexible
- More extensible
- Less prone to bugs

## Learning from This Example

By studying both approaches, developers can gain a deeper understanding of:
- Why patterns exist
- What problems they solve
- When to apply them
- How they improve code quality

Remember: This example is deliberately bad to illustrate what not to do!