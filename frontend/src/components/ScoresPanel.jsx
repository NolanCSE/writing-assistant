import { BarChart3 } from 'lucide-react';

const SCORE_LABELS = {
  clarity: 'Clarity',
  concision: 'Concision',
  argument_strength: 'Argument Strength',
  writing_style: 'Writing Style',
  structure: 'Structure & Organization',
  evidence: 'Evidence & Support',
  grammar: 'Grammar & Mechanics',
};

function getScoreClass(score) {
  if (score >= 7) return 'score-high';
  if (score >= 4) return 'score-medium';
  return 'score-low';
}

function ScoreCard({ dimension, data }) {
  if (!data) return null;
  const cls = getScoreClass(data.score);
  return (
    <div className="score-card">
      <div className="score-header">
        <span className="score-label">{SCORE_LABELS[dimension] || dimension}</span>
        <span className={`score-value ${cls}`}>{data.score}/10</span>
      </div>
      <div className="score-bar-container">
        <div className={`score-bar ${cls}`} style={{ width: `${data.score * 10}%` }} />
      </div>
      <p className="score-explanation">{data.explanation}</p>
    </div>
  );
}

export default function ScoresPanel({ result }) {
  if (!result) return null;
  return (
    <div>
      <h3 className="section-header">
        <BarChart3 size={16} /> Dimension Scores
      </h3>
      <div className="scores-grid">
        {result.scores && Object.entries(result.scores).map(([dim, data]) => (
          <ScoreCard key={dim} dimension={dim} data={data} />
        ))}
      </div>
    </div>
  );
}
