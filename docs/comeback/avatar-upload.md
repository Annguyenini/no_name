# Comeback note: avatar upload

Avatar upload verification now uses the shared contents repository. When returning to the flow, finish these items:

- **Access control:** `GET /users/avatar?user_id=<uuid>` currently allows any authenticated user to request another user's avatar URL. Decide whether avatars are public; if not, restrict this route to the owner (and explicitly authorized admins). A generated presigned URL remains usable by anyone holding it until it expires.
- Enforce a 5 MiB maximum upload size. The current presigned `PUT` URL does not enforce a reliable size limit; consider a presigned `POST` with an S3 `content-length-range` condition.
- Before confirming an upload, the contents repository uses S3 `HeadObject` to check the stored object's size and content type against the allowed limits.
- Creating a presigned `GET` URL does not check whether the object exists. If the API should reject missing objects, call `HeadObject` first; a request to the signed URL for a missing key can return `404` (or `403`, depending on permissions and bucket settings).
- Do not trust client-supplied file properties. Save verified server-side values and the object key.
- If actual file format or image dimensions must be trusted, read and decode the uploaded file with an image parser; S3 metadata alone cannot verify them.
- Unit tests cover successful verification and rejected oversized, disallowed, or unowned uploads; keep them and the avatar flow docs current.

See [user module notes](../users/user-module-notes.md#upload-size-and-object-verification) for the detailed size and verification guidance.
