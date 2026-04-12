import { useState, useCallback } from 'react';
import { researchSources } from '../api/client';

export function useResearcher() {
  const [topic, setTopic] = useState('');
  const [researchResult, setResearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const research = useCallback(async (paperText) => {
    setLoading(true);
    setError(null);
    setResearchResult(null);
    try {
      const result = await researchSources(paperText, topic);
      setResearchResult(result);
    } catch (err) {
      setError(err.message || 'Research failed');
    } finally {
      setLoading(false);
    }
  }, [topic]);

  const clearResult = useCallback(() => {
    setResearchResult(null);
    setError(null);
  }, []);

  return {
    topic,
    researchResult,
    loading,
    error,
    setTopic,
    research,
    clearResult,
  };
}
