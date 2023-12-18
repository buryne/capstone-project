# Get Users

Endpoint to retrieve information about all users.

### Endpoint

`GET /api/users`

### Request

No request body is required.

### Response

- **200 OK**:

  - Content-Type: `application/json`
  - Body:
    ```json
    {
      "users": [
        {
          "uid": "string",
          "displayName": "string",
          "email": "string",
          "photoURL": "string",
          "provider": "string",
          "verified": true,
          "accessToken": "string",
          "posts": ["string"]
        }
      ]
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

````http
GET /api/users

```
**Response:**

```json
{
  "users": [
    {
      "uid": "118235995435385156808",
      "displayName": "shigure yukikaze",
      "email": "shigurekawai@gmail.com",
      "photoURL": "https://lh3.googleusercontent.com/a/ACg8ocI_gZFdmdWJ_TG7OWLXtWKcB-qmxIBUmnHlDd3Db4XRAg=s96-c",
      "provider": "google",
      "verified": true,
      "accessToken": "ya29.a0AfB_byCkbswc0PllqVoYxr6onLqgi7umu_tndPHYSW4a5Rc9-RPGB2VYc2lpQfyznOjWH1UQjKOQh9X6HGuoGa5TjChBXp9Paqfb7wJ7Q8rewI1x_bRaAJxzrLZYsk1IPRC4vSMnAGTA822erClJlBwb3yWlWVhwdM8_aCgYKAdwSARASFQHGX2Mi9hA7pNmppFa7hTpZ00hFVw0171",
      "posts": [
        "07r719qaQoFIb3L2T5LN",
        "BeMkCHaJuKMPapaJKEvJ",
        "xYpJlcqsx9uLuGsKgYOf",
        "le3UPtRpnk1e2Ev2YSG7",
        "kAb1pKVjcs1bvS9Qnzqr",
        "qj7L8d05RFdYcDoJhZ0H",
        "77yT2woRUiBdq9n8W7Ig",
        "opyRC88GDXlmJZ6nlEVL",
        "Eqbe0tzdlsEQxlmtfRkh",
        "lFMUvTDbbZxjGZxE1QYQ",
        "tbjO8DhIKapk5OB8Wuzj"
      ]
    }
  ]
}
````

**Error Response:**

```json
{
  "message": "Something Error",
  "error": "Error message details"
}
```
