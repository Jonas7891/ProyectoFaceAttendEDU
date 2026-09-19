FROM python:3.12-slim
WORKDIR /app
COPY pyproject.toml poetry.lock* ./
RUN pip install poetry && poetry install --no-root
COPY . .
EXPOSE 8086
CMD ["poetry","run","uvicorn","main:app","--host","0.0.0.0","--port","8086"]
