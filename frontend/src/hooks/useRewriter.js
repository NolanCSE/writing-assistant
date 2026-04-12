import { useState, useCallback } from 'react';
import { rewriteSection } from '../api/client';

export function useRewriter() {
  const [sectionText, setSectionText] = useState('');
  const [focusArea, setFocusArea] = useState('');
  const [rewriteResult, setRewriteResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const rewrite = useCallback(async () => {
    setLoading(true);
    setError(null);
    setRewriteResult(null);
    try {
      const result = await rewriteSection(sectionText, focusArea);
      setRewriteResult(result);
    } catch (err) {
      setError(err.message || 'Rewrite failed');
    } finally {
      setLoading(false);
    }
  }, [sectionText, focusArea]);

  const clearResult = useCallback(() => {
    setRewriteResult(null);
    setError(null);
  }, []);

  return {
    sectionText,
    focusArea,
    rewriteResult,
    loading,
    error,
    setSectionText,
    setFocusArea,
    rewrite,
    clearResult,
  };
}
