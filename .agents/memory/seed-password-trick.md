---
name: seed-password-trick
description: How to seed bcryptjs-hashed passwords via the API since bcryptjs can't be imported in code_execution sandbox.
---

The `code_execution` sandbox can't import bcryptjs from workspace packages. To seed users with correct bcryptjs hashes:

1. Register a temp user via the running API endpoint with the desired password.
2. Query the DB to get the `password_hash` value from that user.
3. Copy the hash to the target users via SQL UPDATE.
4. Delete the temp user.

**Why:** bcryptjs is a workspace package, not available in the notebook sandbox's module resolution. The running API server already uses bcryptjs, so registering via the API gives a valid hash.

**How to apply:** Use this pattern when seeding demo users or resetting passwords during development.
