---
inclusion: always
---

# Testing Requirements

## Minimum Test Coverage: 80%

Test Types (ALL required for complete features):
1. **Unit Tests** - Individual functions, utilities, components
2. **Integration Tests** - API endpoints, database operations
3. **E2E Tests** - Critical user flows (Playwright)

## Test-Driven Development

Preferred workflow:
1. Write test first (RED)
2. Run test - it should FAIL
3. Write minimal implementation (GREEN)
4. Run test - it should PASS
5. Refactor (IMPROVE)
6. Verify coverage (80%+)

## Edge Cases You MUST Test

1. **Null/Undefined**: What if input is null?
2. **Empty**: What if array/string is empty?
3. **Invalid Types**: What if wrong type passed?
4. **Boundaries**: Min/max values
5. **Errors**: Network failures, database errors
6. **Race Conditions**: Concurrent operations
7. **Large Data**: Performance with 10k+ items
8. **Special Characters**: Unicode, emojis, SQL characters

## Troubleshooting Test Failures

1. Check test isolation (no shared state between tests)
2. Verify mocks are correct
3. Fix implementation, not tests (unless tests are wrong)
4. Use proper assertions (specific and meaningful)

## Test Smells to Avoid

- Testing implementation details instead of behavior
- Tests that depend on each other
- Arbitrary timeouts instead of proper waits
- Mocking everything (prefer integration tests for key flows)
