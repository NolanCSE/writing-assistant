import { useState, useCallback } from 'react';
import {
  FileText, Sparkles, BarChart3, Search,
  RotateCcw, AlertTriangle, RefreshCw, X
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useFullAnalysis } from './hooks/useFullAnalysis';
import { useResearcher } from './hooks/useResearcher';
import PaperView from './components/PaperView';
import OverviewTab from './components/OverviewTab';
import ScoresPanel from './components/ScoresPanel';
import ArgumentStructureTab from './components/ArgumentStructureTab';
import BibliographyTab from './components/BibliographyTab';
import ResearchTab from './components/ResearchTab';
import './styles/index.css';

function EmptyState({ tab }) {
  const messages = {
    analysis: { icon: <BarChart3 size={40} />, title: 'No Analysis Yet', desc: 'Paste your paper and click "Analyze Paper" to get a comprehensive review with inline highlights.' },
    research: { icon: <Search size={40} />, title: 'Research Assistant', desc: 'Find relevant sources and research materials for your paper.' },
  };
  const msg = messages[tab] || messages.analysis;
  return (
    <div className="empty-state">
      <div className="icon">{msg.icon}</div>
      <h3>{msg.title}</h3>
      <p>{msg.desc}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="loading-container">
      <div className="loading-spinner" />
      <p className="loading-text">Analyzing your paper...</p>
    </div>
  );
}

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div>
          <h1>
            <FileText className="icon" size={24} />
            Writing Analyzer
          </h1>
          <p className="header-subtitle">
            AI-powered writing analysis, research, and citation tools
          </p>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const {
    paperText, result, loading, error,
    setPaperText, analyze, clearAnalysis,
  } = useFullAnalysis();

  const researcher = useResearcher();

  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [activeTab, setActiveTab] = useState('analysis');
  const [subTab, setSubTab] = useState('overview');
  const [viewMode, setViewMode] = useState('edit');
  const [resultsStale, setResultsStale] = useState(false);
  const [errorDismissed, setErrorDismissed] = useState(false);

  const handleAnalyze = useCallback(async () => {
    if (!paperText.trim()) {
      toast.error('Please enter your paper text first.');
      return;
    }
    setErrorDismissed(false);
    try {
      await analyze();
      setActiveTab('analysis');
      setSelectedIssueId(null);
      setViewMode('view');
      setResultsStale(false);
      toast.success('Analysis complete!');
    } catch (err) {
      toast.error(err.message || 'Analysis failed. Please try again.');
    }
  }, [analyze, paperText]);

  const handleResearch = useCallback(async () => {
    try {
      await researcher.research(paperText);
      toast.success('Research complete!');
    } catch (err) {
      toast.error(err.message || 'Research failed.');
    }
  }, [researcher, paperText]);

  const handleIssueClick = useCallback((issueId) => {
    setSelectedIssueId(issueId);
    if (activeTab !== 'analysis') {
      setActiveTab('analysis');
    }
  }, [activeTab]);

  const handleApplyRewrite = useCallback((issue, rewrittenText) => {
    if (!issue.text_span) return;
    const newText = paperText.replace(issue.text_span, rewrittenText);
    setPaperText(newText);
    setSelectedIssueId(null);
    setResultsStale(true);
    toast.success('Rewrite applied!');
  }, [paperText, setPaperText]);

  const handleReset = useCallback(() => {
    clearAnalysis();
    setSelectedIssueId(null);
    setViewMode('edit');
    setResultsStale(false);
  }, [clearAnalysis]);

  const handleBackToSummary = useCallback(() => {
    setSelectedIssueId(null);
  }, []);

  const handleReanalyze = useCallback(async () => {
    if (!paperText.trim()) return;
    try {
      await analyze();
      setResultsStale(false);
      toast.success('Analysis complete!');
    } catch (err) {
      toast.error(err.message || 'Analysis failed. Please try again.');
    }
  }, [analyze, paperText]);

  const wordCount = paperText.trim() ? paperText.trim().split(/\s+/).length : 0;

  const lengthHint = wordCount === 0
    ? '(paste your paper to begin)'
    : wordCount < 100
      ? '(too short for meaningful analysis)'
      : wordCount < 500
        ? '(short — analysis works best with 500+ words)'
        : wordCount <= 10000
          ? '(good length for analysis)'
          : '(very long — analysis may take longer)';

  const selectedIssue = result?.issues?.find((i) => i.id === selectedIssueId) || null;

  const tabs = [
    { id: 'analysis', label: 'Analysis', icon: <BarChart3 size={14} /> },
    { id: 'research', label: 'Research', icon: <Search size={14} /> },
  ];

  return (
    <div className="app-container">
      <Toaster position="top-right" />
      <Header />
      <div className="main-layout">
        {/* Left Panel */}
        <div className="panel editor-panel">
          <div className="panel-header">
            <h2><FileText className="icon" size={16} /> Paper Editor</h2>
          </div>
          <div className="panel-body">
            <PaperView
              paperText={paperText}
              onPaperTextChange={setPaperText}
              issues={result?.issues || []}
              selectedIssue={selectedIssue}
              onIssueClick={handleIssueClick}
              onBackToSummary={handleBackToSummary}
              onApplyRewrite={handleApplyRewrite}
              onRewriteApplied={() => setResultsStale(true)}
              isAnalyzing={loading}
              result={result}
              viewMode={viewMode}
              onToggleMode={() => setViewMode((m) => (m === 'edit' ? 'view' : 'edit'))}
            />
          </div>
          <div className="editor-toolbar">
            <div className="toolbar-word-info">
              <span className="word-count">
                {wordCount > 0 ? `${wordCount.toLocaleString()} words` : 'No text yet'}
              </span>
              <span className="paper-length-hint">{lengthHint}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary" onClick={handleReset} disabled={!result}>
                <RotateCcw size={14} /> Reset
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAnalyze}
                disabled={loading || !paperText.trim()}
              >
                {loading ? (
                  <><RotateCcw size={14} className="spin" /> Analyzing...</>
                ) : (
                  <><Sparkles size={14} /> Analyze Paper</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="panel results-panel">
          <div className="panel-header">
            <h2><BarChart3 className="icon" size={16} /> Results</h2>
            <div className="tab-bar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="panel-body">
            {activeTab === 'analysis' && (
              loading ? (
                <LoadingState />
              ) : error && !errorDismissed ? (
                <div className="error-recovery">
                  <AlertTriangle size={20} />
                  <p>{error}</p>
                  <div className="error-recovery-actions">
                    <button className="btn btn-primary" onClick={handleAnalyze}>
                      <RefreshCw size={14} /> Retry
                    </button>
                    <button className="btn btn-ghost" onClick={() => setErrorDismissed(true)}>
                      <X size={14} /> Dismiss
                    </button>
                  </div>
                </div>
              ) : result ? (
                <>
                  <div className="sub-tab-bar">
                      {[
                        { id: 'overview', label: 'Overview' },
                        { id: 'scores', label: 'Scores' },
                        { id: 'arguments', label: 'Arguments' },
                        { id: 'bibliography', label: 'Bibliography' },
                      ].map((st) => (
                        <button key={st.id}
                          className={`sub-tab-button ${subTab === st.id ? 'active' : ''}`}
                          onClick={() => setSubTab(st.id)}
                          disabled={st.id === 'bibliography' && !result.bibliography}>
                          {st.label}
                        </button>
                      ))}
                    </div>
                    {resultsStale && (
                      <div className="stale-banner">
                        <span>Results may be outdated — re-analyze for accurate feedback</span>
                        <button className="btn btn-primary" onClick={handleReanalyze}>
                          <RefreshCw size={14} /> Re-analyze
                        </button>
                      </div>
                    )}
                    {subTab === 'overview' && <OverviewTab result={result} />}
                    {subTab === 'scores' && <ScoresPanel result={result} />}
                    {subTab === 'arguments' && <ArgumentStructureTab result={result} />}
                    {subTab === 'bibliography' && result.bibliography && <BibliographyTab result={result} />}
                  </>
              ) : (
                <EmptyState tab="analysis" />
              )
            )}
            {activeTab === 'research' && (
              <ResearchTab
                researcher={{
                  ...researcher,
                  research: handleResearch,
                }}
                paperText={paperText}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
