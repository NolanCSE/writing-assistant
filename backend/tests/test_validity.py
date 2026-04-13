from unittest.mock import AsyncMock, patch
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


VALID_RESPONSE = """{
  "formatted_argument": {
    "syllogism_type": "categorical syllogism",
    "atomic_premises": [
      "All mammals are mortal",
      "Socrates is a mammal"
    ],
    "conclusion": "Socrates is mortal",
    "inference_rule": "Barbara (AAA-1): If all members of a category have a property, then any individual member has that property"
  },
  "validity_evaluation": {
    "formal_validity_score": 10,
    "is_valid": true,
    "entailment_holds": true,
    "evaluation_steps": [
      "Step 1: The first premise establishes a universal positive claim about all mammals.",
      "Step 2: The second premise identifies Socrates as a member of the mammal category.",
      "Step 3: By universal instantiation (Barbara/AAA-1), since Socrates is a mammal, Socrates has the property of mortality.",
      "Step 4: No counterexample exists: it's impossible for a mammal to not be mortal."
    ],
    "hidden_assumptions": [],
    "ambiguous_terms": [],
    "possible_counterexample": "No counterexample possible — this is a valid syllogism.",
    "final_assessment": "This is a valid categorical syllogism (Barbara/AAA-1). The conclusion necessarily follows from the premises."
  }
}"""


class TestValidity:
    @patch("routers.validity.LLMClient")
    def test_valid_response(self, MockClient):
        mock_instance = AsyncMock()
        mock_instance.analyze = AsyncMock(return_value=VALID_RESPONSE)
        MockClient.return_value = mock_instance

        response = client.post("/api/check-validity", json={
            "argument_label": "Main thesis",
            "argument_location": "Introduction",
            "reasoning_type": "deductive",
            "premises": ["Premise 1", "Premise 2"],
            "conclusion": "The conclusion",
            "implicit_premises": [],
        })

        assert response.status_code == 200
        body = response.json()
        assert body["argument_label"] == "Main thesis"
        assert body["formatted_argument"]["syllogism_type"] == "categorical syllogism"
        assert body["validity_evaluation"]["formal_validity_score"] == 10
        assert body["validity_evaluation"]["is_valid"] is True

    @patch("routers.validity.LLMClient")
    def test_json_error_returns_500(self, MockClient):
        mock_instance = AsyncMock()
        mock_instance.analyze = AsyncMock(return_value="not json")
        MockClient.return_value = mock_instance

        response = client.post("/api/check-validity", json={
            "argument_label": "Test",
            "premises": ["Premise"],
            "conclusion": "Conclusion",
        })

        assert response.status_code == 500
