# Writing Analyzer

AI-powered writing analysis, rewriting, research, and bibliography checking tool. Paste your paper and get comprehensive feedback across multiple dimensions powered by OpenAI.

## Features

### Paper Analysis

Comprehensive multi-dimensional scoring (1-10 each) with explanations:

- **Clarity** — How clear and understandable is the writing?
- **Concision** — Is the writing free of unnecessary verbosity?
- **Argument Strength** — Are claims well-supported? Is reasoning sound?
- **Writing Style** — Is the tone appropriate and prose well-crafted?
- **Structure & Organization** — Is there logical flow with smooth transitions?
- **Evidence & Support** — Are claims backed by credible, relevant sources?
- **Grammar & Mechanics** — Are there grammatical errors or awkward phrasings?

Returns an overall weighted score, strengths/weaknesses lists, and section-specific improvement suggestions.

### Section Rewriter

Paste any section and choose a focus area for targeted improvement:

| Focus Area | Description |
|---|---|
| `clarity` | Simplify confusing passages, replace jargon with plain language |
| `concision` | Remove unnecessary words, eliminate redundancy, tighten phrasing |
| `style` | Enhance sentence variety, improve word choice, ensure consistent tone |
| `flow` | Improve transitions and create natural reading rhythm |
| `all` | Comprehensive edit addressing all dimensions |

Returns the rewritten text alongside a detailed changelog.

### Research Assistant

Finds relevant academic and professional sources to strengthen your paper. Provide an optional topic or let the assistant analyze your paper's context. Each suggested source includes:

- Title, authors, year, and type (journal article, book, report, etc.)
- Relevance rating (High / Medium / Low)
- Explanation of why it's relevant
- Suggested placement within your paper

### Bibliography Checker

Analyzes your in-text citations and bibliography for issues:

- Auto-detects citation style (APA, MLA, Chicago, IEEE)
- Flags formatting errors, missing information, and inconsistencies
- Identifies references cited in text but missing from the bibliography
- Identifies bibliography entries not cited in the text
- Scores format correctness and completeness (1-10 each)

## Tech Stack

- **Backend:** Python 3.10+, FastAPI, Pydantic, OpenAI Python SDK
- **Frontend:** React 19, Vite, Lucide React icons, React Hot Toast
- **AI:** OpenAI API (GPT-4o by default, configurable)

## Prerequisites

- Python 3.10 or newer
- Node.js 18 or newer
- An OpenAI API key

## Quick Start

```bash
# Clone and enter the project
cd writing

# Backend setup
cp .env.example .env
# Edit .env — set your OPENAI_API_KEY at minimum

cd backend
python3 -m venv venv
source venv/bin/activate       # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Start backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Frontend (in a new terminal)
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies `/api` requests to the backend at `http://localhost:8000`.

## Configuration

All settings are configured via environment variables in the `.env` file (placed in the `backend/` directory):

| Variable | Default | Description |
|---|---|---|
| `OPENAI_API_KEY` | *(required)* | Your OpenAI API key |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` | OpenAI-compatible API base URL |
| `OPENAI_MODEL` | `gpt-4o` | Model to use for all features |
| `CORS_ORIGINS` | `*` | Comma-separated list of allowed origins |
| `APP_HOST` | `0.0.0.0` | Host to bind the server to |
| `APP_PORT` | `8000` | Port to bind the server to |

## API Reference

All endpoints accept and return JSON. The base URL is `http://localhost:8000`.

### `POST /api/analyze`

Analyze a paper across all scoring dimensions.

**Request:**

```json
{
  "text": "Full paper text here..."
}
```

**Response:**

```json
{
  "summary": "A brief overall assessment",
  "scores": {
    "clarity": { "score": 8, "explanation": "Detailed explanation..." },
    "concision": { "score": 7, "explanation": "..." },
    "argument_strength": { "score": 9, "explanation": "..." },
    "writing_style": { "score": 7, "explanation": "..." },
    "structure": { "score": 8, "explanation": "..." },
    "evidence": { "score": 6, "explanation": "..." },
    "grammar": { "score": 9, "explanation": "..." }
  },
  "overall_score": 7.7,
  "strengths": ["Strong thesis statement", "Well-organized sections"],
  "weaknesses": ["Some citations missing", "Verbose introduction"],
  "suggestions": [
    {
      "section": "Introduction",
      "issue": "Opening paragraph is overly broad",
      "suggestion": "Narrow the hook to directly relate to your thesis"
    }
  ]
}
```

### `POST /api/rewrite`

Rewrite a section of text with a specific focus area.

**Request:**

```json
{
  "text": "Section text to rewrite...",
  "focus_area": "clarity"
}
```

`focus_area` is one of: `clarity`, `concision`, `style`, `flow`, `all` (default: `all`).

**Response:**

```json
{
  "original_text": "The original section text",
  "rewritten_text": "The improved version",
  "changes_summary": "Summary of changes made",
  "focus_area": "clarity"
}
```

### `POST /api/research`

Find relevant sources for a paper.

**Request:**

```json
{
  "text": "Full paper text...",
  "topic": "effects of social media on academic performance"
}
```

`topic` is optional. When omitted, the assistant derives research needs from the paper content.

**Response:**

```json
{
  "research_summary": "Brief summary of research needs",
  "sources": [
    {
      "title": "Source Title",
      "authors": "Smith, John; Doe, Jane",
      "year": 2024,
      "type": "journal_article",
      "relevance": "High",
      "reason": "Why this source is relevant",
      "suggested_placement": "Literature Review"
    }
  ]
}
```

### `POST /api/bibliography`

Check citations and bibliography for correctness.

**Request:**

```json
{
  "text": "Full paper text including bibliography..."
}
```

**Response:**

```json
{
  "citation_style_detected": "APA",
  "issues_found": [
    {
      "location": "(Smith 2020)",
      "issue_type": "wrong_format",
      "description": "Missing year parentheses",
      "suggestion": "Change to (Smith, 2020)"
    }
  ],
  "missing_references": ["(Jones 2021) — no matching bibliography entry"],
  "unused_references": ["Brown, A. (2019). Title..."],
  "format_score": 8,
  "completeness_score": 7
}
```

## Usage

The frontend provides four tabs in the results panel:

1. **Analysis** — After pasting your paper and clicking "Analyze Paper", view dimension scores, the overall score ring, strengths, weaknesses, and actionable suggestions organized by paper section.
2. **Rewrite** — Paste a specific section, select a focus area from the pill buttons, and click "Rewrite Section" to receive an improved version with a changelog.
3. **Research** — Optionally enter a specific topic, then click "Find Sources" to get 5-10 suggested sources with relevance ratings and placement recommendations.
4. **Bibliography** — Click "Check Bibliography" to detect the citation style, view format/completeness scores, and review any issues, missing references, or unused references.

## Project Structure

```
writing/
├── .env.example
├── README.md
├── backend/
│   ├── requirements.txt
│   ├── config.py           # Settings via pydantic-settings
│   ├── llm_client.py       # AsyncOpenAI wrapper
│   ├── prompts.py          # Prompt templates for all 4 features
│   ├── main.py             # FastAPI app with CORS, routers, lifespan
│   └── routers/
│       ├── __init__.py
│       ├── analysis.py     # POST /api/analyze
│       ├── rewrite.py      # POST /api/rewrite
│       ├── research.py     # POST /api/research
│       └── bibliography.py # POST /api/bibliography
└── frontend/
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api/
        │   └── client.js   # API client for all endpoints
        ├── hooks/
        │   ├── usePaperAnalyzer.js
        │   ├── useRewriter.js
        │   ├── useResearcher.js
        │   └── useBibliography.js
        └── styles/
            └── index.css
```
