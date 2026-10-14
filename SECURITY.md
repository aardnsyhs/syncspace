# Security policy

## Maintenance scope

No supported release series or security backport policy is established in tracked repository files. Local Git tags and GitHub releases were absent when checked on 2026-10-14. Do not assume that an older revision receives fixes. Maintainers must define the supported branch/release policy before making support guarantees.

## Private reporting

GitHub Private Vulnerability Reporting is enabled for this repository, verified through GitHub's public REST endpoint on 2026-10-14. Use GitHub's private reporting form; no separate private security email is published in the inspected files.

Open this repository's [Security Advisories](https://github.com/aardnsyhs/syncspace/security/advisories), select **Report a vulnerability**, sign in if prompted, and submit the report privately. If the form becomes unavailable, ask the maintainer for a private channel without including vulnerability details in the public request. Do not post exploitable details, sensitive attachments, or credentials in public issues.

The matching [syncspace-api repository](https://github.com/aardnsyhs/syncspace-api) is part of the same application. Include the affected repository and revision in your private report; cross-repository issues may need coordinated fixes.

## What to include privately

- Affected commit/version, component, runtime, and deployment assumptions.
- Impact and reproduction using synthetic data, with sanitized requests/logs.
- Whether the issue affects the client, API, or both.
- Any suggested mitigation and a contact method for coordination.

Keep reproduction details private until the maintainer coordinates disclosure. No response-time SLA or bounty program is established. The maintainer must assess reports and agree on remediation/disclosure timing; this document does not promise a deadline.

Repository administrators should check their security-alert subscriptions and notification preferences, identify who monitors incoming reports, and coordinate client/API fixes before disclosure. Enabling reporting alone does not prove that notifications reach a responsible maintainer. The [Phase 1 decision register](docs/OSS_GOVERNANCE_PHASE1.md#maintainer-decision-register) records the outstanding support and notification decisions.

## Secrets and dependencies

Never commit `.env` files, application/database keys, OAuth or broadcasting secrets, bearer tokens, private keys, or production logs. Browser `VITE_*` values are public configuration. Example values are placeholders, not deployment credentials. Use synthetic data in tests and issue attachments. If a secret is exposed, revoke/rotate it and coordinate repository-history cleanup with the maintainer.

Report relevant dependency advisories privately with the package/version and advisory reference. Maintainers should check the applicable lockfile and review compatible updates, tests, and release impact. Renovate configuration exists but does not prove that every security update has been reviewed or deployed.
