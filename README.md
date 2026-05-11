# 🏦 TrustBank — Enterprise Banking Platform

> A production-grade, event-driven banking system built with Spring Boot 3, featuring distributed caching, asynchronous messaging, full observability, and resilient fault tolerance.

[![CI](https://github.com/iamchitturi/World_Bank_Project_SpringBoot/actions/workflows/ci.yml/badge.svg)](https://github.com/iamchitturi/World_Bank_Project_SpringBoot/actions/workflows/ci.yml)
[![CodeQL](https://github.com/iamchitturi/World_Bank_Project_SpringBoot/actions/workflows/codeql.yml/badge.svg)](https://github.com/iamchitturi/World_Bank_Project_SpringBoot/actions/workflows/codeql.yml)

## ⚡ Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Java 17, Spring Boot 3.3.5 |
| **Database** | MySQL 8, Flyway, Hikari Pool |
| **Cache** | Redis 7 (`@Cacheable` distributed cache) |
| **Messaging** | Apache Kafka (KRaft mode, event-driven) |
| **Security** | Spring Security, JWT, BCrypt, Bucket4j Rate Limiting |
| **Resilience** | Resilience4j Circuit Breakers & Retries |
| **Metrics** | Micrometer → Prometheus → Grafana |
| **Logging** | Logback JSON → Logstash → Elasticsearch → Kibana |
| **Tracing** | OpenTelemetry → Zipkin |
| **API Docs** | SpringDoc OpenAPI (Swagger UI) |
| **CI/CD** | GitHub Actions, JaCoCo, CodeQL SAST, Docker Publish |
| **Testing** | JUnit 5, Mockito, K6 Load Testing |

## 📐 Architecture

```
Client → Spring Security (JWT) → REST Controllers → Service Layer
                                                        ├── Redis Cache (read-heavy queries)
                                                        ├── JPA → MySQL (ACID transactions)
                                                        ├── Kafka Producer → Event Topics
                                                        │       ├── Notification Consumer
                                                        │       └── Audit Event Consumer
                                                        └── Resilience4j (circuit breaker)

Observability:  Prometheus + Grafana  |  ELK Stack  |  Zipkin Tracing
```

## 📚 Documentation
- [Architecture & Diagrams](docs/ARCHITECTURE.md)
- [Database Schema](docs/SCHEMA.md)
- [Feature Breakdown](docs/FEATURES.md)
- [API Documentation](docs/API.md)
- [Local Setup Guide](docs/SETUP.md)
- [Deployment Guide (Docker & Render)](docs/DEPLOYMENT.md)

## 🚀 Quick Start

### Option 1: Full Stack with Docker Compose
```bash
docker-compose up -d
```
This starts the complete enterprise stack: App + MySQL + Redis + Kafka + Prometheus + Grafana + ELK + Zipkin.

### Option 2: Local Development
```bash
# Start just MySQL + Redis
docker-compose up -d mysql redis

# Run the application
./mvnw spring-boot:run
```

### Dashboards
| Service | URL |
|---|---|
| **Application API** | http://localhost:8080 |
| **Swagger UI** | http://localhost:8080/swagger-ui/index.html |
| **Grafana Dashboards** | http://localhost:3000 (admin/admin) |
| **Kibana Logs** | http://localhost:5601 |
| **Zipkin Tracing** | http://localhost:9411 |
| **Prometheus** | http://localhost:9091 |
| **Adminer (DB)** | http://localhost:9090 |

## 🔐 API Authentication

```bash
# 1. Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bank.com","password":"Admin@123"}'

# 2. Use the returned token
curl -H "Authorization: Bearer <token>" \
  http://localhost:8080/api/v1/account/my-accounts
```

## 🧪 Running Tests
```bash
# Unit tests
./mvnw test

# With coverage report
./mvnw test jacoco:report

# Load test (requires K6 installed)
k6 run k6/load-test.js
```

## 📁 Project Structure
```
├── src/main/java/com/bank/
│   ├── config/          # Redis, OpenAPI, Scheduling config
│   ├── controller/      # REST API endpoints
│   ├── dto/             # Request/Response DTOs
│   ├── entity/          # JPA entities (Account, Transaction, Card, User, AuditLog)
│   ├── event/           # Kafka events & consumers
│   │   ├── producer/    # EventProducer (Circuit Breaker protected)
│   │   └── consumer/    # NotificationConsumer, AuditEventConsumer
│   ├── exception/       # Global exception handler
│   ├── filter/          # CorrelationId, RateLimit filters
│   ├── repository/      # Spring Data JPA repositories
│   ├── security/        # JWT, SecurityConfig, UserDetails
│   └── service/         # Business logic (cached, transactional)
├── infra/               # Prometheus, Logstash configs
├── k6/                  # Load testing scripts
├── docs/                # Architecture, API, Schema, Deployment docs
└── .github/workflows/   # CI/CD pipelines
```
