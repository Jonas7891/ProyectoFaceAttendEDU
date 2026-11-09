"""Hexagonal layer rules, checked on the imports of the sources (no extra dependency).

The domain depends on nothing outward, the application not on infrastructure, and the web
adapters never reach persistence. ALLOWED lists the known exceptions, so a new one fails.
"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
IMPORT = re.compile(r"^\s*(?:from|import)\s+([\w.]+)", re.MULTILINE)

# "file -> module" pairs accepted on purpose.
ALLOWED: set[str] = set()


def _violations(layer: str, forbidden: str) -> list[str]:
    found = []
    for path in sorted((ROOT / layer).rglob("*.py")):
        name = path.relative_to(ROOT).as_posix()
        for module in IMPORT.findall(path.read_text(encoding="utf-8-sig")):
            pair = f"{name} -> {module}"
            if re.match(forbidden, module) and pair not in ALLOWED:
                found.append(pair)
    return found


def test_the_domain_depends_on_no_other_layer():
    assert _violations("domain", r"(application|infrastructure)(\.|$)") == []


def test_the_application_does_not_depend_on_infrastructure():
    assert _violations("application", r"infrastructure(\.|$)") == []


def test_the_web_adapters_never_reach_persistence():
    assert _violations("infrastructure/web", r"infrastructure\.persistence(\.|$)") == []


def test_the_rule_sees_imports():
    # Guard against a rule that passes because it reads nothing.
    assert _violations("infrastructure/web", r"application(\.|$)")
