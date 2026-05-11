# Deployment Guide

This guide covers deploying the TrustBank application to production. Since the application and its dependencies are fully Dockerized, it can be deployed to any modern cloud provider or orchestrated environment.

## 1. Environment Preparation
For a complete enterprise deployment, you need to configure the following environment variables:

**Core Setup:**
*   `DB_URL` (e.g., AWS RDS, Cloud SQL)
*   `DB_USERNAME`
*   `DB_PASSWORD`
*   `JWT_SECRET` (256-bit secure key)

**Enterprise Integrations:**
*   `REDIS_HOST` & `REDIS_PORT` (for distributed caching)
*   `KAFKA_BOOTSTRAP_SERVERS` (for async event-driven features)
*   `ZIPKIN_ENDPOINT` (for distributed tracing)

## 2. Full Stack Deployment (Docker Compose)
The project includes a robust `docker-compose.yml` that defines the entire 11-service enterprise stack. This is ideal for a VM-based deployment (e.g., EC2, DigitalOcean Droplet).

1. Copy the `docker-compose.yml` and the `infra/` folder to your server.
2. Run the stack:
```bash
docker-compose up -d
```
This will start: Spring Boot API, MySQL, Redis, Kafka, Prometheus, Grafana, Elasticsearch, Logstash, Kibana, and Zipkin. All automatically networked together.

## 3. Render Deployment (Recommended for API Only)
Render natively supports building and hosting Dockerized applications directly from GitHub.

1.  Connect your GitHub repository to [Render](https://dashboard.render.com).
2.  Create a new **Web Service**.
3.  Choose the **Docker** runtime environment.
4.  Add the Environment Variables listed in Step 1.
5.  Deploy. Render will automatically build the `Dockerfile` and expose the API.

*Note: The application has graceful fallbacks for Redis and Kafka. You can deploy just the API and a database to Render, and the application will still function using in-memory cache and synchronous processing.*

### Infrastructure as Code (render.yaml)
You can optionally use `render.yaml` to automate the API and Database setup:
```yaml
services:
  - type: web
    name: world-bank-api
    env: docker
    plan: free
    branch: main
    healthCheckPath: /actuator/health
    envVars:
      - key: PORT
        value: 8080
      - key: DB_URL
        sync: false
      - key: DB_USERNAME
        sync: false
      - key: DB_PASSWORD
        sync: false
      - key: JWT_SECRET
        generateValue: true
```

## 4. CI/CD Pipeline
This repository uses **GitHub Actions** for comprehensive CI/CD:
*   **`ci.yml`**: Runs on every push/PR. Compiles the code, runs 20+ unit tests, and uploads a JaCoCo coverage report.
*   **`codeql.yml`**: Runs SAST security scanning on the codebase.
*   **`docker-publish.yml`**: On push to `main` or new tags, builds the Docker image and publishes it to the GitHub Container Registry (`ghcr.io`). You can configure your cloud provider to automatically pull this image.

