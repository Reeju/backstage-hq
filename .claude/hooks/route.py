#!/usr/bin/env python3
"""UserPromptSubmit hook: classify the prompt and inject a one-line model-tier hint.

Claude Code adds whatever this prints to the prompt's context. It stays silent when
unsure, so it costs nothing on prompts it cannot classify. Every decision is appended
to .claude/router.log (JSON lines) so the rules can be tuned from real usage.
"""
import json
import os
import re
import sys
from datetime import datetime, timezone

# Checked in order; first tier with a matching rule wins. Tier A rules are listed first
# because a prompt mentioning both "design" and "button" should get the stronger model.
RULES = [
    ("A", "product-strategist", r"\b(brainstorm|use ?cases?|personas?|prd|requirements?|user (stories|journeys?)|roadmap|prioriti[sz]e|scope)\b"),
    ("A", "architect", r"\b(architect\w*|system design|data ?model|schema design|erd|tech(nology)? stack|adr|trade-?offs?|scal(e|ability)|multi-?tenan\w*|rbac|permissions? model|auth(entication|orization)? (design|flow)|payouts? (flow|design)|plan (the )?(next )?iteration|root cause|still (failing|broken)|keeps? failing)\b"),
    ("A", "reviewer", r"\b(review|audit|security|vulnerab\w*|pen ?test|compliance|gdpr|pii)\b"),
    ("B", "builder", r"\b(implement|build|code|fix|add|create|wire|refactor|migrat\w*|endpoint|component|page|screen|form|api)\b"),
    ("B", "ux-designer", r"\b(mock ?ups?|wireframes?|ui|ux|layout|design system)\b"),
    ("B", "test-writer", r"\b(tests?|coverage|e2e|unit test)\b"),
    ("C", "scout", r"\b(where is|find|search|which files?|look up|summari[sz]e|explain (this|the) (file|code|log)|what does .* do)\b"),
    ("C", "doc-writer", r"\b(readme|changelog|release notes|docstring|comments?|typo|rename|format(ting)?)\b"),
]

TIER_MODEL = {"A": "Opus", "B": "Sonnet", "C": "Haiku"}


def classify(prompt):
    text = prompt.lower()
    for tier, agent, pattern in RULES:
        if re.search(pattern, text):
            return tier, agent
    return None, None


def main():
    try:
        event = json.load(sys.stdin)
    except ValueError:
        return
    prompt = (event.get("prompt") or "").strip()
    # Slash commands already name their subagent; very short replies ("yes", "go") continue
    # the current task and should not be re-routed.
    if not prompt or prompt.startswith("/") or len(prompt.split()) < 4:
        return

    tier, agent = classify(prompt)

    project = os.environ.get("CLAUDE_PROJECT_DIR") or event.get("cwd") or "."
    try:
        with open(os.path.join(project, ".claude", "router.log"), "a") as log:
            log.write(json.dumps({
                "ts": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                "tier": tier,
                "agent": agent,
                "prompt": prompt[:200],
            }) + "\n")
    except OSError:
        pass

    if tier:
        print(f"[router] Suggested tier {tier} ({TIER_MODEL[tier]}): delegate to the `{agent}` "
              f"subagent unless the task clearly needs a different tier (see CLAUDE.md).")


if __name__ == "__main__":
    main()
