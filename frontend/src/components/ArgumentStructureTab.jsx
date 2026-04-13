import { useState, useCallback } from 'react';
import {
  GitBranch, ChevronDown,
  AlertCircle, AlertTriangle, Info, XCircle, HelpCircle,
  ShieldAlert
} from 'lucide-react';

function getScoreClass(score) {
  if (score >= 7) return 'score-high';
  if (score >= 4) return 'score-medium';
  return 'score-low';
}

function getSeverityBadgeClass(severity) {
  if (severity === 'high') return 'badge-low';
  if (severity === 'medium') return 'badge-medium';
  return 'badge-high';
}

export default function ArgumentStructureTab({ result }) {
  const args = result?.arguments || [];
  const counterargument = result?.counterargument_coverage;

  const [expanded, setExpanded] = useState(() => {
    const init = {};
    args.forEach((a) => { init[a.id] = true; });
    return init;
  });

  const toggleExpand = useCallback((id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  if (!result) return null;

  if (args.length === 0) {
    return (
      <div className="empty-state">
        <div className="icon"><GitBranch size={48} /></div>
        <h3>No Arguments Detected</h3>
        <p>No structured arguments were found in the paper.</p>
        <span className="empty-state-subtitle">Try adding clearer thesis statements and supporting claims.</span>
      </div>
    );
  }

  return (
    <div>
      {/* Legend */}
      <div className="arg-legend">
        <div className="arg-legend-title">Argument Scores</div>
        <div className="arg-legend-scores-row">
          <div>
            <span className="score-value-sm score-high arg-legend-score-label">V:8</span>
            <span className="arg-legend-score-desc">Validity — Does the conclusion follow from the premises?</span>
          </div>
          <div>
            <span className="score-value-sm score-high arg-legend-score-label">S:7</span>
            <span className="arg-legend-score-desc">Soundness — Are the premises themselves true?</span>
          </div>
        </div>
        <div>
          <div className="arg-legend-types-title">Reasoning Types</div>
          <div className="arg-legend-types-wrap">
            {[
              { type: 'deductive', desc: 'Conclusion necessarily follows from premises' },
              { type: 'inductive', desc: 'Conclusion probably follows from premises' },
              { type: 'abductive', desc: 'Best explanation for the evidence' },
              { type: 'analogical', desc: 'Conclusion drawn from structural similarity' },
              { type: 'rhetorical', desc: 'Persuasive appeal rather than logical proof' },
            ].map(({ type, desc }) => (
              <span key={type} className="badge badge-type arg-legend-badge" title={desc}>
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>

      {counterargument && (
        <div className="arg-counter-section">
          <h3 className="section-header">
            <ShieldAlert size={16} className="icon-primary" />
            Counterargument Coverage
          </h3>
          <div className="bib-scores arg-bib-scores">
            <div className="bib-score-card">
              <div className="score-label">Coverage Score</div>
              <div className={`score-value ${getScoreClass(counterargument.coverage_score)}`}>
                {counterargument.coverage_score}/10
              </div>
            </div>
          </div>
          <div className="score-bar-container arg-score-bar-wrap">
            <div
              className={`score-bar ${getScoreClass(counterargument.coverage_score)}`}
              style={{ width: `${counterargument.coverage_score * 10}%` }}
            />
          </div>
          {counterargument.assessment && (
            <p className="score-explanation">{counterargument.assessment}</p>
          )}
        </div>
      )}

      <h3 className="section-header">
        <GitBranch size={16} /> Arguments ({args.length})
      </h3>

      {args.map((arg) => (
        <div className="arg-card" key={arg.id}>
          <button className="arg-card-header" onClick={() => toggleExpand(arg.id)}>
            <div>
              <div className="arg-card-label">{arg.label}</div>
              <div className="arg-card-location">{arg.location}</div>
            </div>
            <div className="arg-card-badges">
              <span className="badge badge-type">{arg.reasoning_type}</span>
              <span className={`score-value-sm ${getScoreClass(arg.validity_score)}`}>V:{arg.validity_score}</span>
              <span className={`score-value-sm ${getScoreClass(arg.soundness_score)}`}>S:{arg.soundness_score}</span>
              <ChevronDown size={16} className={`arg-chevron ${expanded[arg.id] ? 'arg-chevron-expanded' : ''}`} />
            </div>
          </button>
          {expanded[arg.id] && (
            <div className="arg-card-body">
              <div className="arg-section">
                <div className="arg-section-label">Conclusion</div>
                <div className="arg-conclusion">{arg.conclusion}</div>
              </div>

              <div className="arg-section">
                <div className="arg-section-label">Premises</div>
                <ul className="arg-list">
                  {arg.premises.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>

              {arg.fallacies_detected && arg.fallacies_detected.length > 0 && (
                <div className="arg-section">
                  <div className="arg-section-label">
                    <AlertCircle size={12} className="icon-danger" />
                    Fallacies Detected
                  </div>
                  {arg.fallacies_detected.map((f, i) => (
                    <div className="arg-fallacy-card" key={i}>
                      <div className="arg-fallacy-header">
                        <span className={`badge ${getSeverityBadgeClass(f.severity)}`}>
                          {f.severity}
                        </span>
                        <span>{f.fallacy_type}</span>
                      </div>
                      {f.passage && (
                        <div className="arg-fallacy-passage">"{f.passage}"</div>
                      )}
                      <div className="arg-fallacy-desc">{f.description}</div>
                    </div>
                  ))}
                </div>
              )}

              {arg.weak_points && arg.weak_points.length > 0 && (
                <div className="arg-section">
                  <div className="arg-section-label">
                    <AlertCircle size={12} className="icon-warning" />
                    Weak Points
                  </div>
                  <ul className="arg-list weak-points">
                    {arg.weak_points.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              )}

              {arg.leaps && arg.leaps.length > 0 && (
                <div className="arg-section">
                  <div className="arg-section-label">
                    <AlertTriangle size={12} className="icon-danger" />
                    Reasoning Leaps
                  </div>
                  <ul className="arg-list leaps">
                    {arg.leaps.map((l, i) => <li key={i}>{l}</li>)}
                  </ul>
                </div>
              )}

              {arg.controversial_premises && arg.controversial_premises.length > 0 && (
                <div className="arg-section">
                  <div className="arg-section-label">
                    <AlertTriangle size={12} className="icon-amber" />
                    Controversial Premises
                  </div>
                  <ul className="arg-list controversial">
                    {arg.controversial_premises.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
              )}

              {arg.irrelevant_points && arg.irrelevant_points.length > 0 && (
                <div className="arg-section">
                  <div className="arg-section-label">
                    <XCircle size={12} className="icon-muted" />
                    Irrelevant Points
                  </div>
                  <ul className="arg-list irrelevant">
                    {arg.irrelevant_points.map((ir, i) => <li key={i}>{ir}</li>)}
                  </ul>
                </div>
              )}

              {arg.implicit_premises && arg.implicit_premises.length > 0 && (
                <div className="arg-section">
                  <div className="arg-section-label">
                    <Info size={12} className="icon-primary" />
                    Implicit Premises
                  </div>
                  <ul className="arg-list">
                    {arg.implicit_premises.map((ip, i) => <li key={i}>{ip}</li>)}
                  </ul>
                </div>
              )}

              {arg.follow_ups && arg.follow_ups.length > 0 && (
                <div className="arg-section">
                  <div className="arg-section-label">
                    <HelpCircle size={12} className="icon-primary" />
                    Follow-ups
                  </div>
                  <ul className="arg-list follow-ups">
                    {arg.follow_ups.map((fu, i) => <li key={i}>{fu}</li>)}
                  </ul>
                </div>
              )}

              {arg.notes && (
                <div className="arg-section">
                  <div className="arg-section-label">Notes</div>
                  <div className="arg-notes">{arg.notes}</div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {counterargument?.strongest_unaddressed && counterargument.strongest_unaddressed.length > 0 && (
        <div className="unaddressed-section">
          <h3 className="section-header">
            <ShieldAlert size={16} className="icon-danger" />
            Unaddressed Objections
          </h3>
          {counterargument.strongest_unaddressed.map((obj, i) => (
            <div className="objection-card" key={i}>
              <p>{obj}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
