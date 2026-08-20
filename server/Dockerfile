FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1

WORKDIR /app

# FFmpeg + build dependencies required by PyAV and other native packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    pkg-config \
    gcc \
    g++ \
    make \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --upgrade pip \
    && pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "uvicorn api.index:app --host 0.0.0.0 --port ${PORT:-8000}"]