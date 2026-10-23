# Comeback note: avatar upload

When returning to the avatar upload flow, finish these items:

- Enforce a 5 MiB maximum upload size. The current presigned `PUT` URL does not enforce a reliable size limit; consider a presigned `POST` with an S3 `content-length-range` condition.
- Before confirming an upload, use S3 `HeadObject` to check the stored object's size and content type against the allowed limits.
- Do not trust client-supplied file properties. Save verified server-side values and the object key.
- If actual file format or image dimensions must be trusted, read and decode the uploaded file with an image parser; S3 metadata alone cannot verify them.
- Add unit tests for valid uploads and rejected oversized or disallowed objects, and update the avatar flow docs when implementing the changes.

See [user module notes](../users/user-module-notes.md#upload-size-and-object-verification) for the detailed size and verification guidance.
