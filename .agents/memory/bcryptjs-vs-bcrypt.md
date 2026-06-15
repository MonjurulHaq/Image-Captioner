---
name: bcryptjs-vs-bcrypt
description: Native bcrypt cannot be built in this Replit env; always use bcryptjs instead.
---

The `bcrypt` package requires a native `.node` binary (`bcrypt_lib.node`) that cannot be compiled in this Replit NixOS sandbox. The server crashes at startup with `Cannot find module '.../bcrypt_lib.node'`.

**Why:** Native module compilation (node-gyp) is blocked in this environment.

**How to apply:** Whenever adding password hashing, install `bcryptjs` (pure JS) instead of `bcrypt`. The API is identical — just change the import. Also install `@types/bcryptjs` as a dev dependency.

Replace `import bcrypt from "bcrypt"` with `import bcrypt from "bcryptjs"` — no other code changes needed.
