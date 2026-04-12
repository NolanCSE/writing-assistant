"""Tests for the rewrite and research endpoints, including error handling."""
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


# --- Rewrite endpoint tests ---

class TestRewriteJSONError:
    """Test that rewrite endpoint handles JSON parse errors gracefully."""

    @patch("routers.rewrite.LLMClient")
    def test_rewrite_response_falls_back_on_json_error(self, MockClient):
        """When the LLM returns non-JSON text, the endpoint should return 200
        with the raw response as rewritten_text."""
        mock_instance = AsyncMock()
        mock_instance.analyze = AsyncMock(return_value="not valid json")
        MockClient.return_value = mock_instance

        response = client.post("/api/rewrite", json={
            "text": "This is a paragraph that needs improvement.",
            "focus_area": "clarity",
        })

        assert response.status_code == 200
        body = response.json()
        assert body["rewritten_text"] == "not valid json"
        assert body["changes_summary"] == "Raw response returned (parsing failed)"
        assert body["focus_area"] == "clarity"
        assert body["original_text"] == "This is a paragraph that needs improvement."

    @patch("routers.rewrite.LLMClient")
    def test_rewrite_response_with_partial_json_error(self, MockClient):
        """When the LLM returns text with markdown fences around JSON, it should
        still parse correctly."""
        mock_instance = AsyncMock()
        mock_instance.analyze = AsyncMock(return_value="""```json
{"rewritten_text": "Better text", "changes_summary": "Improved clarity"}
```""")
        MockClient.return_value = mock_instance

        response = client.post("/api/rewrite", json={
            "text": "This is a paragraph that needs improvement.",
            "focus_area": "clarity",
        })

        assert response.status_code == 200
        body = response.json()
        assert body["rewritten_text"] == "Better text"
        assert body["changes_summary"] == "Improved clarity"


# --- Research endpoint tests ---

class TestResearchJSONError:
    """Test that research endpoint returns 500 on JSON parse errors."""

    @patch("routers.research.LLMClient")
    def test_research_response_handles_json_error(self, MockClient):
        """When the LLM returns non-JSON text, the endpoint should return 500."""
        mock_instance = AsyncMock()
        mock_instance.analyze = AsyncMock(return_value="not valid json")
        MockClient.return_value = mock_instance

        response = client.post("/api/research", json={
            "text": "This is a paper about climate change.",
            "topic": "",
        })

        assert response.status_code == 500
        body = response.json()
        assert "Failed to parse research results" in body["detail"]

    @patch("routers.research.LLMClient")
    def test_research_response_with_valid_json(self, MockClient):
        """When the LLM returns valid JSON, the endpoint should return 200."""
        mock_instance = AsyncMock()
        mock_instance.analyze = AsyncMock(return_value="""{
    "research_summary": "This paper would benefit from additional sources.",
    "sources": [
        {
            "title": "Climate Change Impacts",
            "authors": "Smith, John",
            "year": 2023,
            "type": "journal_article",
            "relevance": "High",
            "reason": "Directly addresses the paper's main argument",
            "suggested_placement": "Introduction"
        }
    ]
}""")
        MockClient.return_value = mock_instance

        response = client.post("/api/research", json={
            "text": "This is a paper about climate change.",
            "topic": "",
        })

        assert response.status_code == 200
        body = response.json()
        assert body["research_summary"] == "This paper would benefit from additional sources."
        assert len(body["sources"]) == 1
        assert body["sources"][0]["title"] == "Climate Change Impacts"
