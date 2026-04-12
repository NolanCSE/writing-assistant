"""Tests for the logical analysis endpoint."""
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


VALID_LOGIC_RESPONSE = """{
  "overview": {
    "thesis": "Social media has a net negative effect on adolescent mental health.",
    "overall_logical_score": 6,
    "reasoning_types_detected": ["inductive", "analogical"],
    "summary": "The paper presents several inductive arguments with moderate logical rigor. The main thesis is supported by correlational evidence but lacks causal reasoning."
  },
  "arguments": [
    {
      "argument_label": "Main thesis on social media harm",
      "location": "Introduction, paragraph 1",
      "premises": ["Studies show increased screen time correlates with anxiety", "Adolescents using social media 3+ hours daily report lower life satisfaction"],
      "conclusion": "Social media has a net negative effect on adolescent mental health",
      "reasoning_type": "inductive",
      "validity_score": 7,
      "soundness_score": 6,
      "fallacies_detected": [
        {
          "fallacy_type": "hasty_generalization",
          "description": "The conclusion about all social media is drawn from limited platform-specific studies",
          "passage": "All social media platforms are harmful",
          "severity": "significant"
        }
      ],
      "implicit_premises": ["Correlation implies causation", "Self-reported data is reliable"],
      "notes": "The argument would benefit from longitudinal studies rather than cross-sectional data."
    }
  ],
  "semantic_consistency": [
    {
      "term": "social media",
      "definitions_found": ["Digital platforms for user-generated content (para 1)", "Specifically Instagram and TikTok (para 3)"],
      "assessment": "Inconsistent usage",
      "location": "Introduction vs. Evidence section"
    }
  ],
  "counterargument_coverage": {
    "coverage_score": 5,
    "strongest_unaddressed": ["Social media provides community support for marginalized youth"],
    "assessment": "The paper acknowledges one counterargument but does not engage with the strongest objections."
  }
}"""


class TestLogicalAnalysis:
    """Tests for the logical analysis endpoint."""

    @patch("routers.logical_analysis.LLMClient")
    def test_logic_analysis_valid_response(self, MockClient):
        """Valid JSON response should return 200 with parsed data."""
        mock_instance = AsyncMock()
        mock_instance.analyze = AsyncMock(return_value=VALID_LOGIC_RESPONSE)
        MockClient.return_value = mock_instance

        response = client.post("/api/logical-analysis", json={
            "text": "This is a paper about social media and mental health.",
        })

        assert response.status_code == 200
        body = response.json()
        assert body["overview"]["thesis"] == "Social media has a net negative effect on adolescent mental health."
        assert body["overview"]["overall_logical_score"] == 6
        assert len(body["arguments"]) == 1
        assert body["arguments"][0]["argument_label"] == "Main thesis on social media harm"
        assert len(body["arguments"][0]["fallacies_detected"]) == 1
        assert body["arguments"][0]["fallacies_detected"][0]["fallacy_type"] == "hasty_generalization"
        assert len(body["semantic_consistency"]) == 1
        assert body["semantic_consistency"][0]["term"] == "social media"
        assert body["counterargument_coverage"]["coverage_score"] == 5

    @patch("routers.logical_analysis.LLMClient")
    def test_logic_analysis_json_error_returns_500(self, MockClient):
        """Non-JSON response should return 500."""
        mock_instance = AsyncMock()
        mock_instance.analyze = AsyncMock(return_value="not valid json")
        MockClient.return_value = mock_instance

        response = client.post("/api/logical-analysis", json={
            "text": "This is a paper about social media.",
        })

        assert response.status_code == 500
        body = response.json()
        assert "Failed to parse logical analysis results" in body["detail"]

    @patch("routers.logical_analysis.LLMClient")
    def test_logic_analysis_empty_arguments(self, MockClient):
        """Response with no arguments should still return 200."""
        mock_instance = AsyncMock()
        mock_instance.analyze = AsyncMock(return_value="""{
  "overview": {
    "thesis": "The sky is blue.",
    "overall_logical_score": 5,
    "reasoning_types_detected": [],
    "summary": "No substantive arguments found."
  },
  "arguments": [],
  "semantic_consistency": [],
  "counterargument_coverage": {
    "coverage_score": 0,
    "strongest_unaddressed": [],
    "assessment": "No arguments to counter."
  }
}""")
        MockClient.return_value = mock_instance

        response = client.post("/api/logical-analysis", json={
            "text": "The sky is blue.",
        })

        assert response.status_code == 200
        body = response.json()
        assert body["arguments"] == []
        assert body["semantic_consistency"] == []

    @patch("routers.logical_analysis.LLMClient")
    def test_logic_analysis_with_markdown_fences(self, MockClient):
        """Response wrapped in markdown code fences should still parse."""
        mock_instance = AsyncMock()
        mock_instance.analyze = AsyncMock(return_value=f"""```json
{VALID_LOGIC_RESPONSE}
```""")
        MockClient.return_value = mock_instance

        response = client.post("/api/logical-analysis", json={
            "text": "This is a paper about social media.",
        })

        assert response.status_code == 200
        body = response.json()
        assert len(body["arguments"]) == 1
