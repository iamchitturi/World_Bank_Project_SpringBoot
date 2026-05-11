# System Architecture

## Overview
TrustBank is a modern, secure, and highly scalable banking platform built using a microservices-ready architecture on top of Spring Boot. It provides a robust backend for managing users, accounts, cards, and transactions, with enterprise-grade security and auditing.

## High-Level Architecture Diagram

```mermaid
graph TD
    Client[Client Browser / Mobile App] -->|HTTPS / REST| Sec[Spring Security & JWT Filter]
    
    subgraph Spring Boot Application
        Sec --> Ctrl[Controllers (REST API)]
        Ctrl --> AOP[Audit Aspect]
        Ctrl --> Svc[Service Layer]
        Svc --> Repo[Spring Data JPA Repositories]
        AOP --> Repo
    end
    
    Repo -->|JDBC / Hibernate| DB[(MySQL Database)]
```

## Core Components
1. **Security Layer**: Handles JWT-based authentication and Role-Based Access Control (RBAC). Filters all incoming requests to ensure users only access authorized resources.
2. **Controllers**: Define the RESTful API endpoints for external interactions.
3. **Service Layer**: Encapsulates the core business logic (e.g., transaction processing, card generation, account management).
4. **Data Access Layer**: Utilizes Spring Data JPA for object-relational mapping and database interactions.
5. **Auditing (AOP)**: An Aspect-Oriented Programming (AOP) component that automatically intercepts critical service methods to log audit trails.

## Tech Stack
*   **Backend**: Java 17, Spring Boot 3.3.5
*   **Database**: MySQL 8
*   **Security**: Spring Security, JWT (JSON Web Tokens)
*   **ORM**: Hibernate, Spring Data JPA
*   **Database Migrations**: Flyway
*   **Rate Limiting**: Bucket4j
*   **API Documentation**: SpringDoc OpenAPI (Swagger UI)
