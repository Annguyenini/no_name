# Authentication diagrams

<!-- -MIMO: Separate auth black-box and detailed backend flows from endpoint contract documentation. -->

## Black-box backend

The API boundary and caller-visible outcomes for `/auth` endpoints.

```mermaid
flowchart LR
    Caller([HTTP caller]) --> API
    subgraph API[Auth backend: /auth]
        S[POST /sign-up]
        I[POST /sign-in]
        V[GET /sign-in-via-token]
        R[GET /refresh-token]
        O[POST /signout]
        E[POST /resend-email-verification]
    end
    S --> SU[201 user ID; 400 signup rejected; 401 missing user]
    I --> IU[201 user ID and tokens; 400 invalid request; 401 credentials rejected]
    V --> VU[200 user ID; 401 token invalid]
    R --> RU[200 rotated tokens; 401 refresh token invalid]
    O --> OU[201 signed-out message; 401 auth failure; 500 other failure]
    E --> EU[201 empty response; 400 invalid email; 500 resend failure]
    SU --> Caller
    IU --> Caller
    VU --> Caller
    RU --> Caller
    OU --> Caller
    EU --> Caller
```

## Detailed backend flow

```mermaid
flowchart TD
    A([Request to /auth/*]) --> B{Route}
    B -->|POST /sign-up| C[Validate SignUpDTO]
    B -->|POST /sign-in| D[Validate SignInDTO]
    B -->|GET /sign-in-via-token| G[SupabaseGuard validates access token]
    B -->|GET /refresh-token| J[Controller parses Bearer refresh token]
    B -->|POST /signout| M[SupabaseGuard validates access token]
    B -->|POST /resend-email-verification| P[Validate Email DTO]

    C -->|Invalid| X[400 validation response]
    C -->|Valid| C1[AuthService.signUp]
    C1 --> C2[AuthRepositoryService.signUp]
    C2 --> C3[Supabase Auth signUp]
    C3 -->|Provider error| C4[400 signup error]
    C3 -->|No user| C5[401 failed signup]
    C3 -->|User returned| C6[201 user ID]

    D -->|Invalid| X
    D -->|Valid| D1[AuthService.signIn]
    D1 --> D2[AuthRepositoryService.signIn]
    D2 --> D3[Supabase Auth signInWithPassword]
    D3 -->|Rejected / no data| D4[401 invalid credential]
    D3 -->|User + session| D5[201 user ID + access and refresh tokens]

    G -->|Rejected| Y[401 unauthorized]
    G -->|Accepted; user attached| G1[Controller returns user ID]
    G1 --> G2[200 user ID]

    J -->|Missing or malformed bearer token| Y
    J -->|Refresh token parsed| J1[AuthService requests new tokens]
    J1 --> J2[AuthRepositoryService calls refreshSession]
    J2 -->|Invalid / empty session| J3[401 invalid refresh token]
    J2 -->|Session + user| J4[200 rotated access and refresh tokens]

    M -->|Rejected| Y
    M -->|Accepted| M1[Controller extracts access token]
    M1 --> M2[AuthService.signOut]
    M2 --> M3[AuthRepositoryService.signOut]
    M3 -->|Success| M4[201 signed-out message]
    M3 -->|Provider 401/403| M5[401 sign-out failure]
    M3 -->|Other error| M6[500 sign-out failure]

    P -->|Invalid| X
    P -->|Valid| P1[AuthService requests signup email resend]
    P1 --> P2[AuthRepositoryService calls Supabase resend]
    P2 -->|Error / no data| P3[500 resend failure]
    P2 -->|Success| P4[201 empty response]

    X --> F[AllExceptionsHandler formats error]
    Y --> F
    C4 --> F
    C5 --> F
    D4 --> F
    J3 --> F
    M5 --> F
    M6 --> F
    P3 --> F
```

The controller validates request DTOs and rejects unknown body fields. `AuthService` shapes successful results, `AuthRepositoryService` calls Supabase Auth, and `AllExceptionsHandler` formats failures. The global filter returns generic `500` JSON for unexpected non-HTTP errors.
