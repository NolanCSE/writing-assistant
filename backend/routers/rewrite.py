from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import json

from config import get_settings
from llm_client import LLMClient
from prompts import get_rewrite_prompts

router = APIRouter(prefix="/api", tags=["rewrite"])


class RewriteRequest(BaseModel):
    text: str = Field(..., min_length=10, description="The section text to rewrite")
    focus_area: str = Field(
        default="all",
        description="Area to focus on: clarity, concision, style, flow, or all"
    )


class RewriteResponse(BaseModel):
    original_text: str
    rewritten_text: str
    changes_summary: str
    focus_area: str


@router.post("/rewrite", response_model=RewriteResponse)
async def rewrite_section(request: RewriteRequest):
    """Rewrite a section of text focusing on a specific improvement area."""
    settings = get_settings()
    client = LLMClient(settings)

    system_prompt, user_prompt = get_rewrite_prompts(request.text, request.focus_area)

    raw_response = await client.analyze(system_prompt, user_prompt)

    raw_response = await client.analyze(system_prompt, user_prompt)

    try:
        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()

        result = json.loads(cleaned)

        return RewriteResponse(
            original_text=request.text,
            rewritten_text=result.get("rewritten_text", ""),
            changes_summary=result.get("changes_summary", ""),
            focus_area=request.focus_area,
        )
    except json.JSONDecodeError:
        return RewriteResponse(
            original_text=request.text,
            rewritten_text=raw_response,
            changes_summary="Raw response returned (parsing failed)",
            focus_area=request.focus_area,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Rewrite failed: {str(e)}"
        )
    except json.JSONDecodeError:
        return RewriteResponse(
            original_text=request.text,
            rewritten_text=raw_response,
            changes_summary="Raw response returned (parsing failed)",
            focus_area=request.focus_area,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Rewrite failed: {str(e)}"
        )
