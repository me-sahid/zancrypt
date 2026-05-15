FROM python:3.12-slim

WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends gcc && rm -rf /var/lib/apt/lists/*
COPY requirements/base.txt ./requirements/base.txt
RUN python -m pip install --upgrade pip
RUN pip install -r requirements/base.txt
COPY ./app ./app
CMD ["celery", "-A", "app.workers.celery_app.celery_app", "worker", "--loglevel=info", "--concurrency=2"]
