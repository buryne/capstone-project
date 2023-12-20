# Delete Post by ID

Endpoint to delete an existing post. Only the user who created the post can delete it.

### Endpoint

`DELETE /api/posts/:id`

- Replace `:id` with the actual post ID.

### Request

- **Parameters**:
  - `id`: The ID of the post to be deleted.

### Response

- **200 OK**:

  - Content-Type: `application/json`
  - Body:
    ```json
    {
      "id": "string"
    }
    ```

- **403 Forbidden**:

  - Content-Type: `application/json`
  - Body:
    ```json
    {
      "error": "You do not have permission to delete this post."
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
DELETE /api/posts/07r719qaQoFIb3L2T5LN
```
