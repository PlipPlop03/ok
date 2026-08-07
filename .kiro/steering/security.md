---
inclusion: always
---

# Security Guidelines

## Mandatory Security Checks

Before ANY commit:
- [ ] No hardcoded secrets (API keys, passwords, tokens)
- [ ] All user inputs validated
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitized HTML)
- [ ] CSRF protection enabled
- [ ] Authentication/authorization verified
- [ ] Rate limiting on all endpoints
- [ ] Error messages don't leak sensitive data

## Secret Management

```typescript
// NEVER: Hardcoded secrets
const apiKey = "sk-proj-xxxxx"

// ALWAYS: Environment variables
const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('OPENAI_API_KEY not configured')
}
```

## Security Response Protocol

If security issue found:
1. STOP immediately
2. Flag the vulnerability with severity level
3. Fix CRITICAL issues before continuing
4. Rotate any exposed secrets
5. Review entire codebase for similar issues

## Common Vulnerabilities to Check

### Injection (SQL, NoSQL, Command)
- Are queries parameterized?
- Is user input sanitized?
- Are ORMs used safely?

### Broken Authentication
- Are passwords hashed (bcrypt, argon2)?
- Is JWT properly validated?
- Are sessions secure?

### Sensitive Data Exposure
- Is HTTPS enforced?
- Are secrets in environment variables?
- Is PII encrypted at rest?
- Are logs sanitized?

### Cross-Site Scripting (XSS)
- Is output escaped/sanitized?
- Is Content-Security-Policy set?
- Are frameworks escaping by default?

### Broken Access Control
- Is authorization checked on every route?
- Are object references indirect?
- Is CORS configured properly?
