"""Measure FAR/FRR of the face matcher on real images (docs/EVALUACION_IMPACTO_BIOMETRIA.md §6).

Layout of the dataset (collected with the participants' written consent; never commit it):

    <dataset>/<group>/<person>/<image>.jpg|png

`group` is whatever the evaluation compares (skin tone, age band, gender, lighting…). Use at least 30
people and several images each, taken at different times and conditions. Images are encoded with the
service's own `face_encoding`, so the result is what the matcher would do in production.

    docker cp /secure/dataset faceattend-ms-biometric:/tmp/dataset
    docker exec faceattend-ms-biometric python scripts/measure_far_frr.py /tmp/dataset --threshold 0.5 > resultado.md
    docker exec faceattend-ms-biometric rm -rf /tmp/dataset      # the images are biometric data: do not leave them

The output is Markdown ready to paste into EIB §6; the exit code is 1 when the acceptance criterion
fails (FAR <= 0.1 %, FRR <= 5 %, FRR gap between groups <= 2 points).
"""
from __future__ import annotations

import argparse
import os
import sys
from datetime import date

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from domain.far_frr import MAX_FAR, MAX_FRR, Rates, Sample, measure, sweep, verdict  # noqa: E402

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}


def load_samples(root: str) -> tuple[list[Sample], list[str]]:
    import cv2  # imported here so --help and the tests do not need the dlib stack

    from domain.face_encoding import face_encoding

    samples: list[Sample] = []
    skipped: list[str] = []
    for group in sorted(os.listdir(root)):
        for person in sorted(os.listdir(os.path.join(root, group))):
            folder = os.path.join(root, group, person)
            for name in sorted(os.listdir(folder)):
                if os.path.splitext(name)[1].lower() not in IMAGE_EXTENSIONS:
                    continue
                image = cv2.imread(os.path.join(folder, name))
                encoding = face_encoding(cv2.cvtColor(image, cv2.COLOR_BGR2RGB)) if image is not None else None
                if encoding is None:
                    skipped.append(f"{group}/{person}/{name}")  # no single face found: counts as not enrolled
                    continue
                samples.append(Sample(person=f"{group}/{person}", group=group, encoding=encoding))
    return samples, skipped


def pct(value: float | None, digits: int = 2) -> str:
    return "n/d" if value is None else f"{value * 100:.{digits}f} %"


def row(label: str, r: Rates) -> str:
    return (f"| {label} | {pct(r.far, 3)} ({r.false_accepts}/{r.impostor_attempts}) "
            f"| {pct(r.frr)} ({r.false_rejects}/{r.genuine_attempts}) |")


def report(samples: list[Sample], skipped: list[str], threshold: float) -> tuple[str, list[str]]:
    results = measure(samples, threshold)
    problems = verdict(results)
    people = len({s.person for s in samples})
    lines = [
        f"### Medición del {date.today().isoformat()}", "",
        f"- Personas: {people}; imágenes usadas: {len(samples)}; descartadas sin rostro único: {len(skipped)}",
        f"- Umbral (distancia máxima aceptada): {threshold}",
        f"- Criterio: FAR ≤ {MAX_FAR * 100:.1f} %, FRR ≤ {MAX_FRR * 100:.0f} %, brecha de FRR entre grupos ≤ 2 puntos", "",
        "| Grupo | FAR (falsas aceptaciones) | FRR (falsos rechazos) |", "|---|---|---|",
        row("**Global**", results["*"]),
        *(row(group, r) for group, r in results.items() if group != "*"), "",
        "Curva (global):", "", "| Umbral | FAR | FRR |", "|---|---|---|",
        *(f"| {t:.2f} | {pct(r.far, 3)} | {pct(r.frr)} |" for t, r in sweep(samples, [x / 100 for x in range(30, 66, 5)])), "",
        "**Resultado: " + ("CUMPLE el criterio." if not problems else "NO CUMPLE el criterio:**") + ("**" if not problems else ""),
        *(f"- {p}" for p in problems),
    ]
    return "\n".join(lines), problems


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("dataset", help="folder <group>/<person>/<image>")
    parser.add_argument("--threshold", type=float, default=0.5, help="max euclidean distance accepted (default 0.5)")
    args = parser.parse_args()
    samples, skipped = load_samples(args.dataset)
    text, problems = report(samples, skipped, args.threshold)
    print(text)
    for name in skipped:
        print(f"skipped (no single face): {name}", file=sys.stderr)
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
