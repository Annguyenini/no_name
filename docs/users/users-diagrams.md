# Users backend diagrams

<!-- -MIMO: Separate users black-box and detailed backend flows from endpoint contract documentation. -->

## Black-box backend

```mermaid
flowchart LR
    Caller([HTTP caller]) --> AUTH{Valid bearer token?}
    subgraph Backend[Users backend: /users]
        AUTH -- Yes --> M[GET /me]
        AUTH -- Yes --> P[GET /user?user_id=UUID]
        AUTH -- Yes --> C[POST /create-profile]
        AUTH -- Yes --> D[PATCH /update-display-name]
        AUTH -- Yes --> MA[GET /me/avatar]
        AUTH -- Yes --> A[GET /avatar?user_id=UUID]
        AUTH -- Yes --> U[GET /avatar/upload-url]
        AUTH -- Yes --> V[PATCH /avatar/validate-upload]
    end
    AUTH -- No --> UNAUTH[401 Unauthorized]
    M --> MR[200 own profile / 404 missing]
    P --> PR[200 public profile / 400 invalid UUID / 404 missing]
    C --> CR[201 profile / 400 invalid input or insert failure / 409 conflict]
    D --> DR[200 updated profile / 400 invalid input / 404 missing]
    MA --> MAR[200 presigned avatar URL / 500 URL failure]
    A --> AR[200 presigned avatar URL / 400 invalid UUID / 500 URL failure]
    U --> UR[200 presigned upload URL / 500 URL generation failure]
    V --> VR[200 updated profile / 400 upload failure / 404 missing profile]
    UNAUTH --> Caller
    MR --> Caller
    PR --> Caller
    CR --> Caller
    DR --> Caller
    MAR --> Caller
    AR --> Caller
    UR --> Caller
    VR --> Caller
```

## Detailed backend flow

```mermaid
flowchart TD
    A([Request to /users/*]) --> B[SupabaseGuard validates bearer access token]
    B -->|Invalid or absent| E401[401 Unauthorized]
    B -->|Valid; user ID attached| C{Route}

    C -->|GET /me| M1[Use authenticated user ID]
    M1 --> M2[UsersService to UserRepositoryService]
    M2 --> M3[Prisma findUnique]
    M3 -->|Found| M4[Return full profile: 200]
    M3 -->|Missing| M5[404 Profile not found]

    C -->|GET /user?user_id| P1[Parse UUID query]
    P1 -->|Invalid| E400[400 Bad Request]
    P1 -->|Valid| P2[UsersService gets public profile from repository]
    P2 --> P3[Prisma findUnique]
    P3 -->|Found| P4[Return id, username, display_name: 200]
    P3 -->|Missing| P5[404 Profile not found]

    C -->|POST /create-profile| C1[Validate username and display_name DTO]
    C1 -->|Invalid or unknown field| E400
    C1 -->|Valid| C2[Controller takes user ID from token]
    C2 --> C3[Service checks existing profile]
    C3 -->|Already exists| C4[409 Profile already exists]
    C3 -->|Not found| C5[Repository inserts profile in Prisma]
    C5 -->|Unique constraint conflict| C6[409 conflict]
    C5 -->|Other insert failure| C7[400 profile insert failure]
    C5 -->|Created| C8[201 created profile]

    C -->|PATCH /update-display-name| D1[Validate display_name DTO]
    D1 -->|Invalid or unknown field| E400
    D1 -->|Valid| D2[Service updates profile using token user ID]
    D2 --> D3[Repository updates Prisma row]
    D3 -->|Found| D4[200 updated profile]
    D3 -->|Missing| D5[404 Profile not found]

    C -->|GET /me/avatar or GET /avatar?user_id| A1[Use token ID or parse UUID query]
    A1 -->|Invalid UUID query| E400
    A1 -->|Valid| A2[Service and repository request S3 presigned GET URL]
    A2 -->|Success| A3[200 URL; expires in 300 seconds]
    A2 -->|Failure| A4[500 URL error]

    C -->|GET /avatar/upload-url| U1[Service delegates to contents repository]
    U1 --> U2{Unexpired upload already tracked?}
    U2 -->|Yes| U3[Reject duplicate pending upload]
    U2 -->|No| U4[Create S3 presigned PUT URL and track request for 5 minutes]
    U4 -->|Success| U5[200 upload URL]
    U4 -->|Failure| U6[500 generation failure]

    C -->|PATCH /avatar/validate-upload| V1[Body has no DTO validation currently]
    V1 --> V2[Check pending upload owner and expiry]
    V2 -->|Missing, expired, wrong owner| V3[400 invalid upload request]
    V2 -->|Valid| V4[S3 HeadObject metadata verification]
    V4 -->|Missing, empty, too large, or wrong content type| V5[400 verification failure]
    V4 -->|Verified; consume pending request| V6[Save supplied avatar_properties in Prisma]
    V6 -->|Profile missing| V7[404 profile update failure]
    V6 -->|Saved| V8[200 updated profile]
```

The file transfer for an avatar goes directly to S3 using the presigned URL; it is outside the `/users` API boundary. `GET /users/avatar?user_id=...` currently lets any authenticated user request another user's avatar URL.
