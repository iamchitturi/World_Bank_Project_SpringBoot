# Setup Guide

Follow these steps to set up the TrustBank application locally for development and testing.

## Prerequisites
*   **Java 17** (JDK)
*   **Maven** 3.8+ (or use the included `./mvnw` wrapper)
*   **Docker** & **Docker Compose** (for running the local database)
*   **Git**

## 1. Clone the Repository
```bash
git clone <repository-url>
cd World_Bank_Project_SpringBoot-2
```

## 2. Start the Local Database
The project includes a `docker-compose.yml` file to spin up a MySQL 8 instance quickly.
```bash
docker-compose up -d
```
*This will start MySQL on port 3306 with the database `bank_db` and password `secret`.*

## 3. Configure Environment Variables
You need to set up a few environment variables. You can copy the `.env.example` file (if provided) or set them directly in your IDE.

Required variables:
*   `DB_URL`: `jdbc:mysql://localhost:3306/bank_db?useSSL=false&serverTimezone=UTC`
*   `DB_USERNAME`: `root`
*   `DB_PASSWORD`: `secret`
*   `JWT_SECRET`: Generate a secure 256-bit random string for signing JWT tokens.

*Note: For testing, you can leave these as default, as `application.yml` often contains fallbacks for local dev.*

## 4. Build the Project
Compile the application and skip tests if you just want to build it:
```bash
./mvnw clean install -DskipTests
```

## 5. Run the Application
Run the Spring Boot application using the Maven wrapper:
```bash
./mvnw spring-boot:run
```
Alternatively, you can run the `BankingApplication.java` main class directly from your IDE (IntelliJ IDEA, Eclipse, VS Code).

## 6. Verify the Setup
Once the application starts, it will run Flyway migrations automatically to create the necessary tables.
Navigate to:
[http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html) to view the API documentation.
