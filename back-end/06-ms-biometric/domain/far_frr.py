"""FAR/FRR measurement over labelled face encodings (pure stdlib).

Implements the protocol of docs/EVALUACION_IMPACTO_BIOMETRIA.md §6: every pair of images of the same
person is a genuine attempt (rejected = false reject), every pair of images of different people is an
impostor attempt (accepted = false accept). A pair is accepted when the euclidean distance is <= the
threshold, the same rule the matcher applies (`domain.similarity.euclidean`).
"""
from dataclasses import dataclass
from itertools import combinations

from domain.similarity import euclidean

# Acceptance criterion adopted on 2026-11-04 (EIB §6, item 6).
MAX_FAR = 0.001
MAX_FRR = 0.05
MAX_GROUP_FRR_GAP = 0.02


@dataclass(frozen=True)
class Sample:
    person: str
    group: str
    encoding: list[float]


@dataclass(frozen=True)
class Rates:
    far: float | None
    frr: float | None
    impostor_attempts: int
    genuine_attempts: int
    false_accepts: int
    false_rejects: int


def _rates(genuine: list[float], impostor: list[float], threshold: float) -> Rates:
    false_rejects = sum(1 for d in genuine if d > threshold)
    false_accepts = sum(1 for d in impostor if d <= threshold)
    return Rates(
        far=false_accepts / len(impostor) if impostor else None,
        frr=false_rejects / len(genuine) if genuine else None,
        impostor_attempts=len(impostor), genuine_attempts=len(genuine),
        false_accepts=false_accepts, false_rejects=false_rejects,
    )


def distances(samples: list[Sample]) -> tuple[dict[str, list[float]], dict[str, list[float]]]:
    """Genuine and impostor distances keyed by group ('*' holds all of them).

    A genuine pair belongs to the group of the person. An impostor pair counts for the group of
    each of its two members, so a group's FAR is the chance that someone is accepted as a member.
    """
    genuine: dict[str, list[float]] = {"*": []}
    impostor: dict[str, list[float]] = {"*": []}
    for a, b in combinations(samples, 2):
        d = euclidean(a.encoding, b.encoding)
        if a.person == b.person:
            genuine["*"].append(d)
            genuine.setdefault(a.group, []).append(d)
        else:
            impostor["*"].append(d)
            for group in {a.group, b.group}:
                impostor.setdefault(group, []).append(d)
    return genuine, impostor


def measure(samples: list[Sample], threshold: float) -> dict[str, Rates]:
    genuine, impostor = distances(samples)
    groups = set(genuine) | set(impostor)
    return {g: _rates(genuine.get(g, []), impostor.get(g, []), threshold) for g in sorted(groups)}


def sweep(samples: list[Sample], thresholds: list[float]) -> list[tuple[float, Rates]]:
    """Global FAR/FRR for each threshold, to choose the operating point (protocol step 4)."""
    genuine, impostor = distances(samples)
    return [(t, _rates(genuine["*"], impostor["*"], t)) for t in thresholds]


def verdict(results: dict[str, Rates]) -> list[str]:
    """Criterion failures (empty list = meets the criterion). Missing data counts as a failure."""
    problems: list[str] = []
    overall = results.get("*")
    if overall is None or overall.far is None or overall.frr is None:
        return ["not enough data: need genuine and impostor attempts"]
    if overall.far > MAX_FAR:
        problems.append(f"FAR {overall.far:.4%} exceeds {MAX_FAR:.2%}")
    if overall.frr > MAX_FRR:
        problems.append(f"FRR {overall.frr:.2%} exceeds {MAX_FRR:.0%}")
    frrs = {g: r.frr for g, r in results.items() if g != "*" and r.frr is not None}
    for g, r in results.items():
        if g == "*":
            continue
        if r.far is not None and r.far > MAX_FAR:
            problems.append(f"group {g}: FAR {r.far:.4%} exceeds {MAX_FAR:.2%}")
        if r.frr is not None and r.frr > MAX_FRR:
            problems.append(f"group {g}: FRR {r.frr:.2%} exceeds {MAX_FRR:.0%}")
    if len(frrs) > 1 and max(frrs.values()) - min(frrs.values()) > MAX_GROUP_FRR_GAP:
        problems.append(f"FRR gap between groups {max(frrs.values()) - min(frrs.values()):.2%} exceeds {MAX_GROUP_FRR_GAP:.0%}")
    return problems
