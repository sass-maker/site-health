#!/usr/bin/env python3
"""Mechanical taste score for domain SLDs. Start 50, apply fixed bands."""
from __future__ import annotations

import argparse
import re
import sys

VOWELS = set("aeiou")


def score_sld(sld: str, style: str = "", vibe: str = "", idea: str = "") -> tuple[int, list[str]]:
    s = sld.lower().strip()
    notes: list[str] = []
    total = 50

    n = len(s)
    if 5 <= n <= 10:
        total += 15
        notes.append("length_sweet_spot+15")
    elif n in (4, 11, 12):
        total += 5
        notes.append("length_ok+5")
    elif n > 12:
        total -= 10
        notes.append("length_long-10")

    if re.search(r"[^aeiou]{4,}", s):
        total -= 12
        notes.append("consonant_cluster-12")
    if re.search(r"(.)\1{2,}", s):
        total -= 8
        notes.append("triple_repeat-8")
    if "-" in s or any(c.isdigit() for c in s):
        total -= 8
        notes.append("hyphen_digit-8")

    vowel_ratio = sum(1 for c in s if c in VOWELS) / max(len(s), 1)
    if 0.25 <= vowel_ratio <= 0.55:
        total += 10
        notes.append("pronounceable+10")

    cues = [w for w in re.split(r"[\s,/+-]+", f"{vibe} {idea}".lower()) if len(w) >= 4]
    hits = sum(1 for w in cues if w[:4] in s)
    fit = min(15, hits * 5)
    if fit:
        total += fit
        notes.append(f"idea_vibe_fit+{fit}")

    premium_styles = {"abstract", "metaphor", "portmanteau"}
    classy_vibes = ("premium", "classy", "minimal", "warm", "trust")
    if style in premium_styles and any(v in vibe.lower() for v in classy_vibes):
        total += 5
        notes.append("style_vibe_match+5")

    return max(0, min(100, total)), notes


def main() -> None:
    p = argparse.ArgumentParser(description="Score domain SLD taste 0-100")
    p.add_argument("slds", nargs="*", help="SLDs to score")
    p.add_argument("--style", default="", help="naming style tag")
    p.add_argument("--vibe", default="", help="vibe brief")
    p.add_argument("--idea", default="", help="idea brief")
    p.add_argument("--header", action="store_true")
    args = p.parse_args()

    slds = args.slds
    if not slds and not sys.stdin.isatty():
        slds = [ln.strip() for ln in sys.stdin if ln.strip() and not ln.startswith("#")]

    if args.header:
        print("sld\tscore\tnotes")

    rows = []
    for raw in slds:
        sld = raw.split()[0].lower().split(".")[0]
        sc, notes = score_sld(sld, args.style, args.vibe, args.idea)
        rows.append((sc, sld, notes))

    for sc, sld, notes in sorted(rows, reverse=True):
        print(f"{sld}\t{sc}\t{','.join(notes)}")


if __name__ == "__main__":
    main()