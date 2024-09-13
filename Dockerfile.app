FROM python:3.9-slim

WORKDIR /app

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

# Copy only the requirements file first to take advantage of Docker cache
COPY requirements.txt /app/requirements.txt

# Install dependencies
RUN apt-get update  \
    && apt-get install -y  --no-install-recommends \
      gdal-bin  \
      libgdal-dev \
      postgresql-client \
      g++ \
      netcat-openbsd  \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install -r requirements.txt

# Copy only the necessary source files, configurations, and scripts
COPY WebLUCIS/ /app/WebLUCIS
COPY migrations_db.sh /app/migrations_db.sh

EXPOSE 8000
ENTRYPOINT ["/app/migrations_db.sh"]

CMD ["python", "/app/WebLUCIS/manage.py", "runserver", "0.0.0.0:8000"]