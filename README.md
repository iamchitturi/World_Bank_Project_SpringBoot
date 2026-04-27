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
1. Create environment values (or use defaults) from `.env.example`.
2. Start MySQL and create database.
3. Run:
   ```bash
   chmod +x mvnw
   ./mvnw spring-boot:run
   ```

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
