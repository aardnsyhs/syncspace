# Contributing to the SyncSpace client

Start with the [README](README.md), [configuration](docs/CONFIGURATION.md), and [development guide](docs/DEVELOPMENT.md). Licensing still needs maintainer approval. Private vulnerability reporting is enabled; see [SECURITY.md](SECURITY.md). The original [audit](docs/OSS_READINESS_AUDIT.md) records its earlier state; the [Phase 1 report](docs/OSS_GOVERNANCE_PHASE1.md) records the current governance review.

## Development workflow

Fork this repository, then clone your fork:

```bash
git clone https://github.com/YOUR_USERNAME/syncspace.git
cd syncspace
git switch -c fix/describe-the-change
corepack yarn install --immutable
cp .env.example .env
corepack yarn dev
```

Replace `YOUR_USERNAME` with your GitHub account. Branch names such as `fix/...` and `feature/...` are suggested, not an established enforced policy. Run the API separately for authenticated work.

Follow the TypeScript/React patterns in the affected feature. ESLint configuration exists; no formatter or commit-message enforcement is configured. Recent commits use prefixes such as `fix:` and `chore:`, which you may follow. Keep API paths, response types, bearer-token handling, and event names compatible with the backend.

Before opening a pull request:

```bash
corepack yarn lint
corepack yarn test:run
corepack yarn build
```

The baseline has lint failures and no executable Vitest cases. Report the exact command results and distinguish existing failures from those introduced by your change. Do not disable checks to produce a passing result. New behavior should include meaningful tests using the existing Testing Library/MSW setup where appropriate.

For UI changes, check loading, empty, and error states, keyboard operation, visible focus, narrow viewports, 200% zoom, and each shipped theme. Record what you actually exercised. Do not claim accessibility compliance without verification.

## Issues and pull requests

For bugs, include reproduction steps, expected and observed behavior, browser/runtime versions, and sanitized logs. For feature requests, explain the workflow and current limitation. Use the repository-specific forms. Never include tokens, personal data, or exploitable security details in a public issue.

Keep pull requests focused, describe the user-visible result, list checks and limitations, and update documentation when setup or behavior changes. If an API contract changes, identify the matching backend change and migration/compatibility plan. Discuss breaking changes with the maintainer before implementation.

No review SLA, release schedule, or contributor approval policy is established in the tracked files. Maintainers decide whether to merge and may request changes. Be respectful, reproduce reported problems, and respond to review with evidence. Follow [SECURITY.md](SECURITY.md) for vulnerabilities.

## Triage, scope, and attribution

Maintainers assess reproducibility, affected revisions, user impact, and compatibility when triaging issues. Contributors can help with sanitized reproductions and links to duplicates. A request may need more information or fall outside the maintained workspace/board workflows; opening an issue does not commit the project to implementation.

For pull requests, explain scope, validation, client/API dependencies, and whether the change breaks an existing workflow. Review may require a smaller change or further evidence. Include migration or upgrade instructions when relevant, and communicate breaking behavior before merging or releasing.

Preserve accurate author metadata and upstream notices. Credit collaborators only with their consent. Identify copied/generated material and its source/license in the pull request; do not imply that credit establishes redistribution permission. Do not submit third-party material whose redistribution rights you cannot establish.

## Maintenance and releases

No supported release series or backport commitment has been adopted. The default client branch is `master`; that is repository configuration, not a support guarantee. The shared [maintenance proposal](docs/OSS_GOVERNANCE_PHASE1.md#governance-improvements) recommends a reviewed default-branch baseline, explicit support scope, versioned releases, and coordinated client/API release notes. It remains a proposal until the maintainer approves it.
