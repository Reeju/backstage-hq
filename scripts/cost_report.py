#!/usr/bin/env python3
"""Estimate Claude Code token spend for this project, by model and by main vs subagent.

Reads the session transcripts Claude Code keeps in ~/.claude/projects/<project>/ and prices
each API response from its recorded usage. Also shows what the same tokens would have cost
on a single model, which is the number to watch when tuning the routing rules.

Usage:  python3 scripts/cost_report.py [--days N] [--project PATH]
"""
import argparse
import glob
import json
import os
import re
from collections import defaultdict
from datetime import datetime, timedelta, timezone

# USD per million tokens. Input/output/cache-read are list prices; cache writes use the
# standard multipliers (1.25x input for 5-minute entries, 2x for 1-hour). Haiku prices
# apply to prompts up to 100K tokens. Edit here if pricing changes.
PRICES = {
    "opus":   {"in": 4.00, "out": 20.00, "cache_read": 0.20},
    "sonnet": {"in": 2.00, "out": 10.00, "cache_read": 0.20},
    "haiku":  {"in": 0.10, "out": 0.50,  "cache_read": 0.01},
}
CACHE_WRITE_5M = 1.25
CACHE_WRITE_1H = 2.0


def family(model):
    for name in PRICES:
        if name in (model or ""):
            return name
    return None


def cost(usage, fam):
    p = PRICES[fam]
    creation = usage.get("cache_creation") or {}
    write_1h = creation.get("ephemeral_1h_input_tokens", 0)
    write_5m = creation.get("ephemeral_5m_input_tokens",
                            usage.get("cache_creation_input_tokens", 0) - write_1h)
    return (usage.get("input_tokens", 0) * p["in"]
            + write_5m * p["in"] * CACHE_WRITE_5M
            + write_1h * p["in"] * CACHE_WRITE_1H
            + usage.get("cache_read_input_tokens", 0) * p["cache_read"]
            + usage.get("output_tokens", 0) * p["out"]) / 1_000_000


def transcript_dir(project):
    slug = re.sub(r"[^A-Za-z0-9]", "-", os.path.abspath(project))
    return os.path.expanduser(os.path.join("~/.claude/projects", slug))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, help="only count the last N days")
    ap.add_argument("--project", default=os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd()))
    args = ap.parse_args()

    root = transcript_dir(args.project)
    files = glob.glob(os.path.join(root, "**", "*.jsonl"), recursive=True)
    if not files:
        print(f"No transcripts found in {root}")
        return
    since = datetime.now(timezone.utc) - timedelta(days=args.days) if args.days else None

    seen = set()
    rows = defaultdict(lambda: {"calls": 0, "in": 0, "cache": 0, "out": 0, "usd": 0.0})
    usages = []  # (usage, family) for the single-model comparison

    for path in files:
        # Subagent transcripts live in their own files; older versions mark them isSidechain.
        is_sub_file = "subagent" in path or os.path.basename(path).startswith("agent-")
        with open(path, errors="replace") as fh:
            for line in fh:
                if '"usage"' not in line:
                    continue
                try:
                    rec = json.loads(line)
                except ValueError:
                    continue
                msg = rec.get("message") or {}
                usage, fam = msg.get("usage"), family(msg.get("model"))
                if rec.get("type") != "assistant" or not usage or not fam:
                    continue
                # One response is written as several lines (one per content block).
                key = msg.get("id") or rec.get("requestId") or rec.get("uuid")
                if key in seen:
                    continue
                seen.add(key)
                if since:
                    try:
                        ts = datetime.fromisoformat(rec["timestamp"].replace("Z", "+00:00"))
                    except (KeyError, ValueError):
                        continue
                    if ts < since:
                        continue
                where = "subagent" if is_sub_file or rec.get("isSidechain") else "main"
                row = rows[(fam, where)]
                row["calls"] += 1
                row["in"] += usage.get("input_tokens", 0) + usage.get("cache_creation_input_tokens", 0)
                row["cache"] += usage.get("cache_read_input_tokens", 0)
                row["out"] += usage.get("output_tokens", 0)
                row["usd"] += cost(usage, fam)
                usages.append((usage, fam))

    if not rows:
        print("No priced responses in range.")
        return

    total = sum(r["usd"] for r in rows.values())
    print(f"Transcripts: {root}" + (f"  (last {args.days} days)" if args.days else ""))
    print()
    print(f"{'model':<8} {'where':<9} {'calls':>6} {'input+write':>12} {'cache read':>12} {'output':>10} {'USD':>9} {'share':>6}")
    for (fam, where), r in sorted(rows.items(), key=lambda kv: -kv[1]["usd"]):
        print(f"{fam:<8} {where:<9} {r['calls']:>6} {r['in']:>12,} {r['cache']:>12,} {r['out']:>10,} "
              f"{r['usd']:>9.2f} {r['usd'] / total:>6.0%}")
    print(f"{'total':<8} {'':<9} {sum(r['calls'] for r in rows.values()):>6} {'':>12} {'':>12} {'':>10} {total:>9.2f}")
    print()
    for fam in ("opus", "sonnet"):
        alt = sum(cost(u, fam) for u, _ in usages)
        sign = "+" if alt >= total else "-"
        print(f"Same tokens all on {fam:<6}: ${alt:,.2f}  ({sign}${abs(alt - total):,.2f} vs actual)")
    print()
    print("Estimate only: list prices, standard cache-write multipliers, subscription plans are billed differently.")


if __name__ == "__main__":
    main()
