# Feature Documentation

TrustBank includes a comprehensive suite of banking features designed for security, scalability, and ease of use.

## 1. Authentication & Authorization
*   **JWT Security**: Secure, stateless authentication using JSON Web Tokens.
*   **Role-Based Access Control (RBAC)**: Distinct permissions for `USER` and `ADMIN` roles.
    *   *Users* can manage their own accounts and view personal histories.
    *   *Admins* can view system-wide logs, manage any user, and audit transactions.

## 2. Account Management
*   **Multi-Account Support**: A single user can have multiple accounts (e.g., Checking, Savings).
*   **Real-time Balances**: Balances are dynamically calculated and updated safely using database transactions.
*   **Status Toggles**: Accounts can be marked as `ACTIVE` or `BLOCKED`.

## 3. Transaction Processing
*   **Transfers**: Move money securely between two internal accounts. Uses ACID-compliant database transactions to ensure no money is lost during failures.
*   **Deposits & Withdrawals**: Standard I/O operations on an account.
*   **Idempotency**: Reference numbers ensure that a single transaction is not processed twice accidentally.

## 4. Card Management
*   **Virtual Card Issuance**: Users can instantly generate virtual Debit or Credit cards linked to their accounts.
*   **Fraud Prevention**:
    *   Cards can be instantly frozen/blocked by the user.
    *   Daily spending limits are enforced.

## 5. Security & Auditing
*   **Automated Audit Trails**: Using Spring AOP (Aspect-Oriented Programming), every critical action (like `CREATE_ACCOUNT`, `TRANSFER_FUNDS`) is intercepted and logged into the `audit_log` table alongside the user's IP address and username.
*   **Rate Limiting**: Integrated Bucket4j to prevent brute-force attacks and API abuse.

## 6. Frontend Dashboard
*   A responsive, modern single-page web dashboard.
*   Includes Dark Mode.
*   Uses Chart.js for data visualization of spending habits and account balances.
