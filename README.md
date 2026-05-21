# Compass Ultra AI DevOps Agent

Automated release-loop testing for Compass Ultra.

This repo runs a Playwright-based check against the live demo app:

https://www.compassultra.com/app?demo=true

## What It Checks

- Demo workspace loads
- Core release-review buttons are visible
- Feature flags can be toggled
- AI risk analysis can run
- Snapshot diff opens
- PDF runbook export starts
- Policy gates respond after flag changes
- Readiness and blocker indicators are present
- GitHub, Jira, and Slack workflow payload areas are reachable
- Kill switch flow remains available
- Console errors are collected for review

## Run Locally

```bash
npm install
npx playwright install chromium
npm test
```

A local run writes:

- `ai-devops-report.html`
- `risk-analysis-failure.png` if risk analysis fails
- `downloaded-runbook.pdf` if export succeeds

## GitHub Actions

The workflow in `.github/workflows/ai-devops-test.yml` runs daily at 6:00 UTC and can also be triggered manually from the Actions tab.

## Notes

This is an external test agent. It does not replace unit tests inside Compass Ultra. It is meant to catch launch-day regressions in the public demo flow.