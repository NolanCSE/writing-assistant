from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import json

from config import get_settings
from llm_client import LLMClient
from prompts import get_bibliography_prompts

router = APIRouter(prefix="/api", tags=["bibliography"])


class BibliographyRequest(BaseModel):
    text: str = Field(..., min_length=10, description="The paper text with bibliography")


class CitationIssue(BaseModel):
    location: str
    issue_type: str
    description: str
    suggestion: str


class BibliographyResponse(BaseModel):
    citation_style_detected: str
    issues_found: list[CitationIssue]
    missing_references: list[str]
    unused_references: list[str]
    format_score: int
    completeness_score: int


@router.post("/bibliography", response_model=BibliographyResponse)
async def check_bibliography(request: BibliographyRequest):
    """Check bibliography and citations for correctness and completeness."""
    settings = get_settings()
    client = LLMClient(settings)

    system_prompt, user_prompt = get_bibliography_prompts(request.text)

    try:
        raw_response = await client.analyze(system_prompt, user_prompt)

        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()

        result = json.loads(cleaned)

        issues = result.get("issues_found", [])
        parsed_issues = []
        for issue in issues:
            parsed_issues.append(CitationIssue(
                location=issue.get("location", ""),
                issue_type=issue.get("issue_type", ""),
                description=issue.get("description", ""),
                suggestion=issue.get("suggestion", ""),
            ))

        return BibliographyResponse(
            citation_style_detected=result.get("citation_style_detected", "Unknown"),
            issues_found=parsed_issues,
            missing_references=result.get("missing_references", []),
            unused_references=result.get("unused_references", []),
            format_score=result.get("format_score", 0),
            completeness_score=result.get("completeness_score", 0),
        )
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse bibliography results: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Bibliography check failed: {str(e)}"
        )
