# Create a Post

Endpoint to create a new post.

### Endpoint

`POST /api/posts`

### Request

- **Headers**:

  - Content-Type: `multipart/form-data`

- **Body**:
  - `file`: Image file to be uploaded.
  - `title` (string): Title of the post.
  - `caption` (string): Caption for the post.
  - `tags` (array(string)): Comma-separated tags for the post.
  - `location` (string): Location information for the post.

### Response

- **200 OK**:

  - Content-Type: `application/json`
  - Body:
    ```json
    {
      "postId": "string",
      "data": {
        "id": "string",
        "title": "string",
        "caption": "string",
        "tags": ["string"],
        "image": "string",
        "location": "string",
        "update_at": {
          "_seconds": 0,
          "_nanoseconds": 0
        },
        "create_at": {
          "_seconds": 0,
          "_nanoseconds": 0
        }
      }
    }
    ```

- **500 Internal Server Error**:
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
POST /api/posts
Content-Type: multipart/form-data

title: Candi Borobudur
caption: Borobudur, also transcribed Barabudur is a 9th-century Mahayana Buddhist temple in Magelang Regency, not far from the city of Magelang and the town of Muntilan, in Central Java, Indonesia
tags: cool, awesome, jawa
location: Magelang, Jawa Tengah
file: [binary data]
```
