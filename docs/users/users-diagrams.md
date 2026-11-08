# Users diagrams

## Black-box scenario: profile requests

```mermaid
flowchart LR
    Client([Client]) -->|Bearer token, route, query or JSON body| Boundary
    subgraph Boundary[Users API boundary: /users]
        Guard{Supabase token valid?}
        Routes[Profile and avatar routes]
    end
    Boundary --> Guard
    Guard -->|No| Unauthorized[401 JSON error]
    Guard -->|Yes| Routes
    Routes -->|GET /me| OwnProfile[Own profile]
    Routes -->|GET /user?user_id=UUID| PublicProfile[Public profile]
    Routes -->|POST /create-profile| Create[Create own profile]
    Routes -->|PATCH /update-display-name| Update[Update own display name]
    Routes -->|GET /me/avatar or /avatar?user_id=UUID| GetAvatar[Presigned avatar GET URL]
    Routes -->|GET /avatar/upload-url| UploadUrl[Presigned avatar PUT URL]
    Routes -->|PATCH /avatar/validate-upload| Verify[Confirm uploaded avatar]
    OwnProfile -->|200 profile / 404 missing| Client
    PublicProfile -->|200 public fields / 400 invalid UUID / 404 missing| Client
    Create -->|201 profile / 400 invalid input / 409 conflict| Client
    Update -->|200 profile / 400 invalid input / 404 missing| Client
    GetAvatar -->|200 URL / 400 invalid UUID / 500 URL failure| Client
    UploadUrl -->|200 URL / 500 generation or pending-upload error| Client
    Verify -->|200 updated row / 400 invalid upload / 404 missing profile| Client
    Client -->|PUT image/jpeg to signed URL| S3[(S3 object storage)]
    S3 -->|Upload result; outside Users API| Client
```

## Detailed scenario: validation, persistence, and avatar upload branches

```mermaid
flowchart TD
    Start([HTTP request to /users/*]) --> Auth{SupabaseGuard validates bearer token}
    Auth -->|Missing or rejected| E401[401 Unauthorized]
    Auth -->|Verified; request.user.id attached| Route{Route}

    Route -->|GET /me| OwnId[Controller uses request user ID]
    OwnId --> ProfileRead[UsersService to UserRepositoryService]
    ProfileRead --> FindOwn[Prisma users.findUnique by ID]
    FindOwn -->|Found| Own200[200 full UserDTO profile]
    FindOwn -->|Missing| Own404[404 Profile not found]

    Route -->|GET /user?user_id| UuidCheck[ParseUUIDPipe validates query]
    UuidCheck -->|Invalid or missing| E400[400 Bad Request]
    UuidCheck -->|Valid| PublicRead[Service and repository find by ID]
    PublicRead -->|Missing| Public404[404 Profile not found]
    PublicRead -->|Found| PublicFields[Service returns id, username, display_name only]
    PublicFields --> Public200[200 Public profile]

    Route -->|POST /create-profile| CreateDto[Validate username and display_name DTO; reject extra fields]
    CreateDto -->|Invalid| E400
    CreateDto -->|Valid| TokenId[Controller sets ID from verified token]
    TokenId --> Exists[Service checks for existing profile]
    Exists -->|Exists| Conflict[409 Profile already exists]
    Exists -->|No profile| Insert[Repository inserts active profile with Prisma]
    Insert -->|Unique username conflict| Conflict
    Insert -->|Other error| Create400[400 Create failure]
    Insert -->|Created| Create201[201 Profile JSON]

    Route -->|PATCH /update-display-name| UpdateDto[Validate string display_name; reject extra fields]
    UpdateDto -->|Invalid| E400
    UpdateDto -->|Valid| UpdateRow[Service and repository update by token ID]
    UpdateRow -->|Missing row| Update404[404 Profile not found]
    UpdateRow -->|Updated| Update200[200 Profile JSON]

    Route -->|GET /me/avatar or GET /avatar?user_id| AvatarId[Use token ID or validate query UUID]
    AvatarId -->|Invalid query UUID| E400
    AvatarId -->|Valid| SignGet[Repository asks contents and S3 for a 300-second GET URL]
    SignGet -->|Success; object existence is not checked| Avatar200["200 response: {url}"]
    SignGet -->|Failure| Avatar500[500 URL generation failure]

    Route -->|GET /avatar/upload-url| Pending{Unexpired upload already tracked for avatar key?}
    Pending -->|Yes| PendingError[Service maps generation failure to 500]
    Pending -->|No| SignPut[Generate 300-second JPEG PUT URL]
    SignPut -->|Success; record owner, key, type, and 5-minute expiry in memory| Upload200["200 response: {url}"]
    SignPut -->|Failure| PendingError
    Upload200 --> BrowserPut[Client PUTs image/jpeg directly to S3]

    Route -->|PATCH /avatar/validate-upload| RawBody[Accept JSON body as avatar_properties; no DTO shape validation]
    RawBody --> PendingOwner{Pending request exists, is unexpired, and belongs to token user?}
    PendingOwner -->|No| Upload400[400 Upload request invalid]
    PendingOwner -->|Yes| Head[Contents repository checks S3 HeadObject]
    Head -->|Missing, empty, over 5 MiB, wrong type, or S3 404| Upload400
    Head -->|Valid metadata; pending request is consumed| Save[Prisma updates avatar_properties]
    Save -->|No profile row| Avatar404[404 Profile update failed]
    Save -->|Updated| AvatarUpdate200[200 Updated user row JSON]

    E401 --> End([Response])
    E400 --> End
    Own200 --> End
    Own404 --> End
    Public404 --> End
    Public200 --> End
    Conflict --> End
    Create400 --> End
    Create201 --> End
    Update404 --> End
    Update200 --> End
    Avatar200 --> End
    Avatar500 --> End
    PendingError --> End
    Upload200 --> End
    Upload400 --> End
    Avatar404 --> End
    AvatarUpdate200 --> End
```

The direct S3 upload happens outside the `/users` API. Avatar GET signing does not query Prisma or verify that the S3 object exists. Pending upload tracking is process-local and is consumed only after metadata verification succeeds.
