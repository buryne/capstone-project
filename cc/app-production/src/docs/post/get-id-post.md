# Get Post by ID

Endpoint to retrieve information about a specific post.

### Endpoint

`GET /api/posts/:id`

- Replace `:id` with the actual post ID.

### Request

- Request parameters:
  - `id` (string): ID of the post to retrieve.

### Response

- **200 OK**:

  - Content-Type: `application/json`
  - Body:
    ```json
    {
      "id": "string",
      "title": "string",
      "location": "string",
      "image": "string",
      "caption": "string",
      "tags": ["string"],
      "create_at": {
        "_seconds": 0,
        "_nanoseconds": 0
      },
      "updateAt": {
        "_seconds": 0,
        "_nanoseconds": 0
      },
      "update_at": {
        "_seconds": 0,
        "_nanoseconds": 0
      },
      "userId": "string"
    }
    ```

- **404 Not Found**:
  - Content-Type: `application/json`
  - Body:
    ```json
    {
      "message": "string",
      "error": "string"
    }
    ```

### Example

**Request:**

```http
GET /api/posts/07r719qaQoFIb3L2T5LN
```

```json
{
  "id": "07r719qaQoFIb3L2T5LN",
  "title": "Marc Marquez Ducati",
  "location": "Spanyol",
  "caption": "Marc Marquez MoveDucati 2026",
  "image": "https://storage.googleapis.com/percobaan-dulu-2e8d8.appspot.com/images/1701440700536_marc-x-ducati.jpeg",
  "tags": ["cool", "motogp", "ducati", "repsol honda"],
  "create_at": {
    "_seconds": 1701440700,
    "_nanoseconds": 536000000
  },
  "updateAt": {
    "_seconds": 1702051375,
    "_nanoseconds": 761000000
  },
  "userId": "118235995435385156808"
}
```
