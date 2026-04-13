import { useState, useCallback } from 'react';
import { getFullAnalysis } from '../api/client';

export function useFullAnalysis() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paperText, setPaperText] = useState('');

  const analyze = useCallback(async () => {
    if (!paperText.trim()) {
      throw new Error('Paper text is required');
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getFullAnalysis(paperText);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Analysis failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [paperText]);

  const clearAnalysis = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { paperText, result, loading, error, setPaperText, analyze, clearAnalysis };
}
