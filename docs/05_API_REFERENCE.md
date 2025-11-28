# Complete API Reference

## Base URL
```
http://localhost:8080
```

## Authentication
All protected endpoints require:
```
Authorization: Bearer {JWT_TOKEN}
```

---

## 🔐 Authentication Endpoints

### 1. Google OAuth Login
```
GET /oauth2/authorization/google
```
**Description**: Initiates Google OAuth 2.0 login flow

**Request**: None (redirect)

**Response**: Redirects to Google, then back to:
```
http://localhost:5173/oauth-callback?token={JWT_TOKEN}
```

---

### 2. Get Current User
```
GET /auth/user
```
**Description**: Get authenticated user information

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "picture": "https://lh3.googleusercontent.com/..."
}
```

**Response** (401 Unauthorized):
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 401,
  "message": "Unauthorized"
}
```

---

## 💰 Bill Management Endpoints

### 1. Create Bill
```
POST /bills/add-bill
```
**Description**: Create a new bill

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "description": "Tuition Fee",
  "amount": 50000.0,
  "billDate": "2024-01-15",
  "deadline": "2024-02-15"
}
```

**Validation Rules**:
- `description`: Required, not blank
- `amount`: Required, must be positive
- `billDate`: Required, valid date
- `deadline`: Required, valid date

**Response** (201 Created):
```json
{
  "billId": 5,
  "description": "Tuition Fee",
  "amount": 50000.0,
  "billDate": "2024-01-15",
  "deadline": "2024-02-15"
}
```

**Error Responses**:
- **400 Bad Request** (Validation Error):
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "message": "Validation failed",
  "errors": {
    "amount": "Amount must be positive",
    "description": "Description is required"
  }
}
```

---

### 2. Get All Bills
```
GET /bills/show-all-bills
```
**Description**: Retrieve all bills

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
[
  {
    "billId": 1,
    "description": "Tuition Fee",
    "amount": 50000.0,
    "billDate": "2024-01-15",
    "deadline": "2024-02-15"
  },
  {
    "billId": 2,
    "description": "Hostel Fee",
    "amount": 30000.0,
    "billDate": "2024-01-20",
    "deadline": "2024-02-20"
  }
]
```

---

### 3. Get Bill by ID
```
GET /bills/{billId}
```
**Description**: Get a specific bill by ID

**Path Parameters**:
- `billId` (Long): Bill ID

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "billId": 5,
  "description": "Tuition Fee",
  "amount": 50000.0,
  "billDate": "2024-01-15",
  "deadline": "2024-02-15"
}
```

**Error Response** (404 Not Found):
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 404,
  "message": "Bill not found with ID: 5"
}
```

---

### 4. Update Bill (Partial)
```
PATCH /bills/update-bill-details/{billId}
```
**Description**: Partially update a bill (only provided fields)

**Path Parameters**:
- `billId` (Long): Bill ID

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body** (all fields optional):
```json
{
  "description": "Updated Tuition Fee",
  "amount": 55000.0,
  "billDate": "2024-01-16",
  "deadline": "2024-02-16"
}
```

**Response** (200 OK):
```json
{
  "billId": 5,
  "description": "Updated Tuition Fee",
  "amount": 55000.0,
  "billDate": "2024-01-16",
  "deadline": "2024-02-16"
}
```

---

### 5. Delete Bill
```
DELETE /bills/delete-billid/{billId}
```
**Description**: Delete a bill and all its student assignments

**Path Parameters**:
- `billId` (Long): Bill ID

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "message": "Bill deleted from both bills table and student_bills table",
  "data": {
    "billId": 5
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 404,
  "message": "Bill not found with ID: 5"
}
```

---

## 👥 Student Bill Assignment Endpoints

### 1. Assign Bill to Student
```
POST /student-bills/assign-to-roll/{rollNumber}/{billId}
```
**Description**: Assign a bill to a specific student

**Path Parameters**:
- `rollNumber` (String): Student roll number
- `billId` (Long): Bill ID

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (201 Created):
```json
{
  "id": 10,
  "rollNumber": "CS2024001",
  "studentName": "John Doe",
  "studentEmail": "john@example.com",
  "billId": 5,
  "billDescription": "Tuition Fee",
  "billAmount": 50000.0,
  "billDate": "2024-01-15",
  "deadline": "2024-02-15"
}
```

**Error Responses**:
- **404 Not Found** (Student not found):
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 404,
  "message": "Student not found: CS2024001"
}
```

- **400 Bad Request** (Already assigned):
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "message": "Bill already assigned to student: CS2024001"
}
```

---

### 2. Assign Bill to Domain
```
POST /student-bills/assign-to-domain/{domain}/{billId}
```
**Description**: Assign a bill to all students in a domain

**Path Parameters**:
- `domain` (String): Domain name
- `billId` (Long): Bill ID

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (201 Created):
```json
[
  {
    "id": 10,
    "rollNumber": "CS2024001",
    "studentName": "John Doe",
    "billId": 5,
    "billDescription": "Tuition Fee",
    "billAmount": 50000.0,
    "billDate": "2024-01-15",
    "deadline": "2024-02-15"
  },
  {
    "id": 11,
    "rollNumber": "CS2024002",
    "studentName": "Jane Smith",
    "billId": 5,
    "billDescription": "Tuition Fee",
    "billAmount": 50000.0,
    "billDate": "2024-01-15",
    "deadline": "2024-02-15"
  }
]
```

**Error Responses**:
- **404 Not Found** (Domain not found):
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 404,
  "message": "Domain not found: Computer Science"
}
```

- **400 Bad Request** (No students):
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "message": "No students found in domain: Computer Science"
}
```

---

### 3. Get Student Bills
```
GET /student-bills/all-bills-of-roll/{rollNumber}
```
**Description**: Get all bills assigned to a student

**Path Parameters**:
- `rollNumber` (String): Student roll number

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
[
  {
    "id": 10,
    "rollNumber": "CS2024001",
    "studentName": "John Doe",
    "studentEmail": "john@example.com",
    "billId": 5,
    "billDescription": "Tuition Fee",
    "billAmount": 50000.0,
    "billDate": "2024-01-15",
    "deadline": "2024-02-15"
  }
]
```

---

### 4. Delete All Student Bills
```
DELETE /student-bills/delete-student-bill/{rollNumber}
```
**Description**: Delete all bill assignments for a student

**Path Parameters**:
- `rollNumber` (String): Student roll number

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "message": "Deleted all bills for student",
  "data": {
    "rollNumber": "CS2024001"
  }
}
```

---

### 5. Delete Specific Student Bill
```
DELETE /student-bills/delete-bill-of-roll/{rollNumber}/bill/{billId}
```
**Description**: Delete a specific bill assignment for a student

**Path Parameters**:
- `rollNumber` (String): Student roll number
- `billId` (Long): Bill ID

**Headers**:
```
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "message": "Deleted bill for student",
  "data": {
    "rollNumber": "CS2024001",
    "billId": 5
  }
}
```

---

## 🚨 Error Responses

### Standard Error Format
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "message": "Error message here"
}
```

### Validation Error Format
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "message": "Validation failed",
  "errors": {
    "fieldName": "Error message for this field",
    "anotherField": "Another error message"
  }
}
```

### HTTP Status Codes
- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Validation error or bad input
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Access denied
- **404 Not Found**: Resource not found
- **409 Conflict**: Data integrity violation (e.g., duplicate)
- **500 Internal Server Error**: Server error

---

## 📝 Request/Response Examples

### cURL Examples

#### Create Bill
```bash
curl -X POST http://localhost:8080/bills/add-bill \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Tuition Fee",
    "amount": 50000.0,
    "billDate": "2024-01-15",
    "deadline": "2024-02-15"
  }'
```

#### Get All Bills
```bash
curl -X GET http://localhost:8080/bills/show-all-bills \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Assign Bill to Student
```bash
curl -X POST http://localhost:8080/student-bills/assign-to-roll/CS2024001/5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔒 Security Notes

1. **All endpoints except OAuth require authentication**
2. **JWT tokens expire** - Handle 401 responses
3. **Finance email restriction** - Only `finance*` emails can access employee dashboard
4. **CORS enabled** - Only `http://localhost:5173` allowed

---

**Last Updated**: 2024
**Version**: 1.0.0

