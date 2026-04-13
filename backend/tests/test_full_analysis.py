"""Tests for the full analysis endpoint."""
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


FULL_RESPONSE = """{
  "summary": "The paper presents a clear argument but has some structural issues.",
  "scores": {
    "clarity": {"score": 7, "explanation": "Generally clear but some passages need work."},
    "concision": {"score": 8, "explanation": "Well-structured, minimal redundancy."},
    "argument_strength": {"score": 6, "explanation": "Main thesis needs more support."},
    "writing_style": {"score": 7, "explanation": "Professional tone, good flow."},
    "structure": {"score": 5, "explanation": "Transitions between sections are weak."},
    "evidence": {"score": 6, "explanation": "Some claims lack citations."},
    "grammar": {"score": 9, "explanation": "Only minor punctuation issues."}
  },
  "overall_score": 6.9,
  "strengths": ["Strong opening thesis", "Good use of examples"],
  "weaknesses": ["Weak transitions", "Some unsupported claims"],
  "arguments": [
    {
      "id": "arg-1",
      "label": "Main thesis",
      "location": "Introduction",
      "premises": ["Premise 1"],
      "conclusion": "The conclusion",
      "reasoning_type": "inductive",
      "validity_score": 7,
      "soundness_score": 6,
      "fallacies_detected": [],
      "implicit_premises": ["Assumption 1"],
      "weak_points": ["The claim about cost savings lacks supporting data"],
      "leaps": ["The argument jumps from correlation to causation without establishing mechanism"],
      "controversial_premises": ["Assumes that all users will adopt the technology at the same rate"],
      "irrelevant_points": ["The discussion of competitor pricing doesn't support the main thesis"],
      "follow_ups": ["What happens if the assumed growth rate doesn't materialize?"],
      "notes": "Needs more evidence"
    }
  ],
  "counterargument_coverage": {
    "coverage_score": 5,
    "strongest_unaddressed": ["The economic argument is not addressed"],
    "assessment": "One counterargument addressed, strongest ignored."
  },
  "bibliography": {
    "style_detected": "APA",
    "format_score": 7,
    "completeness_score": 8,
    "issues": [
      {
        "location": "(Smith, 2020)",
        "issue_type": "missing_info",
        "description": "No page number provided",
        "suggestion": "Add page number for direct quote"
      }
    ]
  },
  "issues": [
    {
      "id": 1,
      "text_span": "This sentence needs improvement",
      "start_char": 42,
      "end_char": 72,
      "category": "clarity",
      "severity": "warning",
      "title": "Unclear phrasing",
      "description": "The meaning of this sentence is ambiguous.",
      "suggestion": "Rewrite to make the subject and verb clearer.",
      "focus_area": "clarity"
    },
    {
      "id": 2,
      "text_span": "Obviously this is the case",
      "start_char": 150,
      "end_char": 175,
      "category": "fallacy",
      "severity": "warning",
      "title": "Questionable reasoning",
      "description": "This assumes what it should be proving.",
      "suggestion": "Provide evidence instead of asserting the conclusion.",
      "focus_area": "clarity"
    }
  ]
}"""


class TestFullAnalysis:
    """Tests for the full analysis endpoint."""

    @patch("routers.full_analysis.LLMClient")
    def test_valid_response(self, MockClient):
        """Valid JSON response should return 200 with all fields populated."""
        mock_instance = AsyncMock()
        mock_instance.analyze = AsyncMock(return_value=FULL_RESPONSE)
        MockClient.return_value = mock_instance

        response = client.post("/api/full-analysis", json={
            "text": "This is a paper about something. This sentence needs improvement. The rest of the paper. Obviously this is the case. And so on.",
        })

        assert response.status_code == 200
        body = response.json()
        assert body["summary"] == "The paper presents a clear argument but has some structural issues."
        assert body["overall_score"] == 6.9
        assert len(body["scores"]) == 7
        assert len(body["arguments"]) == 1
        assert body["counterargument_coverage"]["coverage_score"] == 5
        assert body["bibliography"]["style_detected"] == "APA"
        assert len(body["issues"]) == 2
        assert body["issues"][0]["text_span"] == "This sentence needs improvement"
        assert body["issues"][0]["category"] == "clarity"

    @patch("routers.full_analysis.LLMClient")
    def test_json_error_returns_500(self, MockClient):
        """Non-JSON response should return 500."""
        mock_instance = AsyncMock()
        mock_instance.analyze = AsyncMock(return_value="not valid json")
        MockClient.return_value = mock_instance

        response = client.post("/api/full-analysis", json={
            "text": "A paper about things.",
        })

        assert response.status_code == 500
        assert "Failed to parse" in response.json()["detail"]

    @patch("routers.full_analysis.LLMClient")
    def test_null_bibliography(self, MockClient):
        """When paper has no bibliography, the bibliography field should be null."""
        mock_instance = AsyncMock()
        mock_instance.analyze = AsyncMock(return_value='''{
          "summary": "A descriptive paper.",
          "scores": {
            "clarity": {"score": 8, "explanation": "Clear."},
            "concision": {"score": 7, "explanation": "Good."},
            "argument_strength": {"score": 5, "explanation": "No real arguments."},
            "writing_style": {"score": 7, "explanation": "Good."},
            "structure": {"score": 6, "explanation": "Okay."},
            "evidence": {"score": 4, "explanation": "No citations."},
            "grammar": {"score": 9, "explanation": "Clean."}
          },
          "overall_score": 6.6,
          "strengths": ["Clear writing"],
          "weaknesses": ["No citations"],
          "arguments": [],
          "counterargument_coverage": {
            "coverage_score": 0,
            "strongest_unaddressed": [],
            "assessment": "No arguments to counter."
          },
          "bibliography": null,
          "issues": []
        }''')
        MockClient.return_value = mock_instance

        response = client.post("/api/full-analysis", json={
            "text": "A descriptive essay with no bibliography.",
        })

        assert response.status_code == 200
        body = response.json()
        assert body["bibliography"] is None
        assert body["issues"] == []

    @patch("routers.full_analysis.LLMClient")
    def test_markdown_fences_stripped(self, MockClient):
        """Response wrapped in markdown code fences should still parse."""
        mock_instance = AsyncMock()
        mock_instance.analyze = AsyncMock(return_value=f"```json\n{FULL_RESPONSE}\n```")
        MockClient.return_value = mock_instance

        response = client.post("/api/full-analysis", json={
            "text": "Paper text here.",
        })

        assert response.status_code == 200
        body = response.json()
        assert len(body["issues"]) == 2
