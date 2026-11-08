# Relationships backend diagrams

<!-- -MIMO: Separate relationship black-box and detailed backend flows from endpoint contract documentation. -->

## Black-box backend

```mermaid
flowchart LR
    Caller([HTTP caller]) --> Auth{Valid bearer token?}
    subgraph Backend[Relationships backend: /relationships]
        Auth -- Yes --> Lists[GET friends, sent requests, received requests]
        Auth -- Yes --> Send[POST friend-requests / target UUID]
        Auth -- Yes --> Accept[POST received request accept / target UUID]
        Auth -- Yes --> Reject[DELETE received request / sender UUID]
        Auth -- Yes --> Remove[DELETE received, sent, or friend relationship / target UUID]
    end
    Auth -- No --> E401[401 Unauthorized]
    Lists --> LR[200 relationship array; empty array when none]
    Send --> SR[201 created relationship]
    Accept --> AR[201 updated relationship result]
    Reject --> RJ[200 deleted relationship result; request removed]
    Remove --> RR[200 deleted relationship result]
    Send --> E[400 invalid UUID, self-target, or duplicate pair; 404 target user missing]
    Accept --> E2[400 missing or wrong-state request]
    Remove --> E3[400 missing or wrong-state relationship]
    E401 --> Caller
    LR --> Caller
    SR --> Caller
    AR --> Caller
    RR --> Caller
    RJ --> Caller
    E --> Caller
    E2 --> Caller
    E3 --> Caller
```

## Detailed backend flow

```mermaid
flowchart TD
    A([Request to /relationships/*]) --> B[SupabaseGuard verifies bearer token and attaches user ID]
    B -->|Invalid or absent token| E401[401 Unauthorized]
    B -->|Valid| C{Route}

    C -->|GET friends, sent, or received| L1[Controller passes authenticated user ID]
    L1 --> L2[Service selects statuses for id1 and id2 positions]
    L2 --> L3[Repository queries either canonical pair position]
    L3 --> L4[Prisma findMany ordered by last_update descending]
    L4 --> L5[Return array; empty array if no matches: 200]

    C -->|POST friend-requests / target UUID| S1[Parse target UUID]
    C -->|POST received request accept / target UUID| A1[Parse target UUID]
    C -->|DELETE received request / sender UUID| R1[Parse sender UUID]
    C -->|DELETE received, sent, or friend / target UUID| D1[Parse target UUID]
    S1 -->|Invalid UUID| E400[400 Bad Request]
    A1 -->|Invalid UUID| E400
    D1 -->|Invalid UUID| E400
    R1 -->|Invalid UUID| E400

    S1 -->|Valid| S2[Service rejects self-target and sorts both IDs]
    S2 -->|Same user| E400
    S2 -->|Distinct users| S3[Set request_from_1 or request_from_2 by sender position]
    S3 --> S4[Repository creates canonical relationship row]
    S4 -->|Unique pair conflict| S5[400 Relationship already exists]
    S4 -->|Target foreign key missing| S6[404 Target user does not exist]
    S4 -->|Created| S7[201 created row]

    A1 -->|Valid| A2[Service rejects self-target and sorts both IDs]
    A2 -->|Same user| E400
    A2 -->|Distinct users| A3[Choose expected incoming-request status]
    A3 --> A4[Repository updateMany where pair and expected status match]
    A4 -->|Count is not one| A5[400 No incoming request in expected state]
    A4 -->|Count is one| A6[201 updated result with count 1]

    R1 -->|Valid| R2[Service sorts IDs and selects expected incoming status]
    R2 -->|Caller targets self| E400
    R2 -->|Distinct users| R3[Repository deletes pair only at expected incoming status]
    R3 -->|Count is not one| R4[400 No incoming request in expected state]
    R3 -->|Count is one| R5[200 deleted result with count 1]

    D1 -->|Valid| D2[Service rejects self-target and sorts both IDs]
    D2 -->|Same user| E400
    D2 -->|Distinct users| D3[Choose required status: incoming, outgoing, or friend]
    D3 --> D4[Repository deleteMany where pair and required status match]
    D4 -->|Count is not one| D5[400 Relationship not found in expected status]
    D4 -->|Count is one| D6[200 deleted result with count 1]

    L3 -->|Database error| E500[500 server error]
    S4 -->|Unexpected database error| E500
    A4 -->|Unexpected database error| E500
    R3 -->|Unexpected database error| E500
    D4 -->|Unexpected database error| E500
```

`RelationshipsController` applies `SupabaseGuard`, UUID parsing, and `AllExceptionsHandler` to every route. Pair IDs are sorted before mutation, so one database row represents both directions. Accept uses a conditional update; if another operation changes the row first, the expected-status check returns `400` instead of overwriting that newer state.

## Scenario 2: user 1 sends and user 2 rejects

```mermaid
flowchart LR
    U1([User 1]) -->|Bearer token; POST request to user 2| API[Relationships API]
    API -->|201 pending request| U1
    API -->|Incoming request appears| U2([User 2])
    U2 -->|Bearer token; DELETE received request for user 1| API
    API -->|200 {count: 1}; request removed| U2
    API -->|Request absent from sent list| U1
```

```mermaid
flowchart TD
    A[User 1 sends request] --> B[Canonical pair row created with sender direction]
    B --> C[User 2 lists incoming requests and sees user 1]
    C --> D[User 2 rejects using sender UUID]
    D --> E{Authenticated caller is recipient and row has expected incoming status?}
    E -->|No| F[400; wrong state or request missing]
    E -->|Yes| G[Delete matching relationship row]
    G --> H[200 count 1]
    H --> I[Both sent and received lists omit the pair]
```

## Scenario 1: user 1 sends, user 2 accepts, then user 1 unfriends

```mermaid
flowchart LR
    U1([User 1]) -->|Send request| API[Relationships API]
    API -->|201 pending request| U1
    U2([User 2]) -->|Accept request| API
    API -->|201 friendship| U2
    API -->|Friendship visible in both lists| U1
    U1 -->|DELETE friend relationship| API
    API -->|200 {count: 1}; friendship removed| U1
    API -->|Friendship removed from list| U2
```

```mermaid
flowchart TD
    A[User 1 sends request] --> B[User 2 accepts incoming request]
    B --> C[Pair status becomes friend]
    C --> D[Both users see the friendship]
    D --> E[User 1 deletes friendship using user 2 UUID]
    E --> F{Pair still has friend status?}
    F -->|No| G[400; relationship missing or changed]
    F -->|Yes| H[Delete matching friend row]
    H --> I[200 count 1]
    I --> J[Both friend lists omit the pair]
```

## Scenario 3: user 1 sends and cancels before user 2 acts

```mermaid
flowchart LR
    U1([User 1]) -->|Bearer token; POST request to user 2| API[Relationships API]
    API -->|201 pending request| U1
    U1 -->|Bearer token; DELETE sent request for user 2| API
    API -->|200 {count: 1}; request removed| U1
    API -->|No incoming request remains| U2([User 2])
```

```mermaid
flowchart TD
    A[User 1 sends request] --> B[Canonical pair row created with sender direction]
    B --> C[User 1 cancels using recipient UUID]
    C --> D{Caller is sender and row has expected outgoing status?}
    D -->|No| E[400; wrong state or request missing]
    D -->|Yes| F[Delete matching relationship row]
    F --> G[200 count 1]
    G --> H[Sent and received lists omit the pair]
```
