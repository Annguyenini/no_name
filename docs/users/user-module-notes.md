# User module notes

## Avatar work to revisit

Avatar support is planned but deferred until the user returns to it. Profile creation should work without an avatar; the frontend starts the avatar flow only after profile creation succeeds. An avatar upload failure must not undo the profile, and the user should be able to retry.

### Proposed upload flow

1. The authenticated frontend requests one upload URL with `POST /users/avatar/upload-url` and sends:

   ```json
   {
     "content_type": "image/jpeg",
     "content_id": "content-uuid"
   }
   ```

2. The backend derives the user ID from the verified access token, creates a unique S3 object key under that user's folder, and returns:

   ```json
   {
     "upload_url": "https://s3-presigned-url...",
     "object_key": "avatars/user-uuid/content-uuid.jpg",
     "expires_in": 300
   }
   ```

3. The frontend uploads the file bytes directly to S3 with `PUT`, using the returned URL and matching `Content-Type`.
4. The frontend confirms the upload by sending the `object_key`. The backend verifies that the key belongs to the authenticated user and that the S3 object exists; it may also validate file type and size.
5. The backend stores the S3 object key, not the expiring upload URL, and returns the updated profile with an avatar reference. Use a stable URL for a public bucket or a presigned download URL for a private bucket.

### Decisions for implementation

- The current proposal uses `PATCH /users/update-avatar` to confirm and save the uploaded object key. The earlier draft used `POST` for this step; settle the method and final route when implementation begins.
- Decide how to clean up an uploaded object if confirmation fails, or configure an S3 lifecycle rule for unused avatar objects.
- Keep the upload limited to one media object per request.

### Upload size and object verification

- Set the maximum avatar size to **5 MiB** (`5 * 1024 * 1024` bytes) in the upload policy. A presigned `PUT` URL does not enforce a reliable maximum size; use a presigned `POST` with an S3 `content-length-range` condition, or upload through the backend if the limit must be enforced before storage.
- After upload, verify the object server-side with `HeadObject` before confirming it. Check `ContentLength` is within the allowed range and `ContentType` is an allowed image type; reject the confirmation if either check fails.
- S3 metadata does not verify the file's real format or image dimensions. If those matter, read and decode the object with an image parser (or scan/process it) before saving its properties.
- Save only verified server-side properties and the object key. Do not trust client-supplied size or content type as proof of the uploaded file.

For the implementation follow-up checklist, see [the avatar upload comeback note](../comeback/avatar-upload.md).
