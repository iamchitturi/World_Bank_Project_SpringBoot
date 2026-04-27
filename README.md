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

### Option A — H2 (embedded, zero config)

No database installation required. Data persists in `./data/bankdb`.

```bash
./mvnw spring-boot:run
```

### Option B — MySQL

1. **Create the database** in MySQL:
   ```sql
   CREATE DATABASE bank_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Set environment variables** (copy from `.env.example` and fill in the MySQL block):
   ```bash
   export SPRING_PROFILES_ACTIVE=mysql
   export DB_URL=jdbc:mysql://localhost:3306/bank_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   export DB_USERNAME=your_mysql_user
   export DB_PASSWORD=your_mysql_password
   ```
   Or edit `.env` and load it before starting:
   ```bash
   set -a && source .env && set +a
   ```

3. **Run the app** — Flyway will create all tables automatically on first start:
   ```bash
   SPRING_PROFILES_ACTIVE=mysql ./mvnw spring-boot:run
   ```

> **Tip (Docker):** `docker run --name mysql -e MYSQL_ROOT_PASSWORD=secret -e MYSQL_DATABASE=bank_db -p 3306:3306 -d mysql:8`

### Why startup fails with `Access denied for user 'root'@'localhost'`
MySQL authentication failed. Make sure `DB_USERNAME` and `DB_PASSWORD` match your MySQL server and the `mysql` profile is active.

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
