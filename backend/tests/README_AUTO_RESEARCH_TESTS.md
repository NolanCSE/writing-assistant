# Auto-Research Integration Tests

## Overview

`test_auto_research_integration.py` contains integration tests for the auto-research feature that was added to the full analysis endpoint.

## Test Coverage

The test suite includes:

1. **test_full_analysis_includes_auto_research** - Verifies that the full analysis endpoint automatically includes research results with proper structure
2. **test_full_analysis_continues_on_research_failure** - Ensures graceful degradation when research fails (main analysis still succeeds)
3. **test_research_with_invalid_json** - Tests that invalid JSON from research doesn't break the main analysis
4. **test_research_with_markdown_fences** - Verifies proper parsing of research responses wrapped in markdown code fences
5. **test_research_with_no_sources** - Tests handling when research returns an empty sources list

## Running the Tests

If pytest is installed:
```bash
cd backend
source venv/bin/activate
pytest tests/test_auto_research_integration.py -v
```

To install pytest (if not already installed):
```bash
pip install pytest httpx
```

## Test Pattern

The tests follow the existing pattern used in other test files:
- Mock the LLMClient to return predefined responses
- Use FastAPI's TestClient for endpoint testing
- Test both success and failure scenarios
- Verify response structure and content

## Key Behaviors Tested

1. **Parallel Execution**: Research runs in parallel with main analysis
2. **Graceful Degradation**: If research fails, main analysis still completes
3. **Optional Fields**: `suggested_sources` and `research_summary` can be None
4. **Response Structure**: Validates all expected fields in Source objects
