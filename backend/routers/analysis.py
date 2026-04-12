from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import json

from config import get_settings
from llm_client import LLMClient
from prompts import get_analysis_prompts

router = APIRouter(prefix="/api", tags=["analysis"])


class AnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=10, description="The paper text to analyze")


class ScoreDetail(BaseModel):
    score: int
    explanation: str


class Suggestion(BaseModel):
    section: str
    issue: str
    suggestion: str


class AnalysisResponse(BaseModel):
    summary: str
    scores: dict[str, ScoreDetail]
    overall_score: float
    strengths: list[str]
    weaknesses: list[str]
    suggestions: list[Suggestion]


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_paper(request: AnalyzeRequest):
    """Analyze a paper across multiple dimensions including clarity, concision,
    argument strength, writing style, structure, evidence, and grammar."""
    settings = get_settings()
    client = LLMClient(settings)

    system_prompt, user_prompt = get_analysis_prompts(request.text)

    try:
        raw_response = await client.analyze(system_prompt, user_prompt)

        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()

        result = json.loads(cleaned)

        return AnalysisResponse(
            summary=result.get("summary", ""),
            scores=result.get("scores", {}),
            overall_score=result.get("overall_score", 0),
            strengths=result.get("strengths", []),
            weaknesses=result.get("weaknesses", []),
            suggestions=result.get("suggestions", []),
        )
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse analysis results: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )
