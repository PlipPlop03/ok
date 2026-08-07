---
inclusion: manual
---

# TDD Workflow Guide

When implementing features with test-driven development:

## The TDD Cycle

```
RED → GREEN → REFACTOR → REPEAT

RED:      Write a failing test
GREEN:    Write minimal code to pass
REFACTOR: Improve code, keep tests passing
REPEAT:   Next feature/scenario
```

## Step-by-Step Process

### Step 1: Define Interfaces (SCAFFOLD)
- Define types/interfaces for inputs and outputs
- Create stub functions that throw "Not implemented"

### Step 2: Write Failing Tests (RED)
- Write tests that exercise the interface
- Include happy path, edge cases, and error scenarios
- Run tests — they MUST fail

### Step 3: Implement Minimal Code (GREEN)
- Write just enough code to make tests pass
- Don't over-engineer or optimize yet
- Run tests — they MUST pass

### Step 4: Refactor (IMPROVE)
- Extract constants, improve naming
- Remove duplication
- Run tests — they MUST still pass

### Step 5: Verify Coverage
- Run coverage report
- Ensure 80%+ coverage
- Add tests for any uncovered paths

## Test Types to Include

### Unit Tests (Always)
- Individual functions in isolation
- Mock external dependencies
- Test edge cases: null, empty, boundary values

### Integration Tests (For APIs/DB)
- API endpoints with real-ish data
- Database operations
- Service-to-service communication

### E2E Tests (Critical Flows)
- User journeys that involve multiple components
- Financial transactions
- Authentication flows

## Mocking Guidelines

- Mock external services (APIs, databases) in unit tests
- Use real implementations in integration tests when possible
- Never mock the thing you're testing
- Prefer dependency injection for testability
