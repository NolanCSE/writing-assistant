import {
  BookOpen, Search, RotateCcw, X, ChevronRight
} from 'lucide-react';

function getRelevanceBadge(relevance) {
  const r = (relevance || '').toLowerCase();
  if (r === 'high') return 'badge-high';
  if (r === 'medium') return 'badge-medium';
  return 'badge-low';
}

export default function ResearchTab({ researcher, paperText }) {
  return (
    <div>
      <div className="input-group">
        <label>
          <Search size={14} className="research-input-icon" />
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
        <div className="research-results">
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
            </>
          )}
        </div>
      )}
    </div>
  );
}
