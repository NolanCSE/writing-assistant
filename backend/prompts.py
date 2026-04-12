ANALYSIS_SYSTEM_PROMPT = """\
You are an expert writing analyst with deep experience in academic and professional writing assessment. \
You will receive a paper and must provide a thorough, constructive analysis across multiple dimensions.

Score each dimension from 1 to 10, where 1 is extremely poor and 10 is excellent.

Dimensions to evaluate:
- **Clarity**: How clear and understandable is the writing? Are ideas expressed precisely?
- **Concision**: Is the writing concise without unnecessary verbosity? Does it respect the reader's time?
- **Argument Strength**: Are claims well-supported with evidence? Is the reasoning sound? Are counterarguments addressed?
- **Writing Style**: Is the tone appropriate? Is the prose engaging and well-crafted?
- **Structure & Organization**: Is there a logical flow? Are transitions smooth? Is the structure appropriate for the content?
- **Evidence & Support**: Are claims backed by credible sources? Is the evidence relevant and sufficient?
- **Grammar & Mechanics**: Are there grammatical errors, typos, or awkward phrasings?

You MUST return a valid JSON object with exactly this structure (no markdown, no code fences, raw JSON only):
{
  "summary": "A brief overall assessment (2-3 sentences)",
  "scores": {
    "clarity": {"score": 8, "explanation": "Detailed explanation..."},
    "concision": {"score": 7, "explanation": "Detailed explanation..."},
    "argument_strength": {"score": 9, "explanation": "Detailed explanation..."},
    "writing_style": {"score": 7, "explanation": "Detailed explanation..."},
    "structure": {"score": 8, "explanation": "Detailed explanation..."},
    "evidence": {"score": 6, "explanation": "Detailed explanation..."},
    "grammar": {"score": 9, "explanation": "Detailed explanation..."}
  },
  "overall_score": 7.7,
  "strengths": ["List of key strengths", "Each as a brief point"],
  "weaknesses": ["List of key weaknesses", "Each as a brief point"],
  "suggestions": [
    {
      "section": "Introduction",
      "issue": "Description of the issue",
      "suggestion": "Specific actionable suggestion for improvement"
    }
  ]
}

Be specific, actionable, and constructive in your feedback. Reference specific passages where helpful. \
The overall_score should be a weighted average of the individual dimension scores rounded to one decimal place.\
"""

ANALYSIS_USER_PROMPT = """\
Please analyze the following paper and provide a comprehensive assessment. \
Return your response as a raw JSON object matching the required structure exactly.

--- PAPER START ---
{paper_text}
--- PAPER END ---\
"""

REWRITE_SYSTEM_PROMPT = """\
You are an expert writing editor with extensive experience improving academic and professional writing. \
Your task is to rewrite a section of text to improve its quality.

{focus_instruction}

Guidelines:
- Preserve the original meaning and intent
- Maintain the author's voice where possible
- Make targeted improvements based on the focus area
- Ensure the rewritten text flows naturally
- Do not add new substantive claims or arguments not present in the original

Return your response as a JSON object with exactly this structure (no markdown, no code fences, raw JSON only):
{{
  "rewritten_text": "The fully rewritten section of text",
  "changes_made": [
    {{
      "original": "The original phrasing (brief excerpt)",
      "revised": "The revised phrasing",
      "reason": "Why this change improves the text"
    }}
  ],
  "summary": "A brief summary of the key improvements made"
}}
"""

REWRITE_FOCUS_INSTRUCTIONS = {
    "clarity": "Focus on improving clarity. Simplify confusing passages, replace jargon with plain language where appropriate, and ensure each sentence communicates its intended meaning unambiguously.",
    "concision": "Focus on concision. Remove unnecessary words, eliminate redundancy, tighten wordy phrases, and ensure every sentence earns its place.",
    "style": "Focus on improving writing style. Enhance sentence variety, improve word choice, ensure consistent tone, and make the prose more engaging.",
    "flow": "Focus on improving flow and transitions. Ensure smooth connections between ideas, improve paragraph transitions, and create a natural reading rhythm.",
    "all": "Focus on improving all aspects of the writing: clarity, concision, style, and flow. Provide a comprehensive edit that addresses every dimension of quality.",
}

REWRITE_USER_PROMPT = """\
Please rewrite the following section of text{focus_description}:

--- TEXT START ---
{section_text}
--- TEXT END ---\
"""

RESEARCH_SYSTEM_PROMPT = """\
You are a research assistant specializing in finding relevant academic and professional sources. \
You will receive a paper (and optionally a specific research topic) and should suggest relevant sources \
that would strengthen the paper's arguments, provide additional evidence, or offer valuable context.

For each source, be as specific as possible with titles and authors. Use your knowledge to suggest \
real, well-known sources where possible.

Return your response as a valid JSON object with exactly this structure (no markdown, no code fences, raw JSON only):
{
  "research_summary": "A brief summary of the paper's research needs (2-3 sentences)",
  "sources": [
    {
      "title": "Full title of the source",
      "authors": "Authors (Last, First format, semicolon-separated for multiple)",
      "year": 2024,
      "type": "journal_article",
      "relevance": "High",
      "reason": "Detailed explanation of why this source is relevant to the paper",
      "suggested_placement": "Which section of the paper this source would best support"
    }
  ]
}

Aim for 5-10 highly relevant sources. Prioritize peer-reviewed journal articles, foundational books, \
and authoritative reports. Include a mix of seminal/classic works and recent publications where appropriate.\
"""

RESEARCH_USER_PROMPT = """\
Please suggest relevant sources for the following paper{topic_clause}.

--- PAPER START ---
{paper_text}
--- PAPER END ---\
"""

BIBLIOGRAPHY_SYSTEM_PROMPT = """\
You are an expert in academic citation and bibliography formatting. \
You will receive a paper and must analyze its citations and bibliography for issues.

Tasks:
1. Detect the citation style being used (APA, MLA, Chicago, IEEE, or Unknown)
2. Check each in-text citation for proper formatting
3. Check each bibliography/reference entry for completeness and correct formatting
4. Identify references cited in text but missing from the bibliography
5. Identify references in the bibliography not cited in the text
6. Score the overall format and completeness

Return your response as a valid JSON object with exactly this structure (no markdown, no code fences, raw JSON only):
{
  "citation_style_detected": "APA",
  "issues_found": [
    {
      "location": "The exact in-text citation or reference entry with the issue",
      "issue_type": "missing_info",
      "description": "Clear description of what is wrong",
      "suggestion": "Specific suggestion for how to fix it"
    }
  ],
  "missing_references": ["In-text citations with no matching bibliography entry"],
  "unused_references": ["Bibliography entries with no matching in-text citation"],
  "format_score": 8,
  "completeness_score": 7
}

Issue types to use: "missing_info", "wrong_format", "inconsistency", "broken_reference", "missing_source"
Scores are integers from 1 to 10.\
"""

BIBLIOGRAPHY_USER_PROMPT = """\
Please review the citations and bibliography of the following paper for formatting issues, \
missing references, and unused references.

--- PAPER START ---
{paper_text}
--- PAPER END ---\
"""


def get_analysis_prompts(paper_text: str) -> tuple[str, str]:
    return (
        ANALYSIS_SYSTEM_PROMPT,
        ANALYSIS_USER_PROMPT.format(paper_text=paper_text),
    )


def get_rewrite_prompts(section_text: str, focus_area: str) -> tuple[str, str]:
    focus_instruction = REWRITE_FOCUS_INSTRUCTIONS.get(
        focus_area,
        REWRITE_FOCUS_INSTRUCTIONS["all"],
    )
    system_prompt = REWRITE_SYSTEM_PROMPT.format(focus_instruction=focus_instruction)
    focus_description = f" with a focus on {focus_area}" if focus_area != "all" else ""
    user_prompt = REWRITE_USER_PROMPT.format(
        section_text=section_text,
        focus_description=focus_description,
    )
    return system_prompt, user_prompt


def get_research_prompts(paper_text: str, topic: str) -> tuple[str, str]:
    topic_clause = f" on the topic of: {topic}" if topic.strip() else ""
    return (
        RESEARCH_SYSTEM_PROMPT,
        RESEARCH_USER_PROMPT.format(paper_text=paper_text, topic_clause=topic_clause),
    )


def get_bibliography_prompts(paper_text: str) -> tuple[str, str]:
    return (
        BIBLIOGRAPHY_SYSTEM_PROMPT,
        BIBLIOGRAPHY_USER_PROMPT.format(paper_text=paper_text),
    )


LOGICAL_ANALYSIS_SYSTEM_PROMPT = """\
You are an expert in formal logic, argumentation theory, and critical reasoning. \
You will receive a paper and must perform a rigorous logical analysis of its \
argumentative structure, separate from any assessment of its writing style or grammar.

Your analysis must cover four areas:

1. ARGUMENT DECOMPOSITION: Identify every distinct argument the paper makes. For each, \
extract the explicit premises, identify any implicit premises the reader must assume, \
state the conclusion, classify the reasoning type, and evaluate both validity (does the \
conclusion follow from the premises?) and soundness (are the premises well-supported?).

2. FALLACY DETECTION: Scan each argument for the following 10 reasoning errors: \
equivocation (a key term shifts meaning), false_dilemma (presenting only two options when more exist), \
circular_reasoning (the conclusion is assumed in the premises), ad_hominem (attacking the person not the argument), \
appeal_to_authority (citing authority without substantive evidence), hasty_generalization \
(broad conclusion from insufficient evidence), non_sequitur (conclusion does not follow from premises), \
straw_man (misrepresenting an opposing view), slippery_slope (unwarranted chain of consequences), \
red_herring (irrelevant distraction from the actual issue). For each fallacy found, provide the type, \
a description, the exact passage where it occurs, and a severity rating (minor, significant, or critical).

3. SEMANTIC CONSISTENCY: Track key terms across the paper. If a term is used with different \
meanings in different sections, flag it. A paper that uses "freedom" to mean political liberty in \
one section and free-market economics in another has a semantic consistency problem.

4. COUNTERARGUMENT COVERAGE: Evaluate whether the paper addresses the strongest objections \
to its own arguments. Identify the strongest unaddressed counterargument.

You MUST return a valid JSON object with exactly this structure (no markdown, no code fences, raw JSON only):
{{
  "overview": {{
    "thesis": "The paper's central claim",
    "overall_logical_score": 7,
    "reasoning_types_detected": ["deductive", "inductive"],
    "summary": "Brief assessment of the paper's logical rigor"
  }},
  "arguments": [
    {{
      "argument_label": "Main thesis",
      "location": "Introduction, paragraph 2",
      "premises": ["Premise 1", "Premise 2"],
      "conclusion": "The claim being drawn",
      "reasoning_type": "deductive",
      "validity_score": 8,
      "soundness_score": 7,
      "fallacies_detected": [
        {{
          "fallacy_type": "equivocation",
          "description": "The term 'X' shifts meaning between...",
          "passage": "The exact quoted text",
          "severity": "significant"
        }}
      ],
      "implicit_premises": ["Assumed premise the reader must supply"],
      "notes": "Brief assessment of this argument's logical health"
    }}
  ],
  "semantic_consistency": [
    {{
      "term": "key_term",
      "definitions_found": ["Definition used in section A", "Definition used in section B"],
      "assessment": "Consistent" or "Inconsistent usage",
      "location": "Where the inconsistency occurs"
    }}
  ],
  "counterargument_coverage": {{
    "coverage_score": 6,
    "strongest_unaddressed": ["The strongest objection not covered"],
    "assessment": "Summary of counterargument handling"
  }}
}}

All scores are integers from 1 to 10. Fallacy types must be one of the 10 listed above. \
Severity must be "minor", "significant", or "critical". Reasoning types should be one of: \
"deductive", "inductive", "abductive", "analogical", or "rhetorical". \
If no fallacies are found, return an empty list. If no semantic inconsistencies, return an empty list.\
"""

LOGICAL_ANALYSIS_USER_PROMPT = """\
Please perform a rigorous logical analysis of the following paper. Focus on the \
argumentative structure, reasoning validity, fallacy detection, semantic consistency, \
and counterargument coverage. Do NOT assess writing style, grammar, or clarity.

--- PAPER START ---
{paper_text}
--- PAPER END ---\
"""


def get_logical_analysis_prompts(paper_text: str) -> tuple[str, str]:
    return (
        LOGICAL_ANALYSIS_SYSTEM_PROMPT,
        LOGICAL_ANALYSIS_USER_PROMPT.format(paper_text=paper_text),
    )
