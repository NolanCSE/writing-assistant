"""Integration test for auto-research feature in full analysis"""
from unittest.mock import AsyncMock, patch
import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


FULL_ANALYSIS_WITH_RESEARCH = """{
  "summary": "The paper presents a thought experiment about identity and change over time.",
  "scores": {
    "clarity": {"score": 7, "explanation": "Generally clear presentation."},
    "concision": {"score": 8, "explanation": "Well-structured without redundancy."},
    "argument_strength": {"score": 6, "explanation": "Interesting questions but needs more rigor."},
    "writing_style": {"score": 7, "explanation": "Engaging philosophical style."},
    "structure": {"score": 6, "explanation": "Good flow overall."},
    "evidence": {"score": 5, "explanation": "Could benefit from more citations."},
    "grammar": {"score": 9, "explanation": "Clean grammar throughout."}
  },
  "overall_score": 6.9,
  "strengths": ["Engaging thought experiment", "Clear presentation"],
  "weaknesses": ["Limited citations", "Could explore implications more deeply"],
  "arguments": [
    {
      "id": "arg-1",
      "label": "Identity paradox",
      "location": "Main body",
      "premises": ["All parts of the ship are replaced", "The ship maintains continuity"],
      "conclusion": "The identity of the ship is questionable",
      "reasoning_type": "inductive",
      "validity_score": 7,
      "soundness_score": 6,
      "fallacies_detected": [],
      "implicit_premises": ["Identity requires some form of continuity"],
      "weak_points": ["Does not define what constitutes identity"],
      "leaps": [],
      "controversial_premises": [],
      "irrelevant_points": [],
      "follow_ups": ["How does this apply to personal identity?"],
      "notes": "Classic philosophical puzzle"
    }
  ],
  "counterargument_coverage": {
    "coverage_score": 4,
    "strongest_unaddressed": ["The functionalist view of identity is not addressed"],
    "assessment": "Limited counterargument consideration."
  },
  "bibliography": null,
  "issues": []
}"""


RESEARCH_RESPONSE = """{
  "research_summary": "The Ship of Theseus paradox has been extensively discussed in contemporary philosophy of identity, with key contributions from David Lewis on temporal parts and Derek Parfit on personal identity.",
  "sources": [
    {
      "title": "Identity and Necessity",
      "authors": ["Saul Kripke"],
      "year": 1971,
      "type": "article",
      "relevance": "high",
      "reason": "Discusses necessary properties and identity across possible worlds, directly relevant to the Ship of Theseus problem.",
      "suggested_placement": "When introducing the identity paradox"
    },
    {
      "title": "Reasons and Persons",
      "authors": ["Derek Parfit"],
      "year": 1984,
      "type": "book",
      "relevance": "high",
      "reason": "Extensive discussion of personal identity and the implications of continuity over time.",
      "suggested_placement": "When discussing implications for personal identity"
    }
  ]
}"""


class TestAutoResearchIntegration:
    """Tests for the auto-research feature integrated with full analysis."""

    @patch("routers.full_analysis.LLMClient")
    def test_full_analysis_includes_auto_research(self, MockClient):
        """Test that full analysis automatically includes research results"""
        mock_instance = AsyncMock()
        # Mock both the main analysis and research calls
        mock_instance.analyze = AsyncMock(side_effect=[
            FULL_ANALYSIS_WITH_RESEARCH,  # First call: main analysis
            RESEARCH_RESPONSE,  # Second call: research
        ])
        MockClient.return_value = mock_instance

        sample_paper = """
        The Ship of Theseus is a thought experiment that raises questions about identity. 
        If all parts of a ship are replaced over time, is it still the same ship? 
        This paradox has implications for personal identity and metaphysics.
        """

        response = client.post(
            "/api/full-analysis",
            json={"text": sample_paper}
        )

        assert response.status_code == 200
        data = response.json()

        # Check that the response includes expected core fields
        assert "summary" in data
        assert "scores" in data
        assert "arguments" in data

        # Check that auto-research fields are present
        assert "suggested_sources" in data
        assert "research_summary" in data

        # Verify that research data was included
        assert data["suggested_sources"] is not None
        assert len(data["suggested_sources"]) == 2
        assert data["research_summary"] is not None
        assert "Ship of Theseus" in data["research_summary"]

        # Verify structure of sources
        for source in data["suggested_sources"]:
            assert "title" in source
            assert "authors" in source
            assert "year" in source
            assert "type" in source
            assert "relevance" in source
            assert "reason" in source
            assert "suggested_placement" in source

        # Verify specific source details
        first_source = data["suggested_sources"][0]
        assert first_source["title"] == "Identity and Necessity"
        assert first_source["authors"] == ["Saul Kripke"]
        assert first_source["year"] == 1971

    @patch("routers.full_analysis.LLMClient")
    def test_full_analysis_continues_on_research_failure(self, MockClient):
        """Test that main analysis succeeds even if research fails"""
        mock_instance = AsyncMock()
        # First call succeeds (main analysis), second call fails (research)
        mock_instance.analyze = AsyncMock(side_effect=[
            FULL_ANALYSIS_WITH_RESEARCH,  # Main analysis succeeds
            Exception("Research service unavailable"),  # Research fails
        ])
        MockClient.return_value = mock_instance

        sample_paper = "This is a minimal test paper for graceful degradation."

        response = client.post(
            "/api/full-analysis",
            json={"text": sample_paper}
        )

        # Main analysis should still succeed
        assert response.status_code == 200
        data = response.json()

        # Core analysis fields must be present
        assert "summary" in data
        assert "scores" in data
        assert "arguments" in data

        # Research fields should be present but None due to failure
        assert "suggested_sources" in data
        assert "research_summary" in data
        assert data["suggested_sources"] is None
        assert data["research_summary"] is None

    @patch("routers.full_analysis.LLMClient")
    def test_research_with_invalid_json(self, MockClient):
        """Test that invalid JSON from research doesn't break main analysis"""
        mock_instance = AsyncMock()
        mock_instance.analyze = AsyncMock(side_effect=[
            FULL_ANALYSIS_WITH_RESEARCH,  # Main analysis succeeds
            "not valid json at all",  # Research returns invalid JSON
        ])
        MockClient.return_value = mock_instance

        response = client.post(
            "/api/full-analysis",
            json={"text": "A paper about philosophical topics."}
        )

        assert response.status_code == 200
        data = response.json()

        # Core analysis should work
        assert data["summary"] is not None
        assert len(data["scores"]) > 0

        # Research should gracefully fail
        assert data["suggested_sources"] is None
        assert data["research_summary"] is None

    @patch("routers.full_analysis.LLMClient")
    def test_research_with_markdown_fences(self, MockClient):
        """Test that research response with markdown fences is properly parsed"""
        mock_instance = AsyncMock()
        mock_instance.analyze = AsyncMock(side_effect=[
            FULL_ANALYSIS_WITH_RESEARCH,
            f"```json\n{RESEARCH_RESPONSE}\n```",  # Research wrapped in markdown
        ])
        MockClient.return_value = mock_instance

        response = client.post(
            "/api/full-analysis",
            json={"text": "A paper about the Ship of Theseus paradox."}
        )

        assert response.status_code == 200
        data = response.json()

        # Research should be properly parsed despite markdown fences
        assert data["suggested_sources"] is not None
        assert len(data["suggested_sources"]) == 2
        assert data["research_summary"] is not None

    @patch("routers.full_analysis.LLMClient")
    def test_research_with_no_sources(self, MockClient):
        """Test handling when research returns no sources"""
        mock_instance = AsyncMock()
        mock_instance.analyze = AsyncMock(side_effect=[
            FULL_ANALYSIS_WITH_RESEARCH,
            """{
              "research_summary": "No relevant sources found for this topic.",
              "sources": []
            }""",
        ])
        MockClient.return_value = mock_instance

        response = client.post(
            "/api/full-analysis",
            json={"text": "A paper about a very obscure topic."}
        )

        assert response.status_code == 200
        data = response.json()

        # Should have research fields, but sources list is empty
        assert data["suggested_sources"] is not None
        assert len(data["suggested_sources"]) == 0
        assert data["research_summary"] is not None
