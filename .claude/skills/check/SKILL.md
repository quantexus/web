---
name: check
description: Run full CI checks (lint, typecheck, test) on the project
disable-model-invocation: false
allowed-tools: Bash
argument-hint: ""
---

# Check

Run the full CI validation suite.

## Steps

1. Run `pnpm lint`. If it fails, report which files have lint errors.
2. Run `pnpm typecheck`. Report any type errors.
3. Run `pnpm test`. Report failures.

Report a clear summary at the end: all passed, or list what failed.
