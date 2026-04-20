import { TrendingUp, TrendingDown, BookOpen, ChevronRight } from 'lucide-react';

function getScoreColor(score) {
  if (score >= 7) return 'var(--success)';
  if (score >= 4) return 'var(--warning)';
  return 'var(--danger)';
}

function getRelevanceBadge(relevance) {
  const r = (relevance || '').toLowerCase();
  if (r === 'high') return 'badge-high';
  if (r === 'medium') return 'badge-medium';
  return 'badge-low';
}

export default function OverviewTab({ result }) {
  if (!result) return null;

  return (
    <div>
      <div className="score-ring-container">
        <div className="score-ring" style={{ '--score': Math.round(result.overall_score * 10), '--ring-color': getScoreColor(result.overall_score) }}>
          <span className="score-ring-value" style={{ color: getScoreColor(result.overall_score) }}>
            {result.overall_score.toFixed(1)}
          </span>
        </div>
        <span className="score-ring-label">Overall Score</span>
      </div>

      {result.summary && <div className="summary-text">{result.summary}</div>}

      <div className="overview-grid">
        <div>
          <h3 className="section-header">
            <TrendingUp size={16} className="icon-success" /> Strengths
          </h3>
          <ul className="strength-weakness-list strengths">
            {(result.strengths || []).map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
        <div>
          <h3 className="section-header">
            <TrendingDown size={16} className="icon-danger" /> Weaknesses
          </h3>
          <ul className="strength-weakness-list weaknesses">
            {(result.weaknesses || []).map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      </div>

      {/* Auto-Research Section */}
      {result.suggested_sources && result.suggested_sources.length > 0 && (
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <BookOpen size={16} className="icon-primary" />
            <h3 className="section-header" style={{ margin: 0 }}>
              Suggested Sources
            </h3>
            <span style={{
              padding: '2px 8px',
              fontSize: '0.6875rem',
              fontWeight: 600,
              background: 'var(--primary-bg)',
              color: 'var(--primary)',
              borderRadius: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.03em'
            }}>
              Auto-discovered
            </span>
          </div>
          
          {result.research_summary && (
            <div className="research-summary" style={{ marginBottom: '12px' }}>
              {result.research_summary}
            </div>
          )}
          
          <div style={{ display: 'grid', gap: '10px' }}>
            {result.suggested_sources.map((source, idx) => (
              <div key={idx} className="source-card">
                <div className="research-source-header">
                  <div className="source-title">{source.title}</div>
                  <span className={`badge ${getRelevanceBadge(source.relevance)}`}>
                    {source.relevance}
                  </span>
                </div>
                <div className="source-meta">
                  {source.authors} ({source.year}) ·{' '}
                  <span className="badge badge-type">{source.type}</span>
                </div>
                <div className="source-reason">{source.reason}</div>
                {source.suggested_placement && (
                  <div className="research-placement">
                    <ChevronRight size={12} className="research-placement-icon" />
                    Suggested for: <strong>{source.suggested_placement}</strong>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
