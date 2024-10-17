FROM python:3.9-slim

WORKDIR /app

# By copying over requirements first, we make sure that Docker will cache
# our installed requirements rather than reinstall them on every build
COPY requirements.txt /app/requirements.txt
RUN apt-get update && apt-get install -y gdal-bin libgdal-dev g++ netcat-openbsd && rm -rf /var/lib/apt/lists/*
RUN pip install -r requirements.txt

# Now copy in our code, and run it
COPY . /app

EXPOSE 8000
ENTRYPOINT ["/app/docker-entrypoint.sh"]