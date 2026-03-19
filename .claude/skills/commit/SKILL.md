---
name: commit
description: Stage and commit changes following Conventional Commits 1.0.0
disable-model-invocation: false
allowed-tools: Bash, Read, Glob, Grep
argument-hint: "[optional commit message override]"
---

# Commit

Create a git commit following the [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) specification.

## Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | When to use |
|------|-------------|
| `feat` | A new feature or capability |
| `fix` | A bug fix |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or updating tests |
| `docs` | Documentation only changes |
| `chore` | Build process, dependencies, tooling, config |
| `ci` | CI/CD pipeline changes |
| `perf` | Performance improvement |
| `style` | Formatting, whitespace (no logic change) |

### Scope

The scope is the area of the frontend affected:

- `feat(order-form):` — order entry panel
- `fix(order-book):` — order book display
- `feat(bff):` — API route / BFF layer
- `test(hooks):` — hooks tests
- `chore(deps):` — dependency update

Omit scope only if the change spans the entire app or doesn't map to a single area.

### Rules

- Description: imperative mood, lowercase, no period at the end, under 72 characters.
- Body: explain **why**, not what. The diff shows what changed.
- Breaking changes: append `!` after scope and add a `BREAKING CHANGE:` footer.
- One logical change per commit. Never mix a feature with a refactor or a test with a fix.

## Procedure

1. Run `/check` first. Do not commit if lint, typecheck, or tests fail.
2. Run `git status` (without `-uall`) and `git diff` (staged + unstaged) to understand all changes.
3. Run `git log --oneline -10` to see recent commit style for consistency.
4. Analyze the changes:
   - Determine the correct **type** based on the nature of the change.
   - Determine the **scope** (which area of the app is primarily affected).
   - Draft a concise **description** in imperative mood.
   - If the change is non-trivial, draft a **body** explaining the reasoning.
5. Stage only the files relevant to this logical change. Prefer `git add <specific-files>` over `git add -A`. Never stage `.env`, `.env.local`, or generated files.
6. Create the commit using a HEREDOC for the message:

```bash
git commit -m "$(cat <<'EOF'
type(scope): description

Optional body explaining why.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

7. Run `git status` after committing to verify success.

## If argument is provided

Use `$ARGUMENTS` as the commit message description. Still determine the correct type and scope from the diff. The user's text becomes the description (or body if it's long).

## Examples

```
feat(order-form): add market order type selection

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

```
fix(bff): return 400 on missing symbol instead of 500

The route was not validating the symbol query param before
calling the engine, causing uncaught gRPC errors to surface
as 500s.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

```
test(order-book): add tests for empty book edge case

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```
