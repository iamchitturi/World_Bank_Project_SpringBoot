# API Documentation

The TrustBank API is a RESTful service. All responses are standardized, and appropriate HTTP status codes are returned. 

## Swagger UI / OpenAPI 3.0
This project utilizes `springdoc-openapi` to automatically generate API documentation.

When the application is running locally, you can view the fully interactive API documentation at:
*   **Swagger UI**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
*   **OpenAPI JSON**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

## Authentication (`/api/v1/auth`)
All endpoints (except auth endpoints) require a valid JSON Web Token (JWT).
You must pass the token in the `Authorization` header:
`Authorization: Bearer <your_jwt_token>`

*   `POST /api/v1/auth/login`: Authenticate and receive a JWT.
*   `POST /api/v1/auth/register`: Register a new user profile.

## Key Endpoints

### User Management (`/api/v1/users`)
*   `GET /`: Retrieve user profile.
*   `PUT /`: Update user details.

### Account Management (`/api/v1/accounts`)
*   `POST /`: Create a new bank account.
*   `GET /{id}`: Get account details and balance.
*   `GET /user/{userId}`: List all accounts for a specific user.

### Transactions (`/api/v1/transactions`)
*   `POST /transfer`: Transfer funds between accounts.
*   `POST /deposit`: Deposit funds into an account.
*   `POST /withdraw`: Withdraw funds.
*   `GET /account/{accountId}`: Get transaction history.

### Cards (`/api/v1/cards`)
*   `POST /`: Issue a new card for an account.
*   `PUT /{id}/status`: Block or unblock a card.

### Admin/Audit (`/api/v1/admin`)
*(Requires `ROLE_ADMIN`)*
*   `GET /audit-logs`: View system-wide audit logs.
