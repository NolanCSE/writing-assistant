# Writing Analyzer

AI-powered writing analysis tool with in-paper highlighting, inline rewriting, and research assistance.

## Features

**Unified Analysis** — A single "Analyze Paper" action scores your writing across 7 dimensions (clarity, concision, argument strength, writing style, structure, evidence, grammar), decomposes arguments, detects logical fallacies, checks bibliography quality, and highlights problematic sections directly on your paper text.

**In-Paper Highlighting** — After analysis, the paper displays color-coded highlights:

- Blue underlines — info-level issues (style preferences)
- Orange underlines — warnings (moderate quality issues)
- Red underlines — errors (significant problems)

Clicking any highlight opens a detail card with the problem description and a suggestion.

**Inline Rewriting** — From the issue detail card, click "Rewrite this section" to get an AI-improved version of the flagged passage. Apply or reject the rewrite directly.

**Argument Decomposition** — Each argument is broken down into premises, conclusion, reasoning type, validity score, and soundness score. Fallacies are detected with severity ratings.

**Bibliography Checking** — Citation style is auto-detected. Format and completeness are scored. Issues with missing information or broken references are flagged.

**Research Assistant** — Find relevant academic sources for your paper, with relevance ratings and suggested placement sections.

## Tech Stack

- **Backend**: Python 3.10+ / FastAPI / OpenRouter API (OpenAI-compatible)
- **Frontend**: React 19 / Vite
- **LLM**: Any model via OpenRouter (default: `openrouter/auto`)

## Prerequisites

- Python 3.10+
- Node.js 18+
- An OpenRouter API key (https://openrouter.ai/settings/keys)

## Quick Start

```bash
# Clone and enter
cd writing

# Backend setup
cp .env.example .env
# Edit .env — set your LLM_API_KEY
cd backend
python3 -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Start backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Frontend (in a new terminal)
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Configuration

All configuration is done via environment variables (or a `.env` file in the `backend/` directory):

| Variable | Default | Description |
|---|---|---|
| `LLM_API_KEY` | (required) | Your OpenRouter API key |
| `LLM_BASE_URL` | `https://openrouter.ai/api/v1` | OpenRouter API endpoint |
| `LLM_MODEL` | `openrouter/auto` | Model to use (any OpenRouter model ID) |
| `LLM_APP_TITLE` | `Writing Analyzer` | App name sent in OpenRouter headers |
| `CORS_ORIGINS` | `*` | Allowed CORS origins |
| `APP_HOST` | `0.0.0.0` | Server bind address |
| `APP_PORT` | `8000` | Server port |

## Usage

1. **Paste your paper** in the editor on the left
2. **Click "Analyze Paper"** — wait ~30-60 seconds
3. **Review highlights** — color-coded underlines show issues directly on the paper
4. **Click a highlight** — the right panel shows the issue detail, description, and suggestion
5. **Rewrite** — click "Rewrite this section" to get an improved version, then Apply or Reject
6. **View scores** — click "Back to summary" in the right panel to see dimension scores, strengths, and weaknesses
7. **Research** — switch to the Research tab to find relevant sources

## API Reference

All endpoints accept and return JSON. The API docs are available at `http://localhost:8000/docs` when the backend is running.

| Endpoint | Method | Description |
|---|---|---|
| `/api/full-analysis` | POST | Unified paper analysis (scores, arguments, bibliography, issues) |
| `/api/rewrite` | POST | Rewrite a section of text with a focus area |
| `/api/research` | POST | Find relevant academic sources |
| `/api/analyze` | POST | Writing analysis only (legacy) |
| `/api/logical-analysis` | POST | Logical analysis only (legacy) |
| `/api/bibliography` | POST | Bibliography check only (legacy) |

## Project Structure

```
writing/
├── .env.example
├── README.md
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── llm_client.py
│   ├── prompts.py
│   ├── requirements.txt
│   ├── routers/
│   │   ├── full_analysis.py
│   │   ├── analysis.py
│   │   ├── rewrite.py
│   │   ├── research.py
│   │   ├── bibliography.py
│   │   └── logical_analysis.py
│   └── tests/
├── frontend/
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api/client.js
│       ├── hooks/
│       │   ├── useFullAnalysis.js
│       │   ├── useRewriter.js
│       │   └── useResearcher.js
│       └── components/
│           ├── PaperView.jsx
│           ├── IssueCard.jsx
│           ├── ScoresPanel.jsx
│           └── ResearchTab.jsx
```
