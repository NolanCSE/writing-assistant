import { useState, useCallback } from 'react';
import { analyzeLogic } from '../api/client';

export function useLogicalAnalysis() {
  const [logicResult, setLogicResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkLogic = useCallback(async (paperText) => {
    if (!paperText || !paperText.trim()) {
      throw new Error('Paper text is required');
    }
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeLogic(paperText);
      setLogicResult(result);
    } catch (err) {
      setError(err.message || 'Failed to analyze logic');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setLogicResult(null);
    setError(null);
  }, []);

  return { logicResult, loading, error, checkLogic, clearResult };
}
