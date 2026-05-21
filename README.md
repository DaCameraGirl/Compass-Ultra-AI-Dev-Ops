# Compass Ultra AI DevOps

AI DevOps chatbot and automated release-loop test agent for Compass Ultra.

This repo has two jobs:

1. Provide a local AI DevOps chatbot for release-readiness questions.
2. Run Playwright checks against the live Compass Ultra demo app.

Demo target:

https://www.compassultra.com/app?demo=true

## Chatbot

Run the chatbot locally:

```bash
npm install
npm start
```

Then open:

```text
http://localhost:8787
```

The chatbot can help with:

- Release risk analysis
- Policy gates
- Snapshot diffs
- PDF runbooks
- Rollback planning
- GitHub, Jira, and Slack workflow payloads
- CI release gates
- Launch readiness checklists

By default it uses a local built-in release assistant, so it works without an API key.

To connect it to an OpenAI-compatible provider, set these environment variables before running `npm start`:

```bash
AI_API_KEY=your_key
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4.1-mini
```

`OPENAI_API_KEY` also works if `AI_API_KEY` is not set.

## Automated AI DevOps Test

Run the external release-loop test locally:

```bash
npm install
npx playwright install chromium
npm test
```

The test checks:

- Demo workspace loads
- Core release-review buttons are visible
- Feature flags can be toggled
- AI risk analysis can run
- Snapshot diff opens
- PDF runbook export starts
- Policy gates are visible
- GitHub, Jira, and Slack workflow areas are reachable
- Console errors are collected for review

A local run writes:

- `ai-devops-report.html`
- `risk-analysis-failure.png` if a failure occurs
- `downloaded-runbook.pdf` if export succeeds

## GitHub Actions

The workflow in `.github/workflows/ai-devops-test.yml` runs daily at 6:00 UTC and can also be triggered manually from the Actions tab.

## Repo Structure

```text
.
├── .github/workflows/ai-devops-test.yml
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── tests/test-release-loop.js
├── package.json
├── server.js
└── README.md
```

## Notes

This repo is intentionally separate from the main Compass Ultra product repo. It acts like an external AI DevOps operator: chat with it, run release checks, and use the output as launch-readiness evidence.