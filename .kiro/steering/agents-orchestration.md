---
inclusion: always
---

# Agent Orchestration Guidelines

## When to Delegate to Sub-Agents

Use sub-agents for independent, parallelizable work:
- Security analysis of specific files
- Performance review of specific modules
- Type checking isolated components
- Documentation generation for separate areas

## Multi-Perspective Analysis

For complex problems, consider multiple perspectives:
- Factual accuracy review
- Senior engineer review (architecture)
- Security expert review (vulnerabilities)
- Consistency review (patterns match codebase)

## Feature Implementation Workflow

For complex features, follow this sequence:
1. **Plan** - Break down into phases with dependencies and risks
2. **Implement** - TDD approach (tests first, then code)
3. **Review** - Code quality and security review
4. **Verify** - Build, type-check, lint, test suite

## When to Plan vs Act

- Simple bug fixes: Act immediately
- Single-file changes: Act immediately
- Multi-file features: Plan first
- Architectural changes: Plan first, get confirmation
- Refactoring: Plan first, identify risk level
