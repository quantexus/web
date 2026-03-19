---
name: review-code
description: Review code for correctness, type safety, and convention compliance
disable-model-invocation: false
allowed-tools: Read, Glob, Grep
argument-hint: "[file-or-directory-path]"
---

# Review Code

Review the specified file or directory for compliance with project rules.

## Checklist

For each file, check:

1. **Numeric precision:** No `parseFloat` or `Number()` on financial strings. All financial arithmetic uses `BigInt`. Display conversions go through `src/lib/utils/format.ts`.
2. **Type safety:** No `any` types anywhere — components, hooks, tests, or API routes. All engine response shapes come from `src/lib/engine/types.ts`.
3. **Architecture:** No business logic in components (extract to hooks). No direct `fetch` in components (use TanStack Query hooks). No gRPC types leaking to the browser — API routes return plain JSON only.
4. **BFF layer:** Each API route validates the incoming request, calls the engine via `src/lib/engine/client.ts`, and returns plain JSON.
5. **Naming:** Follows the convention table in CLAUDE.md (PascalCase components, `use{Name}` hooks, `{name}.store.ts` stores, etc.).
6. **Testing:** Hooks and components have tests. Error paths have tests. API route tests mock `src/lib/engine/client.ts` only.
7. **Code style:** No dead code. No `console.log`. No TODO without a tracking issue. No commented-out code.

## Output

List findings as:
- **VIOLATION:** Hard rule broken, must fix.
- **WARNING:** Potential issue, should review.
- **OK:** Section passes review.

Provide specific file:line references for each finding.
