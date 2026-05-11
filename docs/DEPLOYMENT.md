# Deployment Guide

This guide covers deploying the TrustBank application to production. Since the application is Dockerized, it can be deployed to almost any cloud provider.

## 1. Environment Preparation
Before deploying, ensure you have an external MySQL database ready (e.g., AWS RDS, Aiven).
You will need to configure the following environment variables in your deployment environment:
*   `DB_URL`
*   `DB_USERNAME`
*   `DB_PASSWORD`
*   `JWT_SECRET`
*   `PORT` (usually 8080)

## 2. Docker Deployment
The project includes a multi-stage `Dockerfile`. 
To build and run the image manually on any server:

```bash
# Build the image
docker build -t trustbank-api .

# Run the container
docker run -d -p 8080:8080 \
  -e DB_URL="jdbc:mysql://your-db-host/bank_db" \
  -e DB_USERNAME="root" \
  -e DB_PASSWORD="secret" \
  -e JWT_SECRET="your-secure-secret" \
  trustbank-api
```

## 3. Render Deployment (Recommended)
Render natively supports building and hosting Dockerized applications directly from GitHub.

1.  Connect your GitHub repository to [Render](https://dashboard.render.com).
2.  Create a new **Web Service**.
3.  Choose the **Docker** runtime environment.
4.  Add the Environment Variables listed in Step 1.
5.  Deploy. Render will automatically build the `Dockerfile` and expose the API.

### Infrastructure as Code (render.yaml)
You can optionally add a `render.yaml` to the root of the project to automate the setup:
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
This repository uses **GitHub Actions** for CI/CD:
*   **`ci.yml`**: Runs on every push/PR. Compiles the code, runs unit tests, and uploads a JaCoCo coverage report.
*   **`codeql.yml`**: Runs SAST security scanning.
*   **`docker-publish.yml`**: On push to `main` or new tags, builds the Docker image and publishes it to the GitHub Container Registry (`ghcr.io`). You can configure your cloud provider to automatically pull this image.
