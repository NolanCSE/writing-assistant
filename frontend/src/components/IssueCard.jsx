import { useState } from 'react';
import {
  ArrowLeft, RotateCcw, X, CheckCircle2, AlertTriangle, Info, AlertCircle, Sparkles
} from 'lucide-react';
import { rewriteSection } from '../api/client';

function getSeverityIcon(severity) {
  switch (severity) {
    case 'error': return <AlertCircle size={16} />;
    case 'warning': return <AlertTriangle size={16} />;
    default: return <Info size={16} />;
  }
}

function getSeverityClass(severity) {
  switch (severity) {
    case 'error': return 'badge-low';
    case 'warning': return 'badge-medium';
    default: return 'badge-high';
  }
}

export default function IssueCard({ issue, onBack, onApply, onRewriteApplied }) {
  const [rewriting, setRewriting] = useState(false);
  const [rewriteResult, setRewriteResult] = useState(null);
  const [rewriteError, setRewriteError] = useState(null);
  const [applySuccess, setApplySuccess] = useState(false);

  const handleRewrite = async () => {
    if (!issue.text_span || !issue.focus_area) return;
    setRewriting(true);
    setRewriteError(null);
    try {
      const result = await rewriteSection(issue.text_span, issue.focus_area);
      setRewriteResult(result);
    } catch (err) {
      setRewriteError(err.message);
    } finally {
      setRewriting(false);
    }
  };

  const handleApply = () => {
    if (rewriteResult) {
      onApply(issue, rewriteResult.rewritten_text);
      setRewriteResult(null);
      setApplySuccess(true);
      setTimeout(() => setApplySuccess(false), 800);
      onRewriteApplied?.();
    }
  };

  const handleReject = () => {
    setRewriteResult(null);
  };

  if (!issue) return null;

  return (
    <div className="issue-card">
      <button className="btn btn-ghost issue-card-back" onClick={onBack}>
        <ArrowLeft size={14} /> Back to summary
      </button>

      <div className="issue-card-header">
        <div className="issue-card-title-row">
          <span className="issue-card-icon">{getSeverityIcon(issue.severity)}</span>
          <h3 className="issue-card-title">{issue.title}</h3>
        </div>
        <div className="issue-card-badges">
          <span className={`badge ${getSeverityClass(issue.severity)}`}>
            {issue.severity}
          </span>
          <span className="badge badge-type">{issue.category}</span>
        </div>
      </div>

      <div className="issue-card-passage">
        "{issue.text_span}"
      </div>

      <p className="issue-card-description">{issue.description}</p>

      <div className="issue-card-suggestion">
        <CheckCircle2 size={14} className="issue-card-suggestion-icon" />
        <span>{issue.suggestion}</span>
      </div>

      {issue.focus_area && !rewriteResult && (
        <button
          className="btn btn-primary issue-card-rewrite-btn"
          onClick={handleRewrite}
          disabled={rewriting}
        >
          {rewriting ? (
            <><RotateCcw size={14} className="spin" /> Rewriting...</>
          ) : (
            <><Sparkles size={14} /> Rewrite this section</>
          )}
        </button>
      )}

      {rewriteError && (
        <div className="error-state issue-card-error">
          <p>{rewriteError}</p>
        </div>
      )}

      {rewriteResult && (
        <div className="rewrite-result issue-rewrite-result">
          <h4><CheckCircle2 size={14} /> Rewritten Version</h4>
          <div className="rewrite-text">{rewriteResult.rewritten_text}</div>
          {rewriteResult.changes_summary && (
            <p className="rewrite-changes">
              <strong>Changes:</strong> {rewriteResult.changes_summary}
            </p>
          )}
          <div className="issue-rewrite-actions">
            <button
              className={`btn btn-primary ${applySuccess ? 'btn-retry' : ''}`}
              onClick={handleApply}
            >
              <CheckCircle2 size={14} /> Apply
            </button>
            <button className="btn btn-ghost" onClick={handleReject}>
              <X size={14} /> Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
