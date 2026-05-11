# Feature Documentation

TrustBank is an enterprise-grade banking platform with comprehensive features designed for security, scalability, resilience, and observability.

## 1. Authentication & Authorization
*   **JWT Security**: Stateless authentication using JSON Web Tokens with configurable expiry.
*   **Role-Based Access Control (RBAC)**: Distinct permissions for `USER` and `ADMIN` roles.
    *   *Users* manage their own accounts and view personal histories.
    *   *Admins* view system-wide logs, manage any user, and audit transactions.
*   **BCrypt Password Hashing**: Industry-standard password security.

## 2. Account Management
*   **Multi-Account Support**: A single user can hold multiple accounts (Savings, Premium, Current).
*   **Real-time Balances**: Safely updated using `@Transactional` with ACID guarantees.
*   **Optimistic Locking**: `@Version` field prevents lost updates from concurrent modifications.

## 3. Transaction Processing
*   **ACID Transfers**: `REPEATABLE_READ` isolation ensures data consistency during multi-account transfers.
*   **Deadlock Prevention**: Accounts are locked in a consistent order (by ID) to prevent database deadlocks.
*   **Idempotency**: Unique `requestId` per transaction prevents duplicate processing.
*   **Deposits & Withdrawals**: Standard operations with full validation.

## 4. Card Management
*   **Virtual Card Issuance**: Luhn-validated card numbers with auto-generated CVV and expiry.
*   **Instant Freeze**: Users can block/activate cards immediately.
*   **Card Number Masking**: Only last 4 digits visible in API responses.

## 5. Event-Driven Architecture (Kafka)
*   **Asynchronous Processing**: All critical operations (transfers, deposits, withdrawals, account creation) publish events to Apache Kafka topics.
*   **Notification Consumer**: Listens for transaction events and triggers email/SMS notifications asynchronously.
*   **Audit Event Consumer**: Persists audit logs from events without blocking the main request thread.
*   **Resilience**: Kafka producers are protected by Resilience4j Circuit Breakers and Retries — if Kafka is down, the main transaction still succeeds.

## 6. Distributed Caching (Redis)
*   **`@Cacheable` Annotations**: Account lookups and user account lists are cached in Redis, reducing database load by up to 90%.
*   **`@CacheEvict` on Mutations**: Caches are automatically invalidated when accounts are created, updated, or deleted.
*   **Report Caching**: Aggregate metrics (total balance, transaction volume) are cached with 2-minute TTL.

## 7. Resilience & Fault Tolerance
*   **Circuit Breakers**: Kafka producer calls are wrapped with `@CircuitBreaker`. If Kafka fails repeatedly, the circuit "opens" and falls back gracefully.
*   **Retries with Exponential Backoff**: Transient failures are retried 3 times with increasing wait durations.
*   **Rate Limiting**: Per-IP rate limiting via Bucket4j (120 requests/minute) to prevent brute-force attacks.

## 8. Security & Auditing
*   **AOP Audit Trails**: Spring AOP `@Around` advice intercepts critical service methods and logs audit entries with username, action, and details.
*   **Correlation IDs**: Every request receives a unique `X-Correlation-Id` header for end-to-end request tracing.
*   **Trace ID Propagation**: OpenTelemetry trace IDs are included in all log lines for distributed tracing.

## 9. Observability Stack
*   **Prometheus + Grafana**: JVM metrics, HTTP latency percentiles, Hikari pool stats, and custom business metrics visualized in dashboards.
*   **ELK Stack**: Structured JSON logs shipped via Logstash to Elasticsearch, queryable in Kibana.
*   **Zipkin Distributed Tracing**: End-to-end request visualization showing time spent in each service component.

## 10. CI/CD Pipeline
*   **GitHub Actions CI**: Automated build, test, and JaCoCo code coverage on every push/PR.
*   **CodeQL SAST**: Semantic security analysis for Java and JavaScript.
*   **Docker Publish**: Automatic container image build and push to GitHub Container Registry.
*   **Dependabot**: Automated dependency update PRs (Maven weekly, Actions monthly).

## 11. Frontend Dashboard
*   Responsive, modern single-page web dashboard.
*   Dark Mode support.
*   Chart.js data visualization for spending and balance trends.
