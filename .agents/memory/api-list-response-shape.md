---
name: api-list-response-shape
description: All list endpoints must return { items, total } not a plain array.
---

The Orval-generated React Query hooks for list endpoints (e.g. `useListLostItems`, `useListFoundItems`, `useListClaims`) expect the response to be an object with `items` (array) and `total` (number).

**Why:** The OpenAPI spec defines the response shape as `{ items: [...], total: number }` and Orval generates types accordingly. Returning a plain array causes TypeScript errors and `undefined` when the frontend reads `.items` or `.total`.

**How to apply:** Every `router.get("/resource-list", ...)` handler must end with:
```typescript
res.json({ items: formattedItems, total: formattedItems.length });
```
Never `res.json(items.map(...))` for list routes.
