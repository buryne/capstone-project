## Get Posts

Endpoint get all for posts.

### Endpoint

`GET /api/posts`

### Request

No request body is required.

### Response

- **200 OK**:

  - Content-Type: `application/json`
  - Body:
    ```json
    {
      "posts": [
        {
          "id": "string",
          "title": "string",
          "image": "string",
          "location": "string",
          "tags": ["string"],
          "caption": "string",
          "update_at": {
            "_seconds": 0,
            "_nanoseconds": 0
          },
          "create_at": {
            "_seconds": 0,
            "_nanoseconds": 0
          },
          "updatedAt": {
            "_seconds": 0,
            "_nanoseconds": 0
          },
          "user": {
            "displayName": "string",
            "email": "string",
            "photoURL": "string",
            "uid": "string"
          }
        }
      ],
      "loggedInUser": {
        "displayName": "string",
        "email": "string",
        "photoURL": "string",
        "uid": "string"
      }
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

- if user logged in show user data in `loggedInUser` field else `null`

**Request:**

```http
GET /api/posts
```

**Response:**

```json
{
  "posts": [
    {
      "id": "lFMUvTDbbZxjGZxE1QYQ",
      "title": "Candi Borobudur",
      "caption": "Borobudur, also transcribed Barabudur is a 9th-century Mahayana Buddhist temple in Magelang Regency, not far from the city of Magelang and the town of Muntilan, in Central Java, Indonesia",
      "location": "Inggris",
      "image": "https://storage.googleapis.com/percobaan-dulu-2e8d8.appspot.com/images/1702306512166_lewis-hamilton-mercedes-1.jpg",
      "tags": ["cool", "awesome", "jawa"],
      "update_at": {
        "_seconds": 1702306512,
        "_nanoseconds": 166000000
      },
      "create_at": {
        "_seconds": 1702306512,
        "_nanoseconds": 166000000
      },
      "updatedAt": {
        "_seconds": 1702306672,
        "_nanoseconds": 231000000
      },
      "user": {
        "displayName": "Rafi Ahmad",
        "email": "rafiahmad@gmail.com",
        "photoURL": "https://lh3.googleusercontent.com/a/ACg8ocI_gZFdmdWJ_TG7OWLXtWKcB-qmxIBUmnHlDd3Db4XRAg=s96-c",
        "uid": "118235995435385156808"
      }
    }
  ],
  "loggedInUser": {
    "displayName": "Rafi Ahmad",
    "email": "rafiahmad@gmail.com",
    "photoURL": "ttps://lh3.googleusercontent.com/a/ACg8ocI_gZFdmdWJ_TG7OWLXtWKcB-qmxIBUmnHlDd3Db4XRAg=s96-c",
    "uid": "118235995435385156808"
  }
}
```
