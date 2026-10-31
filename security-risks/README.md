# Security risks

Keep short, actionable notes about security and reliability risks here. Record the affected flow, impact, and the mitigation or follow-up.

## Received friend requests

- Risk: accepting a caller-supplied user ID could expose another user's incoming requests.
- Mitigation: the endpoint uses only the ID attached by the Supabase token guard and returns the relationship IDs and status fields needed by the feature.
- Follow-up: authorization must remain server-derived if pagination, requester profile fields, or request actions are added.
