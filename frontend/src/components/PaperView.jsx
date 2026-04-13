import { useRef, useEffect } from 'react';
import { Edit3, Eye } from 'lucide-react';

function mapNormalizedToOriginal(paperText, normalizedPos) {
  let paperPos = 0;
  let normPos = 0;
  while (paperPos < paperText.length && normPos < normalizedPos) {
    if (/\s/.test(paperText[paperPos])) {
      paperPos++;
      continue;
    }
    paperPos++;
    normPos++;
  }
  while (paperPos < paperText.length && /\s/.test(paperText[paperPos])) {
    paperPos++;
  }
  return paperPos <= paperText.length ? paperPos : -1;
}

function findSpanPosition(paperText, issue) {
  if (issue.text_span) {
    const idx = paperText.indexOf(issue.text_span);
    if (idx !== -1) {
      return { start: idx, end: idx + issue.text_span.length };
    }
  }

  if (issue.text_span) {
    const normalizedPaper = paperText.replace(/\s+/g, ' ').trim();
    const normalizedSpan = issue.text_span.replace(/\s+/g, ' ').trim();
    const idx = normalizedPaper.indexOf(normalizedSpan);
    if (idx !== -1) {
      let paperPos = 0;
      let normalizedPos = 0;
      let matchStart = -1;
      let matchEnd = -1;

      while (paperPos < paperText.length && normalizedPos < idx) {
        if (paperText[paperPos] === normalizedPaper[normalizedPos]) {
          normalizedPos++;
        }
        paperPos++;
      }
      matchStart = paperPos;

      const spanEnd = idx + normalizedSpan.length;
      while (paperPos < paperText.length && normalizedPos < spanEnd) {
        if (paperText[paperPos] === normalizedPaper[normalizedPos]) {
          normalizedPos++;
        }
        paperPos++;
      }
      matchEnd = paperPos;

      if (matchStart !== -1 && matchEnd > matchStart) {
        return { start: matchStart, end: matchEnd };
      }
    }
  }

  if (issue.text_span && issue.text_span.length > 40) {
    const head = issue.text_span.substring(0, 30).replace(/\s+/g, ' ');
    const tail = issue.text_span.substring(issue.text_span.length - 30).replace(/\s+/g, ' ');
    const normalizedPaper = paperText.replace(/\s+/g, ' ');

    const headIdx = normalizedPaper.indexOf(head);
    if (headIdx !== -1) {
      const tailIdx = normalizedPaper.indexOf(tail, headIdx);
      if (tailIdx !== -1 && tailIdx > headIdx) {
        let startPos = mapNormalizedToOriginal(paperText, headIdx);
        let endPos = mapNormalizedToOriginal(paperText, tailIdx + tail.length);
        if (startPos !== -1 && endPos > startPos) {
          return { start: startPos, end: endPos };
        }
      }
    }
  }

  if (typeof issue.start_char === 'number' && typeof issue.end_char === 'number'
      && issue.start_char >= 0 && issue.end_char > issue.start_char
      && issue.end_char <= paperText.length) {
    return { start: issue.start_char, end: issue.end_char };
  }

  return null;
}

function buildHighlightedElements(paperText, issues, onIssueClick) {
  if (!issues || issues.length === 0) {
    return [paperText];
  }

  const spans = [];
  for (const issue of issues) {
    const pos = findSpanPosition(paperText, issue);
    if (pos) {
      spans.push({
        start: pos.start,
        end: pos.end,
        issueId: issue.id,
        severity: issue.severity || 'info',
        category: issue.category || 'clarity',
      });
    } else {
      console.warn(`Could not locate issue #${issue.id}: "${issue.text_span?.substring(0, 50)}..."`);
    }
  }

  spans.sort((a, b) => a.start - b.start);

  const severityRank = { error: 3, warning: 2, info: 1 };
  const merged = [];
  for (const span of spans) {
    if (merged.length > 0 && span.start < merged[merged.length - 1].end) {
      const last = merged[merged.length - 1];
      if ((severityRank[span.severity] || 1) > (severityRank[last.severity] || 1)) {
        merged[merged.length - 1] = span;
      }
      if (span.end > last.end) {
        merged[merged.length - 1] = { ...last, end: span.end };
      }
    } else {
      merged.push(span);
    }
  }

  const elements = [];
  let cursor = 0;
  let keyIndex = 0;

  for (const span of merged) {
    if (cursor < span.start) {
      elements.push(
        <span key={`t-${keyIndex++}`}>{paperText.slice(cursor, span.start)}</span>
      );
    }
    const issueId = span.issueId;
    elements.push(
      <span
        key={`h-${keyIndex++}`}
        className={`highlight highlight-${span.severity}`}
        data-issue-id={issueId}
        data-category={span.category}
        onClick={() => onIssueClick(issueId)}
        style={{ cursor: 'pointer' }}
      >
        {paperText.slice(span.start, span.end)}
      </span>
    );
    cursor = span.end;
  }

  if (cursor < paperText.length) {
    elements.push(
      <span key={`t-${keyIndex++}`}>{paperText.slice(cursor)}</span>
    );
  }

  return elements;
}

export default function PaperView({
  paperText,
  onPaperTextChange,
  issues,
  selectedIssueId,
  onIssueClick,
  isAnalyzing,
  viewMode,
  onToggleMode,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!selectedIssueId || viewMode !== 'view') return;
    const container = containerRef.current;
    if (!container) return;
    const highlight = container.querySelector(`[data-issue-id="${selectedIssueId}"]`);
    if (highlight) {
      highlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedIssueId, viewMode]);

  const isViewMode = viewMode === 'view';

  if (!isViewMode) {
    return (
      <textarea
        className="paper-textarea"
        placeholder="Paste your paper here..."
        value={paperText}
        onChange={(e) => onPaperTextChange(e.target.value)}
      />
    );
  }

  const elements = buildHighlightedElements(paperText, issues, onIssueClick);

  return (
    <div className="paper-view-container">
      {!isAnalyzing && (
        <button
          className="mode-toggle"
          title="Edit paper"
          onClick={() => onToggleMode('edit')}
        >
          <Edit3 size={16} />
        </button>
      )}
      {isAnalyzing && (
        <div className="paper-view-overlay">
          <div className="loading-spinner" />
          <p className="loading-text">Analyzing your paper...</p>
        </div>
      )}
      <div ref={containerRef} className="paper-view">
        {elements}
      </div>
      {isViewMode && issues && issues.length > 0 && (
        <div className="highlight-legend">
          <div className="highlight-legend-item">
            <span className="highlight-legend-swatch highlight-info"></span>
            <span>Info</span>
          </div>
          <div className="highlight-legend-item">
            <span className="highlight-legend-swatch highlight-warning"></span>
            <span>Warning</span>
          </div>
          <div className="highlight-legend-item">
            <span className="highlight-legend-swatch highlight-error"></span>
            <span>Error</span>
          </div>
        </div>
      )}
    </div>
  );
}
