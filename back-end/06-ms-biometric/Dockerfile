FROM python:3.12-slim AS builder
WORKDIR /app
# face-recognition (dlib) and opencv-python-headless compile native extensions.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential cmake pkg-config libopenblas-dev liblapack-dev \
    && rm -rf /var/lib/apt/lists/*
RUN pip install --no-cache-dir poetry==1.8.3 && poetry config virtualenvs.in-project true
COPY pyproject.toml poetry.lock* ./
RUN poetry install --no-root --only main --no-interaction --no-ansi

FROM python:3.12-slim
RUN apt-get update && apt-get install -y --no-install-recommends wget \
    && rm -rf /var/lib/apt/lists/* \
    && addgroup --system app && adduser --system --ingroup app app
WORKDIR /app
COPY --from=builder /app/.venv ./.venv
COPY . .
RUN chown -R app:app /app
ENV PATH="/app/.venv/bin:$PATH"
USER app
EXPOSE 8086
CMD ["uvicorn","main:app","--host","0.0.0.0","--port","8086"]
