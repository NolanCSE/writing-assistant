import { GraduationCap, AlertCircle, CheckCircle2 } from 'lucide-react';

function getScoreClass(score) {
  if (score >= 7) return 'score-high';
  if (score >= 4) return 'score-medium';
  return 'score-low';
}

export default function BibliographyTab({ result }) {
  if (!result) return null;
  const bib = result.bibliography;

  if (!bib) {
    return (
      <div className="empty-state">
        <div className="icon"><GraduationCap size={48} /></div>
        <h3>No Bibliography Detected</h3>
        <p>No references section was found in the paper.</p>
        <span className="empty-state-subtitle">Add a references or works cited section for analysis.</span>
      </div>
    );
  }

  return (
    <div>
      <div className="bib-style-banner">
        <GraduationCap size={16} className="icon-primary" />
        <span>Detected style: <strong>{bib.style_detected}</strong></span>
      </div>
      <div className="bib-scores">
        <div className="bib-score-card">
          <div className="score-label">Format Score</div>
          <div className={`score-value ${getScoreClass(bib.format_score)}`}>{bib.format_score}/10</div>
        </div>
        <div className="bib-score-card">
          <div className="score-label">Completeness</div>
          <div className={`score-value ${getScoreClass(bib.completeness_score)}`}>{bib.completeness_score}/10</div>
        </div>
      </div>
      {bib.issues && bib.issues.length > 0 ? (
        <>
          <h3 className="section-header">
            <AlertCircle size={16} className="icon-warning" />
            Issues Found ({bib.issues.length})
          </h3>
          {bib.issues.map((issue, i) => (
            <div className="citation-item" key={i}>
              {issue.location && <div className="citation-location">{issue.location}</div>}
              <span className={`citation-type ${issue.issue_type}`}>{issue.issue_type.replace('_', ' ')}</span>
              <p className="citation-description">{issue.description}</p>
              <p className="citation-suggestion">
                <CheckCircle2 size={12} className="bib-suggestion-icon" />
                {issue.suggestion}
              </p>
            </div>
          ))}
        </>
      ) : (
        <div className="bib-clear-state">
          <CheckCircle2 size={32} />
          <h3 className="bib-clear-title">All Clear</h3>
          <p className="bib-clear-text">No citation issues found.</p>
        </div>
      )}
    </div>
  );
}
