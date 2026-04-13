from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import json

from config import get_settings
from llm_client import LLMClient
from prompts import get_formal_validity_prompts

router = APIRouter(prefix="/api", tags=["validity"])


class ValidityRequest(BaseModel):
    argument_label: str = Field(..., description="The argument label")
    argument_location: str = Field("", description="Where in the paper")
    reasoning_type: str = Field("", description="Type of reasoning")
    premises: list[str] = Field(default_factory=list, description="The explicit premises")
    conclusion: str = Field("", description="The argument's conclusion")
    implicit_premises: list[str] = Field(default_factory=list, description="Implicit premises")


class FormattedArgument(BaseModel):
    syllogism_type: str
    atomic_premises: list[str]
    conclusion: str
    inference_rule: str


class ValidityEvaluation(BaseModel):
    formal_validity_score: int
    is_valid: bool
    entailment_holds: bool
    evaluation_steps: list[str]
    hidden_assumptions: list[str]
    ambiguous_terms: list[str]
    possible_counterexample: str
    final_assessment: str


class ValidityResponse(BaseModel):
    argument_label: str
    formatted_argument: FormattedArgument
    validity_evaluation: ValidityEvaluation


@router.post("/check-validity", response_model=ValidityResponse)
async def check_validity(request: ValidityRequest):
    """Perform a formal logical validity analysis of a specific argument."""
    settings = get_settings()
    client = LLMClient(settings)

    system_prompt, user_prompt = get_formal_validity_prompts(
        argument_label=request.argument_label,
        argument_location=request.argument_location,
        reasoning_type=request.reasoning_type,
        premises=request.premises,
        conclusion=request.conclusion,
        implicit_premises=request.implicit_premises,
    )

    try:
        raw_response = await client.analyze(system_prompt, user_prompt)

        cleaned = raw_response.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()

        result = json.loads(cleaned)

        fa = result.get("formatted_argument", {})
        ve = result.get("validity_evaluation", {})

        return ValidityResponse(
            argument_label=request.argument_label,
            formatted_argument=FormattedArgument(
                syllogism_type=fa.get("syllogism_type", "unknown"),
                atomic_premises=fa.get("atomic_premises", []),
                conclusion=fa.get("conclusion", ""),
                inference_rule=fa.get("inference_rule", ""),
            ),
            validity_evaluation=ValidityEvaluation(
                formal_validity_score=ve.get("formal_validity_score", 0),
                is_valid=ve.get("is_valid", False),
                entailment_holds=ve.get("entailment_holds", False),
                evaluation_steps=ve.get("evaluation_steps", []),
                hidden_assumptions=ve.get("hidden_assumptions", []),
                ambiguous_terms=ve.get("ambiguous_terms", []),
                possible_counterexample=ve.get("possible_counterexample", ""),
                final_assessment=ve.get("final_assessment", ""),
            ),
        )
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse validity results: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Validity check failed: {str(e)}"
        )
