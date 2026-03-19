---
name: test
description: Run Vitest tests with optional filters
disable-model-invocation: false
allowed-tools: Bash
argument-hint: "[-- test-filter]"
---

# Test

Run Vitest tests for the project.

## Behavior

- No arguments: `pnpm test`
- Filter provided: `pnpm test -- $ARGUMENTS` (e.g., `/test -- OrderForm` to filter by name)

Always show test output. If tests fail, analyze the failure output and summarize what went wrong.
