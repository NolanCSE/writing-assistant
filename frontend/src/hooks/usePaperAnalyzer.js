import { useState, useCallback } from 'react';
import { analyzePaper } from '../api/client';

export function usePaperAnalyzer() {
  const [paperText, setPaperText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('analysis');

  const analyze = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const result = await analyzePaper(paperText);
      let parsed;
      if (typeof result === 'string') {
        parsed = JSON.parse(result);
      } else {
        parsed = result;
      }
      setAnalysis(parsed);
    } catch (err) {
      setError(err.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }, [paperText]);

  const clearAnalysis = useCallback(() => {
    setAnalysis(null);
    setError(null);
  }, []);

  return {
    paperText,
    analysis,
    loading,
    error,
    activeTab,
    setActiveTab,
    setPaperText,
    analyze,
    clearAnalysis,
  };
}
