---
inclusion: fileMatch
fileMatchPattern: "**/auth/**,**/api/**,**/middleware/**,**/*auth*,**/*security*,**/*token*,**/*session*"
---

# Security Review (Auto-triggered for security-sensitive files)

When working on authentication, API endpoints, middleware, or security-related code, apply these additional checks:

## OWASP Top 10 Quick Check

1. **Injection** - Are all queries parameterized? Is user input sanitized?
2. **Broken Auth** - Passwords hashed? JWT validated? Sessions secure?
3. **Sensitive Data** - HTTPS enforced? Secrets in env vars? PII encrypted?
4. **XXE** - XML parsers configured securely?
5. **Broken Access Control** - Auth checked on every route? CORS configured?
6. **Misconfig** - Debug mode off in prod? Security headers set?
7. **XSS** - Output escaped? CSP set?
8. **Insecure Deserialization** - User input deserialized safely?
9. **Vulnerable Components** - Dependencies up to date? npm audit clean?
10. **Insufficient Logging** - Security events logged? Alerts configured?

## Vulnerability Patterns to Detect

### Hardcoded Secrets (CRITICAL)
```javascript
// ❌ CRITICAL
const apiKey = "sk-proj-xxxxx"

// ✅ CORRECT
const apiKey = process.env.OPENAI_API_KEY
```

### SQL Injection (CRITICAL)
```javascript
// ❌ CRITICAL
const query = `SELECT * FROM users WHERE id = ${userId}`

// ✅ CORRECT - Use parameterized queries or ORM
const { data } = await supabase.from('users').select('*').eq('id', userId)
```

### Command Injection (CRITICAL)
```javascript
// ❌ CRITICAL
exec(`ping ${userInput}`)

// ✅ CORRECT - Use libraries, not shell
dns.lookup(userInput, callback)
```

### SSRF (HIGH)
```javascript
// ❌ HIGH
const response = await fetch(userProvidedUrl)

// ✅ CORRECT - Validate and whitelist
const url = new URL(userProvidedUrl)
if (!allowedDomains.includes(url.hostname)) throw new Error('Invalid URL')
```

### Race Conditions in Financial Operations (CRITICAL)
```javascript
// ❌ CRITICAL - Race condition
const balance = await getBalance(userId)
if (balance >= amount) await withdraw(userId, amount)

// ✅ CORRECT - Atomic transaction with lock
await db.transaction(async (trx) => {
  const balance = await trx('balances').where({ user_id: userId }).forUpdate().first()
  if (balance.amount < amount) throw new Error('Insufficient balance')
  await trx('balances').where({ user_id: userId }).decrement('amount', amount)
})
```

## Rate Limiting Check

All API endpoints should have rate limiting:
```javascript
import rateLimit from 'express-rate-limit'
const limiter = rateLimit({ windowMs: 60 * 1000, max: 10 })
app.post('/api/sensitive', limiter, handler)
```
