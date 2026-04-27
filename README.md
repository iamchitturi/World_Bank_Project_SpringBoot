# World Bank Project - Spring Boot Banking API

A secured banking backend with:
- Account lifecycle operations
- Transfer with idempotency (`requestId`)
- JWT authentication and role-based authorization
- Global API response/error models
- Reporting endpoint
- Flyway migration support
- Actuator health/metrics and basic rate limiting

## Tech Stack
- Java 17
- Spring Boot 3.3.x
- Spring Security (JWT)
- Spring Data JPA + MySQL
- Flyway
- OpenAPI (Swagger)

## Run Locally
1. Copy `.env.example` values into your environment (or `.env` if your IDE loads it).
2. Start the app (default uses embedded H2 file DB, so MySQL is not required):
   ```bash
   ./mvnw spring-boot:run
   ```
3. Optional: run with MySQL by setting `SPRING_PROFILES_ACTIVE=mysql` and valid `DB_*` credentials.

### Why startup failed with `Access denied for user 'root'@'localhost'`
That error means MySQL authentication failed before Flyway/JPA could initialize. If you do not want to configure MySQL right now, run with default settings (H2). If you want MySQL, provide correct `DB_USERNAME`/`DB_PASSWORD` and activate `mysql` profile.

## Default Seed User
- Email: `admin@bank.com`
- Password: `Admin@123`
- Role: `ADMIN`

## API Docs
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## Main API Base
- `/api/v1`

## Security Notes
- Set `JWT_SECRET`, `DB_PASSWORD`, and `MAIL_PASSWORD` using environment variables.
- Do not commit real credentials.
