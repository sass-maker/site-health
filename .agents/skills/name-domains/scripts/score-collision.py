#!/usr/bin/env python3
"""Collision scan vs competitor corpus (heuristic, not trademark)."""
from __future__ import annotations

import argparse
import re
import sys


def norm(s: str) -> str:
    s = s.lower().strip()
    s = re.sub(r"^https?://", "", s)
    s = re.sub(r"^www\.", "", s)
    s = re.sub(r"\.[a-z]{2,}$", "", s)
    return re.sub(r"[^a-z0-9]", "", s)


def levenshtein(a: str, b: str) -> int:
    if not a:
        return len(b)
    if not b:
        return len(a)
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1]


def similarity(a: str, b: str) -> float:
    if not a or not b:
        return 0.0
    if a == b:
        return 1.0
    d = levenshtein(a, b)
    return 1 - d / max(len(a), len(b))


def collision_level(sld: str, corpus: list[str]) -> tuple[str, str, float]:
    t = norm(sld)
    best_name = ""
    best_sim = 0.0
    substring = False

    for comp in corpus:
        c = norm(comp)
        if not c:
            continue
        if t == c:
            return "high", c, 1.0
        if t in c or c in t:
            substring = True
        sim = similarity(t, c)
        if sim > best_sim:
            best_sim = sim
            best_name = c

    if best_sim >= 0.82 or substring:
        return "high", best_name, best_sim
    if best_sim >= 0.60:
        return "medium", best_name, best_sim
    return "low", best_name, best_sim


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("slds", nargs="*")
    p.add_argument("--competitors", default="", help="comma-separated")
    p.add_argument("--seeds-file", default="", help="path to seed list")
    p.add_argument("--header", action="store_true")
    args = p.parse_args()

    corpus: list[str] = []
    if args.competitors:
        corpus.extend(args.competitors.split(","))
    if args.seeds_file:
        with open(args.seeds_file, encoding="utf-8") as f:
            corpus.extend(ln.strip() for ln in f if ln.strip() and not ln.startswith("#"))

    slds = args.slds
    if not slds and not sys.stdin.isatty():
        slds = [ln.strip() for ln in sys.stdin if ln.strip()]

    if args.header:
        print("sld\tcollision\tclosest\tsimilarity")

    for raw in slds:
        sld = raw.split()[0].lower().split(".")[0]
        level, closest, sim = collision_level(sld, corpus)
        print(f"{sld}\t{level}\t{closest}\t{sim:.2f}")


if __name__ == "__main__":
    main()