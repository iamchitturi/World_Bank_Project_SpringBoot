# Setup Guide

Follow these steps to set up the TrustBank application locally for development and testing.

## Prerequisites
*   **Java 17** (JDK)
*   **Maven** 3.8+ (or use the included `./mvnw` wrapper)
*   **Docker** & **Docker Compose** (for running the local database, cache, and message broker)
*   **Git**

## 1. Clone the Repository
```bash
git clone <repository-url>
cd World_Bank_Project_SpringBoot-2
```

## 2. Start the Local Infrastructure
The project includes a comprehensive `docker-compose.yml` file to spin up all required enterprise infrastructure services.

**Option A: Full Enterprise Stack** (App, MySQL, Redis, Kafka, Prometheus, Grafana, ELK, Zipkin)
```bash
docker-compose up -d
```
*Note: This starts the app itself via Docker as well. You can access it at `http://localhost:8080`.*

**Option B: Infrastructure Only** (For running the app from your IDE)
```bash
docker-compose up -d mysql redis kafka
```

*The application has graceful fallbacks. If Redis is down, it uses an in-memory cache. If Kafka is down, the circuit breaker protects the main transactions.*

## 3. Configure Environment Variables
You can override default settings via environment variables in your IDE run configuration:

*   `DB_URL`: `jdbc:mysql://localhost:3306/bank_db?useSSL=false&serverTimezone=UTC` (Default provided)
*   `DB_USERNAME`: `root` (Default provided)
*   `DB_PASSWORD`: `secret`
*   `JWT_SECRET`: Secure 256-bit random string for signing JWT tokens.
*   `REDIS_HOST`: `localhost` (Default provided)
*   `KAFKA_BOOTSTRAP_SERVERS`: `localhost:9092` (Default provided)

## 4. Build the Project
Compile the application and run unit tests:
```bash
./mvnw clean install
```
*Tests are configured to use an in-memory H2 database, so they run fast and don't require external services.*

## 5. Run the Application
Run the Spring Boot application using the Maven wrapper:
```bash
./mvnw spring-boot:run
```
Alternatively, you can run the `BankingApplication.java` main class directly from your IDE.

## 6. Verify the Setup & Dashboards
Once the application starts, it will run Flyway migrations automatically. You can access the following services:

| Service | Local URL | Default Credentials |
|---|---|---|
| **API / App** | http://localhost:8080 | - |
| **Swagger UI** | http://localhost:8080/swagger-ui/index.html | - |
| **Grafana** | http://localhost:3000 | admin / admin |
| **Kibana** | http://localhost:5601 | - |
| **Zipkin** | http://localhost:9411 | - |
| **Adminer** | http://localhost:9090 | root / secret |
