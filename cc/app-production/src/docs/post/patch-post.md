# Update Post

Endpoint to update an existing post. Only the user who created the post can update it.

### Endpoint

`PUT /api/posts/:id`

- Replace `:id` with the actual post ID.

### Request

- **Headers**:
  - Content-Type: `multipart/form-data`
- **Parameters**:

  - `id`: The ID of the post to be updated.

- **Body**:
  - `title` (string): Updated title of the post.
  - `caption` (string): Updated caption for the post.
  - `location` (string): Updated location information for the post.
  - `tags` (string): Updated comma-separated tags for the post.
  - `file` (optional): New image file to be uploaded.

### Response

- **200 OK**:

  - Content-Type: `application/json`
  - Body:
    ```json
    {
      "message": "string"
    }
    ```

- **403 Forbidden**:

  - Content-Type: `application/json`
  - Body:
    ```json
    {
      "error": "You do not have permission to edit this post."
    }
    ```

- **404 Not Found**:

  - Content-Type: `application/json`
  - Body:
    ```json
    {
      "error": "Post not found."
    }
    ```

- **500 Internal Server Error**:
  - Content-Type: `application/json`
  - Body:
    ```json
    {
      "error": "string"
    }
    ```

### Example

**Request:**

```http
PUT /api/posts/07r719qaQoFIb3L2T5LN
Content-Type: multipart/form-data

file: [binary data]
title: Updated Title
caption: Updated Caption
location: Updated Location
tags: updated, tags
```
