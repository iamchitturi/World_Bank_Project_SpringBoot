# World Bank Project - Spring Boot

## Postman quick start

This API is secured with JWT. Most `POST` endpoints require a bearer token.

1. **Login first**
   - `POST http://localhost:8080/api/v1/auth/login`
   - Header: `Content-Type: application/json`
   - Body:
     ```json
     {
       "email": "admin@bank.com",
       "password": "Admin@123"
     }
     ```
2. Copy the token from `data.token`.
3. For protected endpoints, add header:
   - `Authorization: Bearer <token>`

### Common POST examples

- Create account:
  - `POST /api/v1/account/create`
  - JSON body with account fields.
- Deposit:
  - `POST /api/v1/account/deposit?accountNumber=ACC1001&amount=500`
- Withdraw:
  - `POST /api/v1/account/withdraw?accountNumber=ACC1001&amount=200`
- Transfer:
  - `POST /api/v1/account/transfer`
  - JSON body:
    ```json
    {
      "fromAcc": "ACC1001",
      "toAcc": "ACC1002",
      "amount": 100,
      "requestId": "req-123"
    }
    ```

If token is missing/invalid, the API now returns a JSON `401` response that explains how to authenticate.
