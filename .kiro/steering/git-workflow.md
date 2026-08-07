---
inclusion: always
---

# Git Workflow

## Commit Message Format

```
<type>: <description>

<optional body>
```

Types: feat, fix, refactor, docs, test, chore, perf, ci

## Pull Request Workflow

When creating PRs:
1. Analyze full commit history (not just latest commit)
2. Use `git diff [base-branch]...HEAD` to see all changes
3. Draft comprehensive PR summary
4. Include test plan
5. Push with `-u` flag if new branch

## Feature Implementation Workflow

1. **Plan First** - Create implementation plan for complex features
2. **TDD Approach** - Write tests first, implement to pass, refactor
3. **Code Review** - Review immediately after writing code
4. **Commit & Push** - Detailed commit messages, conventional commits

## Branch Strategy

- Never commit directly to main/master
- Use feature branches: `feat/feature-name`, `fix/bug-description`
- PRs require passing CI before merge
- Keep PRs focused and atomic
