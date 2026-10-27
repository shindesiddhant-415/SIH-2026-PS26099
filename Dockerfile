# Multi-stage lightweight Python Dockerfile for National Material Master Framework
FROM python:3.11-slim

# Prevent Python from writing .pyc and buffer output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code and tests
COPY src/ ./src/
COPY tests/ ./tests/
COPY README.md .

# Create non-root user for security
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/api/health || exit 1

# Launch production server with dynamic port support (Render, Railway, Heroku, Cloud Run)
CMD ["sh", "-c", "python -m uvicorn src.web.app:app --host 0.0.0.0 --port ${PORT:-8000}"]
