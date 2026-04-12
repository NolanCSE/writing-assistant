from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import json

from config import get_settings
from llm_client import LLMClient
from prompts import get_research_prompts

router = APIRouter(prefix="/api", tags=["research"])


class ResearchRequest(BaseModel):
    text: str = Field(..., min_length=10, description="The paper text to research for")
    topic: str = Field(default="", description="Optional specific topic to research")


class Source(BaseModel):
    title: str
    authors: str
    year: int
    type: str
    relevance: str
    reason: str
    suggested_placement: str


class ResearchResponse(BaseModel):
    research_summary: str
    sources: list[Source]


@router.post("/research", response_model=ResearchResponse)
async def research_sources(request: ResearchRequest):
    """Find relevant sources and research materials for the paper."""
    settings = get_settings()
    client = LLMClient(settings)

    system_prompt, user_prompt = get_research_prompts(request.text, request.topic)

    try:
        raw_response = await client.analyze(system_prompt, user_prompt)

        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()

        result = json.loads(cleaned)

        sources = result.get("sources", [])
        parsed_sources = []
        for source in sources:
            parsed_sources.append(Source(
                title=source.get("title", ""),
                authors=source.get("authors", ""),
                year=source.get("year", 0),
                type=source.get("type", "unknown"),
                relevance=source.get("relevance", "Medium"),
                reason=source.get("reason", ""),
                suggested_placement=source.get("suggested_placement", ""),
            ))

        return ResearchResponse(
            research_summary=result.get("research_summary", ""),
            sources=parsed_sources,
        )
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse research results: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Research failed: {str(e)}"
        )
