import { TrendingUp, TrendingDown } from 'lucide-react';

function getScoreColor(score) {
  if (score >= 7) return 'var(--success)';
  if (score >= 4) return 'var(--warning)';
  return 'var(--danger)';
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
    </div>
  );
}
