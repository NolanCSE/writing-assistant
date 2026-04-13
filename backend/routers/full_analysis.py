from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import json

from config import get_settings
from llm_client import LLMClient
from prompts import get_full_analysis_prompts

router = APIRouter(prefix="/api", tags=["full-analysis"])


class FullAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=10, description="The paper text to analyze")


class ScoreDetail(BaseModel):
    score: int
    explanation: str


class ArgumentFallacy(BaseModel):
    fallacy_type: str
    description: str
    passage: str
    severity: str


class ArgumentNode(BaseModel):
    id: str
    label: str
    location: str
    premises: list[str]
    conclusion: str
    reasoning_type: str
    validity_score: int
    soundness_score: int
    fallacies_detected: list[ArgumentFallacy]
    implicit_premises: list[str]
    weak_points: list[str] = []
    leaps: list[str] = []
    controversial_premises: list[str] = []
    irrelevant_points: list[str] = []
    follow_ups: list[str] = []
    notes: str


class CounterargumentCoverage(BaseModel):
    coverage_score: int
    strongest_unaddressed: list[str]
    assessment: str


class BibliographyIssue(BaseModel):
    location: str
    issue_type: str
    description: str
    suggestion: str


class BibliographyResult(BaseModel):
    style_detected: str
    format_score: int
    completeness_score: int
    issues: list[BibliographyIssue]


class Issue(BaseModel):
    id: int
    text_span: str
    start_char: int
    end_char: int
    category: str
    severity: str
    title: str
    description: str
    suggestion: str
    focus_area: str | None


class FullAnalysisResponse(BaseModel):
    summary: str
    scores: dict[str, ScoreDetail]
    overall_score: float
    strengths: list[str]
    weaknesses: list[str]
    arguments: list[ArgumentNode]
    counterargument_coverage: CounterargumentCoverage
    bibliography: BibliographyResult | None
    issues: list[Issue]


@router.post("/full-analysis", response_model=FullAnalysisResponse)
async def full_analysis(request: FullAnalysisRequest):
    """Perform a unified comprehensive analysis of a paper, including scoring,
    argument decomposition, fallacy detection, bibliography checking,
    counterargument coverage, and a flat list of issues with exact text spans."""
    settings = get_settings()
    client = LLMClient(settings)

    system_prompt, user_prompt = get_full_analysis_prompts(request.text)

    try:
        raw_response = await client.analyze(system_prompt, user_prompt)

        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()

        result = json.loads(cleaned)

        scores = {
            key: ScoreDetail(**val)
            for key, val in result.get("scores", {}).items()
        }

        arguments_data = result.get("arguments", [])
        parsed_arguments = []
        for arg in arguments_data:
            fallacies = arg.get("fallacies_detected", [])
            parsed_fallacies = [
                ArgumentFallacy(
                    fallacy_type=f.get("fallacy_type", ""),
                    description=f.get("description", ""),
                    passage=f.get("passage", ""),
                    severity=f.get("severity", "minor"),
                )
                for f in fallacies
            ]
            parsed_arguments.append(ArgumentNode(
                id=arg.get("id", ""),
                label=arg.get("label", ""),
                location=arg.get("location", ""),
                premises=arg.get("premises", []),
                conclusion=arg.get("conclusion", ""),
                reasoning_type=arg.get("reasoning_type", ""),
                validity_score=arg.get("validity_score", 0),
                soundness_score=arg.get("soundness_score", 0),
                fallacies_detected=parsed_fallacies,
                implicit_premises=arg.get("implicit_premises", []),
                weak_points=arg.get("weak_points", []),
                leaps=arg.get("leaps", []),
                controversial_premises=arg.get("controversial_premises", []),
                irrelevant_points=arg.get("irrelevant_points", []),
                follow_ups=arg.get("follow_ups", []),
                notes=arg.get("notes", ""),
            ))

        counter_data = result.get("counterargument_coverage", {})
        counterargument_coverage = CounterargumentCoverage(
            coverage_score=counter_data.get("coverage_score", 0),
            strongest_unaddressed=counter_data.get("strongest_unaddressed", []),
            assessment=counter_data.get("assessment", ""),
        )

        bib_data = result.get("bibliography")
        bibliography = None
        if bib_data is not None:
            bib_issues = [
                BibliographyIssue(
                    location=i.get("location", ""),
                    issue_type=i.get("issue_type", ""),
                    description=i.get("description", ""),
                    suggestion=i.get("suggestion", ""),
                )
                for i in bib_data.get("issues", [])
            ]
            bibliography = BibliographyResult(
                style_detected=bib_data.get("style_detected", ""),
                format_score=bib_data.get("format_score", 0),
                completeness_score=bib_data.get("completeness_score", 0),
                issues=bib_issues,
            )

        issues_data = result.get("issues", [])
        parsed_issues = [
            Issue(
                id=i.get("id", 0),
                text_span=i.get("text_span", ""),
                start_char=i.get("start_char", 0),
                end_char=i.get("end_char", 0),
                category=i.get("category", ""),
                severity=i.get("severity", "info"),
                title=i.get("title", ""),
                description=i.get("description", ""),
                suggestion=i.get("suggestion", ""),
                focus_area=i.get("focus_area"),
            )
            for i in issues_data
        ]

        return FullAnalysisResponse(
            summary=result.get("summary", ""),
            scores=scores,
            overall_score=result.get("overall_score", 0),
            strengths=result.get("strengths", []),
            weaknesses=result.get("weaknesses", []),
            arguments=parsed_arguments,
            counterargument_coverage=counterargument_coverage,
            bibliography=bibliography,
            issues=parsed_issues,
        )
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse full analysis results: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Full analysis failed: {str(e)}"
        )
