FROM python:3.12-slim
RUN apt-get update && apt-get install -y wget curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY pyproject.toml poetry.lock* ./
RUN pip install poetry && poetry install --no-root
COPY . .
EXPOSE 8086
CMD ["poetry","run","uvicorn","main:app","--host","0.0.0.0","--port","8086"]
