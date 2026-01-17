# Academic ERP System - Complete System Overview

## 🎯 System Purpose

The Academic ERP (Enterprise Resource Planning) system is a comprehensive web application designed for IIITB (International Institute of Information Technology Bangalore) to manage:
- **Employee Authentication** via Google OAuth 2.0
- **Bill Management** (Create, Read, Update, Delete)
- **Student Bill Assignment** (Assign bills to individual students or entire domains)

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER (Browser)                               │
│                    http://localhost:5173                            │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + TypeScript)                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Pages: Login, Employee Dashboard, Bills Management          │  │
│  │  Services: API calls, Authentication                         │  │
│  │  Context: Global state management                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                    HTTP/REST API (JSON)
                    Authorization: Bearer Token
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  BACKEND (Spring Boot + Java)                        │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Controllers: Handle HTTP requests                           │  │
│  │  Services: Business logic                                    │  │
│  │  Repositories: Database access                               │  │
│  │  DTOs: Data Transfer Objects                                 │  │
│  │  Mappers: Entity ↔ DTO conversion                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                    JPA/Hibernate ORM
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DATABASE (MySQL)                               │
│  Tables: bills, student_bills, student, domain, employee, etc.      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Technology Stack

### Frontend
- **Framework**: React 19.2 with TypeScript
- **Routing**: React Router DOM 6.30
- **Styling**: Tailwind CSS 4.1
- **Build Tool**: Vite 7.2
- **State Management**: React Context API

### Backend
- **Framework**: Spring Boot 4.0
- **Language**: Java 17
- **ORM**: Spring Data JPA / Hibernate
- **Security**: Spring Security + OAuth 2.0
- **Database**: MySQL
- **Validation**: Jakarta Validation

### Database
- **Type**: MySQL
- **Database Name**: erp
- **Connection**: JDBC via HikariCP connection pool

---

## 🔄 Complete Request Flow: User Action to Database

### Example: Adding a New Bill

```
1. USER ACTION
   └─> User fills form in "Add Bill" page
       - Description: "Tuition Fee"
       - Amount: 50000
       - Bill Date: 2024-01-15
       - Deadline: 2024-02-15
       └─> Clicks "Submit" button

2. FRONTEND VALIDATION
   └─> React component validates:
       ✓ All fields filled
       ✓ Amount > 0
       ✓ Deadline > Bill Date
       └─> If valid, proceed to API call

3. API SERVICE LAYER (api.ts)
   └─> addBill() function called
       ├─> Gets JWT token from localStorage
       ├─> Creates request body (JSON)
       ├─> Sets headers:
       │   - Content-Type: application/json
       │   - Authorization: Bearer {token}
       └─> POST request to: http://localhost:8080/bills/add-bill

4. NETWORK LAYER
   └─> HTTP Request sent over network
       └─> Reaches Spring Boot backend on port 8080

5. SPRING SECURITY
   └─> SecurityConfig intercepts request
       ├─> Checks for Authorization header
       ├─> Validates JWT token
       └─> If valid, allows request to proceed

6. CONTROLLER LAYER (BillsController.java)
   └─> @PostMapping("/add-bill") method receives request
       ├─> @Valid annotation triggers validation
       ├─> BillRequest DTO created from JSON body
       └─> Calls BillsService.addBill(request)

7. SERVICE LAYER (BillsService.java)
   └─> addBill() method:
       ├─> Uses BillMapper.toEntity() to convert DTO → Entity
       ├─> Creates Bills entity object
       └─> Calls BillsRepository.save(bill)

8. REPOSITORY LAYER (BillsRepository.java)
   └─> Spring Data JPA repository
       ├─> Hibernate generates SQL:
       │   INSERT INTO bills (description, amount, bill_date, deadline)
       │   VALUES ('Tuition Fee', 50000, '2024-01-15', '2024-02-15')
       └─> Executes SQL via JDBC

9. DATABASE LAYER (MySQL)
   └─> Receives SQL INSERT statement
       ├─> Validates constraints
       ├─> Inserts row into `bills` table
       ├─> Generates auto-increment ID (e.g., billId = 5)
       └─> Returns success

10. RESPONSE FLOW (Reverse)
    └─> Database → Repository → Service → Mapper → Controller
        ├─> Bill entity retrieved with ID
        ├─> BillMapper.toResponse() converts Entity → DTO
        ├─> BillResponse DTO created
        └─> JSON response sent back:
            {
              "billId": 5,
              "description": "Tuition Fee",
              "amount": 50000.0,
              "billDate": "2024-01-15",
              "deadline": "2024-02-15"
            }

11. FRONTEND RECEIVES RESPONSE
    └─> API service receives JSON
        ├─> Parses response
        ├─> Updates React state
        ├─> Shows success message
        └─> Resets form
```

---

## 🔐 Authentication Flow

```
1. USER CLICKS "Sign in with Google"
   └─> Login.tsx component
       └─> handleGoogleLogin() function
           └─> window.location.href = "http://localhost:8080/oauth2/authorization/google"

2. BACKEND OAUTH HANDLER (OAuth2SuccessHandler.java)
   └─> Spring Security OAuth2 flow:
       ├─> Redirects to Google OAuth
       ├─> User authenticates with Google
       ├─> Google redirects back with authorization code
       ├─> Backend exchanges code for user info
       ├─> Extracts: name, email, picture
       ├─> Stores in session
       └─> Redirects to: http://localhost:5173/oauth-callback?token=JWT_TOKEN

3. FRONTEND CALLBACK (AuthCallback.tsx)
   └─> Component receives token in URL
       ├─> Extracts token from query parameter
       ├─> Stores in localStorage
       └─> Calls getCurrentUser() API

4. USER INFO REQUEST
   └─> GET /auth/user
       ├─> AuthController.java receives request
       ├─> Gets OAuth2User from session
       ├─> UserMapper.toResponse() converts to DTO
       └─> Returns UserResponse:
           {
             "name": "John Doe",
             "email": "john@example.com",
             "picture": "https://..."
           }

5. AUTHENTICATION STATE
   └─> AuthContext.tsx updates:
       ├─> setUser(userData)
       ├─> setIsAuthenticated(true)
       └─> Redirects to /employee dashboard
```

---

## 📊 Data Models

### Database Tables

#### `bills` Table
```sql
CREATE TABLE bills (
    bill_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    description VARCHAR(255) NOT NULL,
    amount DOUBLE NOT NULL,
    bill_date DATE NOT NULL,
    deadline DATE NOT NULL
);
```

#### `student` Table
```sql
CREATE TABLE student (
    student_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    domain BIGINT NOT NULL,
    FOREIGN KEY (domain) REFERENCES domain(domain_id)
);
```

#### `student_bills` Table (Junction Table)
```sql
CREATE TABLE student_bills (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    bill_id BIGINT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES student(student_id),
    FOREIGN KEY (bill_id) REFERENCES bills(bill_id),
    UNIQUE KEY (student_id, bill_id)
);
```

### Entity Classes (Backend)

#### Bills Entity
```java
@Entity
public class Bills {
    @Id
    @GeneratedValue
    private Long billId;
    private String description;
    private Double amount;
    private LocalDate billDate;
    private LocalDate deadline;
}
```

#### StudentBills Entity (Many-to-Many Relationship)
```java
@Entity
public class StudentBills {
    @Id
    @GeneratedValue
    private Long id;
    
    @ManyToOne
    private Student student;
    
    @ManyToOne
    private Bills bill;
}
```

---

## 🔄 Data Flow Layers

### 1. Presentation Layer (Frontend)
- **Components**: React components that render UI
- **State Management**: React hooks (useState, useEffect)
- **API Calls**: Service layer functions

### 2. API Layer (Frontend Service)
- **Location**: `src/services/api.ts`
- **Purpose**: Centralized HTTP communication
- **Features**: Token management, error handling, request formatting

### 3. Controller Layer (Backend)
- **Location**: `com.esd.project.Controller.*`
- **Purpose**: Handle HTTP requests/responses
- **Responsibilities**:
  - Receive HTTP requests
  - Validate input (via DTOs)
  - Call service layer
  - Return DTOs as JSON

### 4. Service Layer (Backend)
- **Location**: `com.esd.project.Service.*`
- **Purpose**: Business logic
- **Responsibilities**:
  - Process business rules
  - Use mappers to convert DTOs ↔ Entities
  - Call repository layer
  - Handle exceptions

### 5. Repository Layer (Backend)
- **Location**: `com.esd.project.Repository.*`
- **Purpose**: Database access
- **Technology**: Spring Data JPA
- **Responsibilities**:
  - Generate SQL queries
  - Execute database operations
  - Return entity objects

### 6. Database Layer
- **Technology**: MySQL
- **Purpose**: Data persistence
- **Operations**: INSERT, SELECT, UPDATE, DELETE

---

## 🛡️ Security Flow

```
1. User Request
   └─> Includes: Authorization: Bearer {JWT_TOKEN}

2. Spring Security Filter Chain
   └─> SecurityConfig.java
       ├─> Validates token
       ├─> Checks user permissions
       └─> Allows/denies request

3. Controller Method
   └─> @AuthenticationPrincipal OAuth2User
       └─> Provides user context

4. Service Layer
   └─> Can access authenticated user info
       └─> Enforces business rules
```

---

## 📝 Key Design Patterns

### 1. DTO Pattern
- **Purpose**: Separate API contracts from database entities
- **Location**: `com.esd.project.DTO.*`
- **Benefits**: 
  - API versioning
  - Data validation
  - Security (hide internal structure)

### 2. Mapper Pattern
- **Purpose**: Convert between DTOs and Entities
- **Location**: `com.esd.project.Mapper.*`
- **Benefits**:
  - Clean separation
  - Reusable conversion logic
  - Easy to test

### 3. Repository Pattern
- **Purpose**: Abstract database access
- **Location**: `com.esd.project.Repository.*`
- **Benefits**:
  - Easy to test
  - Database-agnostic code
  - Automatic query generation

### 4. Service Layer Pattern
- **Purpose**: Encapsulate business logic
- **Location**: `com.esd.project.Service.*`
- **Benefits**:
  - Reusable logic
  - Transaction management
  - Business rule enforcement

---

## 🎯 System Features

### 1. Authentication & Authorization
- ✅ Google OAuth 2.0 login
- ✅ JWT token management
- ✅ Session-based user info
- ✅ Finance email restriction
- ✅ Auto-logout on token expiry

### 2. Bill Management
- ✅ Create bills with validation
- ✅ View all bills with search
- ✅ Update bills (partial updates)
- ✅ Delete bills (cascade delete)

### 3. Student Bill Assignment
- ✅ Assign bill to individual student
- ✅ Assign bill to entire domain
- ✅ View student bills
- ✅ Delete student bill assignments

### 4. Error Handling
- ✅ Global exception handler
- ✅ Validation error messages
- ✅ User-friendly error responses
- ✅ Production-safe error messages

---

## 📚 Next Steps

1. **Read**: `02_FRONTEND_ARCHITECTURE.md` - Frontend structure
2. **Read**: `03_BACKEND_ARCHITECTURE.md` - Backend structure
3. **Read**: `04_DATA_FLOW.md` - Detailed data flow examples
4. **Read**: `05_API_REFERENCE.md` - Complete API documentation
5. **Read**: `06_SETUP_GUIDE.md` - Setup and installation

---

**Last Updated**: 2024
**Version**: 1.0.0

