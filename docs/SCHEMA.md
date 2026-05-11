# Database Schema

The database relies on a normalized relational schema to ensure data integrity and track all financial actions.

## Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ ACCOUNT : owns
    USER ||--o{ AUDIT_LOG : triggers
    ACCOUNT ||--o{ CARD : linked_to
    ACCOUNT ||--o{ TRANSACTION : initiates
    
    USER {
        bigint id PK
        string username
        string password
        string email
        string role "ADMIN or USER"
        datetime created_at
    }
    
    ACCOUNT {
        bigint id PK
        bigint user_id FK
        string account_number "Unique"
        decimal balance
        string account_type "SAVINGS, CHECKING"
        string status "ACTIVE, BLOCKED"
        datetime created_at
    }
    
    CARD {
        bigint id PK
        bigint account_id FK
        string card_number "Unique"
        string card_type "DEBIT, CREDIT"
        string cvv
        date expiry_date
        string status "ACTIVE, BLOCKED"
        decimal daily_limit
        decimal current_daily_spend
    }
    
    TRANSACTION {
        bigint id PK
        bigint account_id FK
        string transaction_type "DEPOSIT, WITHDRAWAL, TRANSFER"
        decimal amount
        string description
        string status "PENDING, COMPLETED, FAILED"
        string reference_number "Unique"
        datetime timestamp
    }
    
    AUDIT_LOG {
        bigint id PK
        string action "e.g., CREATE_ACCOUNT, TRANSFER"
        string username "User who performed action"
        string details "JSON or text describing change"
        string ip_address
        datetime timestamp
    }
```

## Schema Details
* **Users**: Stores authentication credentials and role definitions.
* **Accounts**: Financial accounts linked to users. The balance is tracked here.
* **Cards**: Physical/virtual cards linked to accounts. Has spending limits to prevent fraud.
* **Transactions**: Immutable ledger of all financial movements.
* **AuditLogs**: Automatically populated by the `AuditAspect` to ensure compliance and track admin/user actions.
