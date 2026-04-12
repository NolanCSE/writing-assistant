from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import json

from config import get_settings
from llm_client import LLMClient
from prompts import get_logical_analysis_prompts

router = APIRouter(prefix="/api", tags=["logical-analysis"])


class LogicalAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=10, description="The paper text to analyze logically")


class Fallacy(BaseModel):
    fallacy_type: str
    description: str
    passage: str
    severity: str


class Argument(BaseModel):
    argument_label: str
    location: str
    premises: list[str]
    conclusion: str
    reasoning_type: str
    validity_score: int
    soundness_score: int
    fallacies_detected: list[Fallacy]
    implicit_premises: list[str]
    notes: str


class TermUsage(BaseModel):
    term: str
    definitions_found: list[str]
    assessment: str
    location: str


class CounterargumentCoverage(BaseModel):
    coverage_score: int
    strongest_unaddressed: list[str]
    assessment: str


class LogicalOverview(BaseModel):
    thesis: str
    overall_logical_score: int
    reasoning_types_detected: list[str]
    summary: str


class LogicalAnalysisResponse(BaseModel):
    overview: LogicalOverview
    arguments: list[Argument]
    semantic_consistency: list[TermUsage]
    counterargument_coverage: CounterargumentCoverage


@router.post("/logical-analysis", response_model=LogicalAnalysisResponse)
async def analyze_logic(request: LogicalAnalysisRequest):
    """Perform a rigorous logical analysis of a paper's argumentative structure,
    including validity, soundness, fallacy detection, and semantic consistency."""
    settings = get_settings()
    client = LLMClient(settings)

    system_prompt, user_prompt = get_logical_analysis_prompts(request.text)

    try:
        raw_response = await client.analyze(system_prompt, user_prompt)

        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()

        result = json.loads(cleaned)

        overview_data = result.get("overview", {})
        overview = LogicalOverview(
            thesis=overview_data.get("thesis", ""),
            overall_logical_score=overview_data.get("overall_logical_score", 0),
            reasoning_types_detected=overview_data.get("reasoning_types_detected", []),
            summary=overview_data.get("summary", ""),
        )

        arguments_data = result.get("arguments", [])
        parsed_arguments = []
        for arg in arguments_data:
            fallacies = arg.get("fallacies_detected", [])
            parsed_fallacies = [
                Fallacy(
                    fallacy_type=f.get("fallacy_type", ""),
                    description=f.get("description", ""),
                    passage=f.get("passage", ""),
                    severity=f.get("severity", "minor"),
                )
                for f in fallacies
            ]
            parsed_arguments.append(Argument(
                argument_label=arg.get("argument_label", ""),
                location=arg.get("location", ""),
                premises=arg.get("premises", []),
                conclusion=arg.get("conclusion", ""),
                reasoning_type=arg.get("reasoning_type", ""),
                validity_score=arg.get("validity_score", 0),
                soundness_score=arg.get("soundness_score", 0),
                fallacies_detected=parsed_fallacies,
                implicit_premises=arg.get("implicit_premises", []),
                notes=arg.get("notes", ""),
            ))

        semantic_data = result.get("semantic_consistency", [])
        parsed_semantic = [
            TermUsage(
                term=s.get("term", ""),
                definitions_found=s.get("definitions_found", []),
                assessment=s.get("assessment", ""),
                location=s.get("location", ""),
            )
            for s in semantic_data
        ]

        counter_data = result.get("counterargument_coverage", {})
        counterargument = CounterargumentCoverage(
            coverage_score=counter_data.get("coverage_score", 0),
            strongest_unaddressed=counter_data.get("strongest_unaddressed", []),
            assessment=counter_data.get("assessment", ""),
        )

        return LogicalAnalysisResponse(
            overview=overview,
            arguments=parsed_arguments,
            semantic_consistency=parsed_semantic,
            counterargument_coverage=counterargument,
        )
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse logical analysis results: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Logical analysis failed: {str(e)}"
        )
