import { useState, useCallback } from 'react';
import { checkBibliography } from '../api/client';

export function useBibliography() {
  const [bibResult, setBibResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkBibliography = useCallback(async (paperText) => {
    setLoading(true);
    setError(null);
    setBibResult(null);
    try {
      const result = await checkBibliography(paperText);
      setBibResult(result);
    } catch (err) {
      setError(err.message || 'Bibliography check failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setBibResult(null);
    setError(null);
  }, []);

  return {
    bibResult,
    loading,
    error,
    checkBibliography,
    clearResult,
  };
}
