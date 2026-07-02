Security hardening applied for RC1
=================================

Overview
--------
This document describes the security hardening steps applied to the backend for Release Candidate 1.

What was added
--------------
- Helmet middleware for secure HTTP headers (CSP disabled by default; configure in deployment).
- HTTP parameter pollution protection using `hpp`.
- Request sanitization with `express-mongo-sanitize` to prevent NoSQL operator injection.
- Input sanitization with `xss-clean` to mitigate reflected/stored XSS via request payloads.
- Global rate limiting (`express-rate-limit`) and a stricter per-IP limiter on authentication endpoints to reduce brute-force attacks.
- Enforced small JSON and URL-encoded body size limits to reduce attack surface for large payloads.

How to run security checks
--------------------------
- Run dependency audit:

```bash
cd backend
npm audit --audit-level=moderate
```

Notes & recommendations
-----------------------
- CSP: Helmet's `contentSecurityPolicy` has been disabled to avoid blocking legitimate inline styles/scripts during RC; configure a strict CSP in production via deployment configuration.
- JWT: Current `JWT_EXPIRES_IN` defaults to `1d`. For higher security consider shorter lifetimes and a refresh-token strategy.
- Tokens are stored in `localStorage` by the frontend — this is intentional. If you want to reduce XSS risk further, consider moving tokens to httpOnly cookies and adjusting CSRF protections.
- Consider adding `rateLimit` per sensitive endpoints (user registration, password reset) beyond auth routes.
- Run regular `npm audit` and subscribe to dependency advisories.
- Consider integrating a WAF and secrets scanning in CI/CD pipelines.

