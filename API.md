# GreenEnergy AI - API Documentation

Base URL: `http://localhost:3000/api`

## Authentication

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "Nguyen Van A",
  "role": "tenant" // or "landlord"
}

Response: 201
{
  "user": {
    "id": "1",
    "email": "user@example.com",
    "name": "Nguyen Van A",
    "role": "tenant"
  },
  "token": "jwt_token_here"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200
{
  "user": {
    "id": "1",
    "email": "user@example.com",
    "name": "Nguyen Van A",
    "role": "tenant"
  },
  "token": "jwt_token_here"
}
```

### Get Profile
```http
GET /auth/profile
Authorization: Bearer {token}

Response: 200
{
  "id": "1",
  "email": "user@example.com",
  "name": "Nguyen Van A",
  "role": "tenant"
}
```

## Meter Readings

### Upload Meter Image
```http
POST /meter/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

image: [file]

Response: 200
{
  "reading": 1234.5,
  "confidence": 0.95,
  "id": "reading_id"
}
```

### Add Manual Reading
```http
POST /meter/manual
Authorization: Bearer {token}
Content-Type: application/json

{
  "value": 1234.5,
  "date": "2024-01-01"
}

Response: 200
{
  "reading": {
    "id": "reading_id",
    "userId": "user_id",
    "value": 1234.5,
    "method": "manual",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Readings
```http
GET /meter/readings
Authorization: Bearer {token}

Response: 200
{
  "readings": [
    {
      "id": "1",
      "userId": "user_id",
      "value": 1234.5,
      "method": "auto",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## Analytics

### Get Dashboard Stats
```http
GET /analytics/dashboard
Authorization: Bearer {token}

Response: 200
{
  "todayConsumption": 12.5,
  "monthlyEstimate": 30,
  "estimatedCost": 820000,
  "savings": 50,
  "savingsGoal": 120
}
```

### Get Consumption Chart
```http
GET /analytics/consumption?type=daily
Authorization: Bearer {token}

Query Parameters:
- type: "daily" | "monthly"

Response: 200
{
  "data": [
    {
      "date": "1/1",
      "value": 3.5
    }
  ]
}
```

### Get Tips
```http
GET /analytics/tips
Authorization: Bearer {token}

Response: 200
{
  "tips": [
    {
      "id": "1",
      "title": "Tắt Điều Hòa Khi Không Sử Dụng",
      "description": "Điều hòa tiêu thụ 30-40% tổng điện năng",
      "savings": "30%",
      "category": "cooling"
    }
  ]
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid input data"
}
```

### 401 Unauthorized
```json
{
  "error": "No token provided"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```
