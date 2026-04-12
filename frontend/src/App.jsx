import { useState, useCallback } from 'react';
import {
  FileText, Sparkles, Edit3, BookOpen, Quote,
  Search, AlertCircle, CheckCircle2, TrendingUp,
  TrendingDown, ChevronRight, RotateCcw, X,
  PenTool, GraduationCap, BarChart3, Brain,
  ShieldAlert, ShieldCheck, GitBranch, AlertTriangle
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { usePaperAnalyzer } from './hooks/usePaperAnalyzer';
import { useRewriter } from './hooks/useRewriter';
import { useResearcher } from './hooks/useResearcher';
import { useBibliography } from './hooks/useBibliography';
import { useLogicalAnalysis } from './hooks/useLogicalAnalysis';
import './styles/index.css';

const FOCUS_AREAS = [
  { value: 'all', label: 'All' },
  { value: 'clarity', label: 'Clarity' },
  { value: 'concision', label: 'Concision' },
  { value: 'style', label: 'Style' },
  { value: 'flow', label: 'Flow' },
];

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

function getSeverityBadge(severity) {
  const s = (severity || '').toLowerCase();
  if (s === 'critical') return 'badge-low';
  if (s === 'significant') return 'badge-medium';
  return 'badge-high';
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

function ScoreRing({ score, label }) {
  const pct = Math.round(score * 10);
  const color = getScoreColor(score);
  return (
    <div className="score-ring-container">
      <div
        className="score-ring"
        style={{ '--score': pct, '--ring-color': color }}
      >
        <span className="score-ring-value" style={{ color }}>
          {score.toFixed(1)}
        </span>
      </div>
      <span className="score-ring-label">{label}</span>
    </div>
  );
}

function ScoreCard({ dimension, data }) {
  if (!data) return null;
  const cls = getScoreClass(data.score);
  return (
    <div className="score-card">
      <div className="score-header">
        <span className="score-label">
          {SCORE_LABELS[dimension] || dimension}
        </span>
        <span className={`score-value ${cls}`}>{data.score}/10</span>
      </div>
      <div className="score-bar-container">
        <div
          className={`score-bar ${cls}`}
          style={{ width: `${data.score * 10}%` }}
        />
      </div>
      <p className="score-explanation">{data.explanation}</p>
    </div>
  );
}

function AnalysisTab({ analysis }) {
  if (!analysis) return null;
  return (
    <div>
      <ScoreRing score={analysis.overall_score} label="Overall Score" />

      {analysis.summary && (
        <div className="summary-text">{analysis.summary}</div>
      )}

      <h3 className="section-header">
        <BarChart3 size={16} /> Dimension Scores
      </h3>
      <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
        {analysis.scores &&
          Object.entries(analysis.scores).map(([dim, data]) => (
            <ScoreCard key={dim} dimension={dim} data={data} />
          ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h3 className="section-header">
            <TrendingUp size={16} style={{ color: 'var(--success)' }} /> Strengths
          </h3>
          <ul className="strength-weakness-list strengths">
            {(analysis.strengths || []).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="section-header">
            <TrendingDown size={16} style={{ color: 'var(--danger)' }} /> Weaknesses
          </h3>
          <ul className="strength-weakness-list weaknesses">
            {(analysis.weaknesses || []).map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      </div>

      {analysis.suggestions && analysis.suggestions.length > 0 && (
        <>
          <h3 className="section-header">
            <Sparkles size={16} /> Suggestions
          </h3>
          {(analysis.suggestions || []).map((s, i) => (
            <div className="suggestion-card" key={i}>
              <div className="suggestion-section">{s.section}</div>
              <div className="suggestion-issue">{s.issue}</div>
              <div className="suggestion-text">{s.suggestion}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function RewriteTab({ rewriter, paperText }) {
  return (
    <div>
      <div className="section-editor">
        <label>
          <Edit3 size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Paste the section you want rewritten
        </label>
        <textarea
          className="section-textarea"
          placeholder="Paste a section from your paper here..."
          value={rewriter.sectionText}
          onChange={(e) => rewriter.setSectionText(e.target.value)}
          rows={6}
        />
      </div>

      <label style={{ fontSize: '0.8125rem', fontWeight: 600, marginTop: 12, display: 'block' }}>
        Focus Area
      </label>
      <div className="focus-selector">
        {FOCUS_AREAS.map((fa) => (
          <button
            key={fa.value}
            className={`focus-option ${rewriter.focusArea === fa.value ? 'active' : ''}`}
            onClick={() => rewriter.setFocusArea(fa.value)}
          >
            {fa.label}
          </button>
        ))}
      </div>

      <div className="action-row">
        <button
          className="btn btn-primary"
          onClick={rewriter.rewrite}
          disabled={rewriter.loading || !rewriter.sectionText.trim()}
        >
          {rewriter.loading ? (
            <RotateCcw size={14} className="spin" />
          ) : (
            <PenTool size={14} />
          )}
          {rewriter.loading ? 'Rewriting...' : 'Rewrite Section'}
        </button>
        {rewriter.rewriteResult && (
          <button className="btn btn-ghost" onClick={rewriter.clearResult}>
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {rewriter.error && (
        <div className="error-state">
          <p>{rewriter.error}</p>
        </div>
      )}

      {rewriter.rewriteResult && (
        <div className="rewrite-result">
          <h4><CheckCircle2 size={14} /> Rewritten Section</h4>
          <div className="rewrite-text">{rewriter.rewriteResult.rewritten_text}</div>
          <p className="rewrite-changes">
            <strong>Changes:</strong> {rewriter.rewriteResult.changes_summary}
          </p>
        </div>
      )}
    </div>
  );
}

function ResearchTab({ researcher, paperText }) {
  return (
    <div>
      <div className="input-group">
        <label>
          <Search size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Research Topic (optional — leave empty to use paper context)
        </label>
        <input
          type="text"
          className="input-field"
          placeholder="e.g., effects of social media on academic performance"
          value={researcher.topic}
          onChange={(e) => researcher.setTopic(e.target.value)}
        />
      </div>

      <div className="action-row">
        <button
          className="btn btn-primary"
          onClick={() => researcher.research(paperText)}
          disabled={researcher.loading || !paperText.trim()}
        >
          {researcher.loading ? (
            <RotateCcw size={14} className="spin" />
          ) : (
            <Search size={14} />
          )}
          {researcher.loading ? 'Researching...' : 'Find Sources'}
        </button>
        {researcher.researchResult && (
          <button className="btn btn-ghost" onClick={researcher.clearResult}>
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {researcher.error && (
        <div className="error-state"><p>{researcher.error}</p></div>
      )}

      {researcher.researchResult && (
        <div style={{ marginTop: 16 }}>
          {researcher.researchResult.research_summary && (
            <div className="research-summary">
              {researcher.researchResult.research_summary}
            </div>
          )}
          {researcher.researchResult.sources && researcher.researchResult.sources.length > 0 && (
            <>
              <h3 className="section-header">
                <BookOpen size={16} /> Suggested Sources
              </h3>
              {researcher.researchResult.sources.map((source, i) => (
                <div className="source-card" key={i}>
                  <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 8 }}>
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
                    <div style={{ marginTop: 6, fontSize: '0.8125rem', color: 'var(--primary)' }}>
                      <ChevronRight size={12} style={{ verticalAlign: 'middle' }} />
                      Suggested for: <strong>{source.suggested_placement}</strong>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function LogicAnalysisTab({ logicChecker, paperText }) {
  return (
    <div>
      <div className="action-row" style={{ marginBottom: 16 }}>
        <button
          className="btn btn-primary"
          onClick={() => logicChecker.checkLogic(paperText)}
          disabled={logicChecker.loading || !paperText.trim()}
        >
          {logicChecker.loading ? (
            <RotateCcw size={14} className="spin" />
          ) : (
            <Brain size={14} />
          )}
          {logicChecker.loading ? 'Analyzing...' : 'Analyze Logic'}
        </button>
        {logicChecker.logicResult && (
          <button className="btn btn-ghost" onClick={logicChecker.clearResult}>
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {logicChecker.error && (
        <div className="error-state"><p>{logicChecker.error}</p></div>
      )}

      {logicChecker.logicResult && (
        <div>
          {/* Overview */}
          <div style={{
            background: 'var(--primary-bg)',
            border: '1px solid #bfdbfe',
            borderRadius: 'var(--radius)',
            padding: '14px',
            marginBottom: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>
                <Brain size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Thesis
              </h3>
              <span className={`score-value ${getScoreClass(logicChecker.logicResult.overview.overall_logical_score)}`}>
                {logicChecker.logicResult.overview.overall_logical_score}/10
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: 6 }}>
              {logicChecker.logicResult.overview.thesis}
            </p>
            {logicChecker.logicResult.overview.summary && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {logicChecker.logicResult.overview.summary}
              </p>
            )}
            {logicChecker.logicResult.overview.reasoning_types_detected && logicChecker.logicResult.overview.reasoning_types_detected.length > 0 && (
              <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {logicChecker.logicResult.overview.reasoning_types_detected.map((rt, i) => (
                  <span key={i} className="badge badge-type">{rt}</span>
                ))}
              </div>
            )}
          </div>

          {/* Arguments */}
          {logicChecker.logicResult.arguments && logicChecker.logicResult.arguments.length > 0 && (
            <>
              <h3 className="section-header">
                <GitBranch size={16} /> Arguments ({logicChecker.logicResult.arguments.length})
              </h3>
              {logicChecker.logicResult.arguments.map((arg, i) => (
                <div className="source-card" key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 8, marginBottom: 6 }}>
                    <div>
                      <div className="source-title">{arg.argument_label}</div>
                      {arg.location && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{arg.location}</div>
                      )}
                    </div>
                    <span className="badge badge-type">{arg.reasoning_type}</span>
                  </div>

                  {/* Premises */}
                  {arg.premises && arg.premises.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Premises</div>
                      <ul style={{ listStyle: 'disc', paddingLeft: 18, margin: 0 }}>
                        {arg.premises.map((p, j) => (
                          <li key={j} style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Conclusion */}
                  {arg.conclusion && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Conclusion</div>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.5, padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                        {arg.conclusion}
                      </p>
                    </div>
                  )}

                  {/* Validity & Soundness bars */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Validity</div>
                      <div className="score-bar-container">
                        <div className={`score-bar ${getScoreClass(arg.validity_score)}`} style={{ width: `${arg.validity_score * 10}%` }} />
                      </div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginTop: 2 }} className={getScoreClass(arg.validity_score)}>
                        {arg.validity_score}/10
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Soundness</div>
                      <div className="score-bar-container">
                        <div className={`score-bar ${getScoreClass(arg.soundness_score)}`} style={{ width: `${arg.soundness_score * 10}%` }} />
                      </div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginTop: 2 }} className={getScoreClass(arg.soundness_score)}>
                        {arg.soundness_score}/10
                      </div>
                    </div>
                  </div>

                  {/* Fallacies */}
                  {arg.fallacies_detected && arg.fallacies_detected.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--danger)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ShieldAlert size={12} /> Fallacies Detected
                      </div>
                      {arg.fallacies_detected.map((f, j) => (
                        <div key={j} style={{ padding: '8px 10px', background: 'var(--danger-bg)', borderRadius: 'var(--radius-sm)', marginBottom: 4 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                            <span className={`badge ${getSeverityBadge(f.severity)}`}>{f.severity}</span>
                            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {f.fallacy_type.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 4 }}>{f.description}</p>
                          {f.passage && (
                            <div style={{ fontSize: '0.8125rem', fontFamily: 'monospace', background: 'var(--bg-primary)', padding: '4px 8px', borderRadius: 4, color: 'var(--text-primary)' }}>
                              "{f.passage}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Implicit premises */}
                  {arg.implicit_premises && arg.implicit_premises.length > 0 && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--warning)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <AlertTriangle size={12} /> Implicit Premises
                      </div>
                      <ul style={{ listStyle: 'disc', paddingLeft: 18, margin: 0 }}>
                        {arg.implicit_premises.map((ip, j) => (
                          <li key={j} style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{ip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Notes */}
                  {arg.notes && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: 6 }}>{arg.notes}</p>
                  )}
                </div>
              ))}
            </>
          )}

          {/* Semantic Consistency */}
          {logicChecker.logicResult.semantic_consistency && logicChecker.logicResult.semantic_consistency.length > 0 && (
            <>
              <h3 className="section-header">
                <ShieldCheck size={16} /> Semantic Consistency
              </h3>
              {logicChecker.logicResult.semantic_consistency.map((term, i) => (
                <div className="citation-item" key={i}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>"{term.term}"</span>
                    <span className={`badge ${term.assessment.toLowerCase().includes('inconsistent') ? 'badge-low' : 'badge-high'}`}>
                      {term.assessment}
                    </span>
                  </div>
                  {term.definitions_found && term.definitions_found.length > 0 && (
                    <ul style={{ listStyle: 'disc', paddingLeft: 18, margin: '0 0 4px 0' }}>
                      {term.definitions_found.map((d, j) => (
                        <li key={j} style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{d}</li>
                      ))}
                    </ul>
                  )}
                  {term.location && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{term.location}</div>
                  )}
                </div>
              ))}
            </>
          )}

          {/* Counterargument Coverage */}
          {logicChecker.logicResult.counterargument_coverage && (
            <>
              <h3 className="section-header">
                <ShieldAlert size={16} /> Counterargument Coverage
              </h3>
              <div className="bib-scores">
                <div className="bib-score-card">
                  <div className="score-label">Coverage Score</div>
                  <div className={`score-value ${getScoreClass(logicChecker.logicResult.counterargument_coverage.coverage_score)}`}>
                    {logicChecker.logicResult.counterargument_coverage.coverage_score}/10
                  </div>
                </div>
              </div>
              {logicChecker.logicResult.counterargument_coverage.assessment && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>
                  {logicChecker.logicResult.counterargument_coverage.assessment}
                </p>
              )}
              {logicChecker.logicResult.counterargument_coverage.strongest_unaddressed && logicChecker.logicResult.counterargument_coverage.strongest_unaddressed.length > 0 && (
                <>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--danger)', marginBottom: 4 }}>Strongest Unaddressed Objections</div>
                  <ul style={{ listStyle: 'disc', paddingLeft: 18, margin: 0 }}>
                    {logicChecker.logicResult.counterargument_coverage.strongest_unaddressed.map((obj, i) => (
                      <li key={i} style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>{obj}</li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function BibliographyTab({ bibChecker, paperText }) {
  return (
    <div>
      <div className="action-row" style={{ marginBottom: 16 }}>
        <button
          className="btn btn-primary"
          onClick={() => bibChecker.checkBibliography(paperText)}
          disabled={bibChecker.loading || !paperText.trim()}
        >
          {bibChecker.loading ? (
            <RotateCcw size={14} className="spin" />
          ) : (
            <Quote size={14} />
          )}
          {bibChecker.loading ? 'Checking...' : 'Check Bibliography'}
        </button>
        {bibChecker.bibResult && (
          <button className="btn btn-ghost" onClick={bibChecker.clearResult}>
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {bibChecker.error && (
        <div className="error-state"><p>{bibChecker.error}</p></div>
      )}

      {bibChecker.bibResult && (
        <div>
          <div style={{
            background: 'var(--primary-bg)',
            border: '1px solid #bfdbfe',
            borderRadius: 'var(--radius)',
            padding: '12px 16px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '0.875rem',
          }}>
            <GraduationCap size={16} style={{ color: 'var(--primary)' }} />
            <span>Detected citation style: <strong>{bibChecker.bibResult.citation_style_detected}</strong></span>
          </div>

          <div className="bib-scores">
            <div className="bib-score-card">
              <div className="score-label">Format Score</div>
              <div className={`score-value ${getScoreClass(bibChecker.bibResult.format_score)}`}>
                {bibChecker.bibResult.format_score}/10
              </div>
            </div>
            <div className="bib-score-card">
              <div className="score-label">Completeness</div>
              <div className={`score-value ${getScoreClass(bibChecker.bibResult.completeness_score)}`}>
                {bibChecker.bibResult.completeness_score}/10
              </div>
            </div>
          </div>

          {bibChecker.bibResult.issues_found && bibChecker.bibResult.issues_found.length > 0 && (
            <>
              <h3 className="section-header">
                <AlertCircle size={16} style={{ color: 'var(--warning)' }} />
                Issues Found ({bibChecker.bibResult.issues_found.length})
              </h3>
              {bibChecker.bibResult.issues_found.map((issue, i) => (
                <div className="citation-item" key={i}>
                  {issue.location && (
                    <div className="citation-location">{issue.location}</div>
                  )}
                  <span className={`citation-type ${issue.issue_type}`}>
                    {issue.issue_type.replace('_', ' ')}
                  </span>
                  <p className="citation-description">{issue.description}</p>
                  <p className="citation-suggestion">
                    <CheckCircle2 size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    {issue.suggestion}
                  </p>
                </div>
              ))}
            </>
          )}

          {bibChecker.bibResult.missing_references && bibChecker.bibResult.missing_references.length > 0 && (
            <>
              <h3 className="section-header">
                <AlertCircle size={16} style={{ color: 'var(--danger)' }} />
                Missing References
              </h3>
              {bibChecker.bibResult.missing_references.map((ref, i) => (
                <div className="citation-item" key={i}>
                  <p className="citation-description">{ref}</p>
                </div>
              ))}
            </>
          )}

          {bibChecker.bibResult.unused_references && bibChecker.bibResult.unused_references.length > 0 && (
            <>
              <h3 className="section-header">
                <AlertCircle size={16} style={{ color: 'var(--warning)' }} />
                Unused References
              </h3>
              {bibChecker.bibResult.unused_references.map((ref, i) => (
                <div className="citation-item" key={i}>
                  <p className="citation-description">{ref}</p>
                </div>
              ))}
            </>
          )}

          {(!bibChecker.bibResult.issues_found || bibChecker.bibResult.issues_found.length === 0) &&
           (!bibChecker.bibResult.missing_references || bibChecker.bibResult.missing_references.length === 0) &&
           (!bibChecker.bibResult.unused_references || bibChecker.bibResult.unused_references.length === 0) && (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: 'var(--success)',
            }}>
              <CheckCircle2 size={40} style={{ marginBottom: 12 }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>All Clear!</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                No citation issues found. Your bibliography looks good.
              </p>
            </div>
          )}
        </div>
      )}
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

function EmptyState({ tab }) {
  const messages = {
    analysis: { icon: <BarChart3 size={40} />, title: 'No Analysis Yet', desc: 'Paste your paper and click "Analyze Paper" to get a comprehensive review.' },
    rewrite: { icon: <Edit3 size={40} />, title: 'Section Rewriter', desc: 'Paste a section from your paper and choose a focus area to get an improved version.' },
    research: { icon: <Search size={40} />, title: 'Research Assistant', desc: 'Find relevant sources and research materials for your paper.' },
    bibliography: { icon: <Quote size={40} />, title: 'Bibliography Checker', desc: 'Check your citations and bibliography for errors and completeness.' },
    logic: { icon: <Brain size={40} />, title: 'Logic Analyzer', desc: 'Decompose arguments, detect fallacies, and evaluate logical validity.' },
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

export default function App() {
  const analyzer = usePaperAnalyzer();
  const rewriter = useRewriter();
  const researcher = useResearcher();
  const bibChecker = useBibliography();
  const logicChecker = useLogicalAnalysis();

  const [activeTab, setActiveTab] = useState('analysis');

  const wordCount = analyzer.paperText.trim()
    ? analyzer.paperText.trim().split(/\s+/).length
    : 0;

  const handleAnalyze = useCallback(async () => {
    if (!analyzer.paperText.trim()) {
      toast.error('Please enter your paper text first.');
      return;
    }
    try {
      await analyzer.analyze();
      setActiveTab('analysis');
      toast.success('Analysis complete!');
    } catch (err) {
      toast.error(err.message || 'Analysis failed. Please try again.');
    }
  }, [analyzer]);

  const handleRewrite = useCallback(async () => {
    try {
      await rewriter.rewrite();
      toast.success('Section rewritten!');
    } catch (err) {
      toast.error(err.message || 'Rewrite failed.');
    }
  }, [rewriter]);

  const handleResearch = useCallback(async () => {
    try {
      await researcher.research(analyzer.paperText);
      toast.success('Research complete!');
    } catch (err) {
      toast.error(err.message || 'Research failed.');
    }
  }, [researcher, analyzer.paperText]);

  const handleBibCheck = useCallback(async () => {
    try {
      await bibChecker.checkBibliography(analyzer.paperText);
      toast.success('Bibliography check complete!');
    } catch (err) {
      toast.error(err.message || 'Bibliography check failed.');
    }
  }, [bibChecker, analyzer.paperText]);

  const handleLogicCheck = useCallback(async () => {
    try {
      await logicChecker.checkLogic(analyzer.paperText);
      toast.success('Logic analysis complete!');
    } catch (err) {
      toast.error(err.message || 'Logic analysis failed.');
    }
  }, [logicChecker, analyzer.paperText]);

  const tabs = [
    { id: 'analysis', label: 'Analysis', icon: <BarChart3 size={14} /> },
    { id: 'rewrite', label: 'Rewrite', icon: <Edit3 size={14} /> },
    { id: 'research', label: 'Research', icon: <Search size={14} /> },
    { id: 'bibliography', label: 'Bibliography', icon: <Quote size={14} /> },
    { id: 'logic', label: 'Logic', icon: <Brain size={14} /> },
  ];

  return (
    <div className="app-container">
      <Toaster position="top-right" />
      <Header />

      <div className="main-layout">
        <div className="panel editor-panel">
          <div className="panel-header">
            <h2><FileText className="icon" size={16} /> Paper Editor</h2>
            {wordCount > 0 && <span className="word-count">{wordCount.toLocaleString()} words</span>}
          </div>
          <div className="panel-body">
            <textarea
              className="paper-textarea"
              placeholder="Paste your paper here...&#10;&#10;The analyzer will review your writing across multiple dimensions including clarity, concision, argument strength, style, structure, evidence, and grammar. It will provide scores, identify strengths and weaknesses, and offer specific suggestions for improvement.&#10;&#10;For best results, include your full paper including any bibliography or references section."
              value={analyzer.paperText}
              onChange={(e) => analyzer.setPaperText(e.target.value)}
            />
          </div>
          <div className="editor-toolbar">
            <span className="word-count">
              {wordCount > 0 ? `${wordCount.toLocaleString()} words` : 'No text yet'}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-secondary"
                onClick={analyzer.clearAnalysis}
                disabled={!analyzer.analysis}
              >
                <RotateCcw size={14} /> Reset
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAnalyze}
                disabled={analyzer.loading || !analyzer.paperText.trim()}
              >
                {analyzer.loading ? (
                  <><RotateCcw size={14} className="spin" /> Analyzing...</>
                ) : (
                  <><Sparkles size={14} /> Analyze Paper</>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="panel results-panel">
          <div className="panel-header">
            <h2>
              <BarChart3 className="icon" size={16} /> Results
            </h2>
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
              analyzer.loading ? (
                <LoadingState />
              ) : analyzer.error ? (
                <div className="error-state">
                  <p>{analyzer.error}</p>
                </div>
              ) : analyzer.analysis ? (
                <AnalysisTab analysis={analyzer.analysis} />
              ) : (
                <EmptyState tab="analysis" />
              )
            )}

            {activeTab === 'rewrite' && (
              <RewriteTab
                rewriter={{
                  ...rewriter,
                  rewrite: handleRewrite,
                }}
                paperText={analyzer.paperText}
              />
            )}

            {activeTab === 'research' && (
              <ResearchTab
                researcher={{
                  ...researcher,
                  research: handleResearch,
                }}
                paperText={analyzer.paperText}
              />
            )}

            {activeTab === 'bibliography' && (
              <BibliographyTab
                bibChecker={{
                  ...bibChecker,
                  checkBibliography: handleBibCheck,
                }}
                paperText={analyzer.paperText}
              />
            )}

            {activeTab === 'logic' && (
              logicChecker.loading ? (
                <LoadingState />
              ) : logicChecker.error ? (
                <div className="error-state">
                  <p>{logicChecker.error}</p>
                </div>
              ) : logicChecker.logicResult ? (
                <LogicAnalysisTab
                  logicChecker={{
                    ...logicChecker,
                    checkLogic: handleLogicCheck,
                  }}
                  paperText={analyzer.paperText}
                />
              ) : (
                <EmptyState tab="logic" />
              )
            )}

            {activeTab === 'logic' && (
              logicChecker.loading ? (
                <LoadingState />
              ) : logicChecker.error ? (
                <div className="error-state">
                  <p>{logicChecker.error}</p>
                </div>
              ) : logicChecker.logicResult ? (
                <LogicAnalysisTab
                  logicChecker={{
                    ...logicChecker,
                    checkLogic: handleLogicCheck,
                  }}
                  paperText={analyzer.paperText}
                />
              ) : (
                <EmptyState tab="logic" />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
