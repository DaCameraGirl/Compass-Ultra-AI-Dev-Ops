<p align="center">
  <img src="docs/readme-banner.svg" alt="Compass Ultra AI DevOps — chatbot and release-loop tests" width="720" />
</p>

<p align="center">
  <strong>AI DevOps chatbot and automated release-loop test agent for Compass Ultra.</strong><br />
  Chat about release readiness, or run Playwright checks against the live demo — external operator evidence for launch gates.
</p>

<p align="center">
  <a href="https://dacameragirl.github.io/Compass-Ultra-AI-Dev-Ops/"><img src="https://img.shields.io/badge/Chat-GitHub%20Pages-bc8cff?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Pages chat" /></a>
  <a href="https://www.compassultra.com/app?demo=true"><img src="https://img.shields.io/badge/Demo%20target-Compass%20Ultra-0b63ce?style=for-the-badge&logo=vercel&logoColor=white" alt="Compass Ultra demo" /></a>
  <a href="https://github.com/DaCameraGirl/Compass-Ultra-Pro"><img src="https://img.shields.io/badge/Product-Compass--Ultra--Pro-33d69f?style=for-the-badge" alt="Product repo" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue?style=flat-square" alt="Version 1.0.0" />
  <img src="https://img.shields.io/badge/chatbot-GitHub%20Pages%20live-bc8cff?style=flat-square" alt="Chatbot live on Pages" />
  <img src="https://img.shields.io/badge/tests-Playwright-2EAD33?style=flat-square&logo=playwright&logoColor=white" alt="Playwright" />
  <img src="https://img.shields.io/badge/schedule-daily%206%3A00%20UTC-58a6ff?style=flat-square" alt="Daily CI" />
</p>

### Languages

<p align="center">
  <img src="https://img.shields.io/badge/JavaScript-70%25-F7DF1E?style=flat-square&logo=javascript&logoColor=111" alt="JavaScript 70%" />
  <img src="https://img.shields.io/badge/CSS-20%25-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS 20%" />
  <img src="https://img.shields.io/badge/HTML-10%25-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML 10%" />
</p>

### Stack

<p align="center">
  <img src="https://img.shields.io/badge/Runtime-Node.js-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Browser-Playwright-2EAD33?style=flat-square&logo=playwright&logoColor=white" alt="Playwright" />
  <img src="https://img.shields.io/badge/Pages-GitHub%20Pages-000000?style=flat-square&logo=github&logoColor=white" alt="GitHub Pages" />
</p>

<p align="center">
  Built by <strong>Angela Hudson</strong> · <a href="https://github.com/DaCameraGirl">DaCameraGirl</a>
</p>

<p align="center"><img src="docs/readme-divider.svg" width="720" alt="" /></p>
<p align="center"><img src="https://capsule-render.vercel.app/api?type=waving&color=0:070b14,100:12102a&height=50&section=header&text=What%20this%20repo%20does&fontSize=22&fontColor=e6edf3&animation=twinkling" width="720" alt="What this repo does" /></p>

This repo has **two jobs** for **[Compass Ultra](https://www.compassultra.com)** only:

1. **AI DevOps chatbot** — release-readiness Q&A at a public GitHub Pages URL (no install required).
2. **Playwright release-loop test** — automated checks against the live demo app (runs in GitHub Actions daily).

**Demo target:** [https://www.compassultra.com/app?demo=true](https://www.compassultra.com/app?demo=true)

> Not related to Project Hydra or warehouse video tools — those live in separate repos.

```mermaid
%%{init: {'theme': 'dark'}}%%
flowchart LR
  A[Chat or CI trigger] --> B[AI DevOps assistant]
  B --> C[Compass Ultra demo]
  C --> D[Flags + policy gates]
  D --> E[Risk + snapshot diff]
  E --> F[PDF + report artifacts]

  style A fill:#12102a,stroke:#bc8cff,color:#e6edf3
  style B fill:#12102a,stroke:#bc8cff,color:#e6edf3
  style C fill:#0d1b33,stroke:#58a6ff,color:#e6edf3
  style D fill:#0d1b33,stroke:#ffb800,color:#e6edf3
  style E fill:#0d1b33,stroke:#33d69f,color:#e6edf3
  style F fill:#0d1b33,stroke:#33d69f,color:#e6edf3
```

<p align="center"><img src="docs/readme-divider.svg" width="720" alt="" /></p>
<p align="center"><img src="https://capsule-render.vercel.app/api?type=waving&color=0:070b14,100:12102a&height=50&section=header&text=Chatbot%20(live%20now)&fontSize=22&fontColor=e6edf3&animation=twinkling" width="720" alt="Chatbot live now" /></p>

**Open the chatbot in your browser — no install, no localhost:**

**[https://dacameragirl.github.io/Compass-Ultra-AI-Dev-Ops/](https://dacameragirl.github.io/Compass-Ultra-AI-Dev-Ops/)**

It runs on GitHub Pages with a built-in release assistant. No API key, no `npm start`, no dev server.

The chatbot can help with:

- Release risk analysis
- Policy gates
- Snapshot diffs
- PDF runbooks
- Rollback planning
- GitHub, Jira, and Slack workflow payloads
- CI release gates
- Launch readiness checklists

Every push to `main` redeploys the chatbot via `.github/workflows/deploy-pages.yml`.

<details>
<summary><strong>Optional: local dev server with OpenAI API</strong></summary>

Only needed if you want to wire in an external AI provider while developing:

```bash
npm install
npm start
```

Then open `http://localhost:8787` and set:

```bash
AI_API_KEY=your_key
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4.1-mini
```

`OPENAI_API_KEY` also works if `AI_API_KEY` is not set.

</details>

<p align="center"><img src="docs/readme-divider.svg" width="720" alt="" /></p>
<p align="center"><img src="https://capsule-render.vercel.app/api?type=waving&color=0:070b14,100:12102a&height=50&section=header&text=Automated%20AI%20DevOps%20Test&fontSize=22&fontColor=e6edf3&animation=twinkling" width="720" alt="Automated AI DevOps Test" /></p>


**In GitHub Actions (recommended):** the workflow in `.github/workflows/ai-devops-test.yml` runs daily at **6:00 UTC** and can be triggered manually from the Actions tab. Reports upload as workflow artifacts.

**Locally (optional):**

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

<p align="center"><img src="docs/readme-divider.svg" width="720" alt="" /></p>
<p align="center"><img src="https://capsule-render.vercel.app/api?type=waving&color=0:070b14,100:12102a&height=50&section=header&text=Repo%20Structure&fontSize=22&fontColor=e6edf3&animation=twinkling" width="720" alt="Repo Structure" /></p>


```text
.
├── .github/workflows/
│   ├── deploy-pages.yml    Publishes chatbot to GitHub Pages
│   └── ai-devops-test.yml  Daily Playwright release-loop test
├── public/                 GitHub Pages site (live URL)
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── tests/test-release-loop.js
├── package.json
├── server.js               Optional local dev server + API proxy
└── README.md
```

<p align="center"><img src="docs/readme-divider.svg" width="720" alt="" /></p>
<p align="center"><img src="https://capsule-render.vercel.app/api?type=waving&color=0:070b14,100:12102a&height=50&section=header&text=Related%20repos&fontSize=22&fontColor=e6edf3&animation=twinkling" width="720" alt="Related repos" /></p>


| Repo | Role |
| --- | --- |
| [Compass-Ultra-Pro](https://github.com/DaCameraGirl/Compass-Ultra-Pro) | Production Compass Ultra app |
| [Compass-Ultra](https://github.com/DaCameraGirl/Compass-Ultra) | Public showcase / docs |
| [compass-ultra-backend](https://github.com/DaCameraGirl/compass-ultra-backend) | API + live AI for the product |

<p align="center"><img src="docs/readme-divider.svg" width="720" alt="" /></p>
<p align="center"><img src="https://capsule-render.vercel.app/api?type=waving&color=0:070b14,100:12102a&height=50&section=header&text=Notes&fontSize=22&fontColor=e6edf3&animation=twinkling" width="720" alt="Notes" /></p>


This repo is intentionally separate from the main Compass Ultra product repo. It acts like an external AI DevOps operator: chat with it, run release checks, and use the output as launch-readiness evidence.

<p align="center">
  <a href="https://www.compassultra.com/app?demo=true"><img src="https://img.shields.io/badge/Open%20demo-Compass%20Ultra-33d69f?style=for-the-badge&logo=rocket&logoColor=061713" alt="Open demo" /></a>
  <a href="https://dacameragirl.github.io/Compass-Ultra-AI-Dev-Ops/"><img src="https://img.shields.io/badge/Chat%20online-GitHub%20Pages-bc8cff?style=for-the-badge&logo=github&logoColor=white" alt="Chat online" /></a>
</p>