const BASE_URL = 'http://localhost:8000';

async function request(endpoint, body) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        message = errorData.detail;
      } else if (errorData.error) {
        message = errorData.error;
      }
    } catch {
      // use default message
    }
    throw new Error(message);
  }

  return response.json();
}

export async function analyzePaper(paperText) {
  if (!paperText || !paperText.trim()) {
    throw new Error('Paper text is required');
  }
  return request('/api/analyze', { text: paperText });
}

export async function rewriteSection(sectionText, focusArea) {
  if (!sectionText || !sectionText.trim()) {
    throw new Error('Section text is required');
  }
  if (!focusArea || !focusArea.trim()) {
    throw new Error('Focus area is required');
  }
  return request('/api/rewrite', { text: sectionText, focus_area: focusArea });
}

export async function researchSources(paperText, topic) {
  if (!paperText || !paperText.trim()) {
    throw new Error('Paper text is required');
  }
  if (!topic || !topic.trim()) {
    throw new Error('Topic is required');
  }
  return request('/api/research', { text: paperText, topic });
}

export async function checkBibliography(paperText) {
  if (!paperText || !paperText.trim()) {
    throw new Error('Paper text is required');
  }
  return request('/api/bibliography', { text: paperText });
}

export async function analyzeLogic(paperText) {
  if (!paperText || !paperText.trim()) {
    throw new Error('Paper text is required');
  }
  return request('/api/logical-analysis', { text: paperText });
}

export async function getFullAnalysis(paperText) {
  if (!paperText || !paperText.trim()) {
    throw new Error('Paper text is required');
  }
  return request('/api/full-analysis', { text: paperText });
}
