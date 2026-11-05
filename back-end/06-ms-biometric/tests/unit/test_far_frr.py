"""FAR/FRR math used to fill docs/EVALUACION_IMPACTO_BIOMETRIA.md §6."""
from __future__ import annotations

import pytest

from domain.far_frr import Sample, measure, sweep, verdict


def enc(x: float) -> list[float]:
    """A 2-d encoding is enough: distance is |x - y| on the first axis."""
    return [x, 0.0]


def test_counts_genuine_and_impostor_attempts_and_errors():
    samples = [
        Sample("ana", "A", enc(0.0)), Sample("ana", "A", enc(0.2)), Sample("ana", "A", enc(0.9)),
        Sample("luis", "B", enc(0.4)), Sample("luis", "B", enc(0.45)),
    ]
    result = measure(samples, threshold=0.5)["*"]
    # ana: 3 genuine pairs (0.2, 0.9, 0.7) -> 2 rejected; luis: 1 genuine pair (0.05) -> accepted.
    assert (result.genuine_attempts, result.false_rejects) == (4, 2)
    assert result.frr == pytest.approx(0.5)
    # 6 impostor pairs (0.4, 0.45, 0.2, 0.25, 0.5, 0.45): every distance is <= 0.5, so all are accepted.
    assert result.impostor_attempts == 6
    assert (result.false_accepts, result.far) == (6, 1.0)


def test_threshold_is_inclusive_like_the_matcher():
    samples = [Sample("a", "G", enc(0.0)), Sample("b", "G", enc(0.5))]
    assert measure(samples, 0.5)["*"].false_accepts == 1
    assert measure(samples, 0.49)["*"].false_accepts == 0


def test_groups_are_reported_separately():
    samples = [
        Sample("ana", "A", enc(0.0)), Sample("ana", "A", enc(0.9)),
        Sample("luis", "B", enc(2.0)), Sample("luis", "B", enc(2.1)),
    ]
    results = measure(samples, 0.5)
    assert results["A"].frr == 1.0 and results["B"].frr == 0.0
    assert results["A"].impostor_attempts == results["B"].impostor_attempts == 4


def test_sweep_trades_far_for_frr():
    samples = [
        Sample("ana", "A", enc(0.0)), Sample("ana", "A", enc(0.3)),
        Sample("luis", "B", enc(0.4)), Sample("luis", "B", enc(0.7)),
    ]
    low, high = sweep(samples, [0.2, 0.8])
    assert low[1].frr >= high[1].frr
    assert low[1].far <= high[1].far


def test_verdict_passes_a_clean_run_and_reports_each_failure():
    people = [f"p{i}" for i in range(4)]
    clean = [Sample(p, "A" if i % 2 else "B", enc(i * 10.0 + d)) for i, p in enumerate(people) for d in (0.0, 0.1)]
    assert verdict(measure(clean, 0.5)) == []

    bad = clean + [Sample("p0", "B", enc(0.0 + 5.0))]  # one far-away genuine image -> false rejects
    problems = verdict(measure(bad, 0.5))
    assert any(p.startswith("FRR") for p in problems)


def test_verdict_demands_data():
    assert verdict(measure([Sample("solo", "A", enc(0.0))], 0.5)) == [
        "not enough data: need genuine and impostor attempts"
    ]
