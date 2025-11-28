# Academic ERP System - Complete Technical Documentation

## 📋 Table of Contents

1. [System Integration Architecture](#system-integration-architecture)
2. [Frontend-Backend Connection](#frontend-backend-connection)
3. [Database Schema and Relationships](#database-schema-and-relationships)
4. [Spring Framework Core Concepts](#spring-framework-core-concepts)
5. [Dependency Injection and IoC](#dependency-injection-and-ioc)
6. [Spring Annotations Explained](#spring-annotations-explained)
7. [JPA and Hibernate Concepts](#jpa-and-hibernate-concepts)
8. [Security Architecture](#security-architecture)
9. [Request Processing Pipeline](#request-processing-pipeline)
10. [Data Persistence Flow](#data-persistence-flow)

---

## 🔗 System Integration Architecture

### Complete System Integration Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                                  │
│                  http://localhost:5173                              │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  React Application (Frontend)                                 │  │
│  │  - React Components (UI)                                      │  │
│  │  - React Router (Navigation)                                  │  │
│  │  - Context API (State Management)                             │  │
│  │  - API Service Layer (HTTP Communication)                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                    HTTP/REST Protocol
                    JSON Data Format
                    Authorization: Bearer Token
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│              NETWORK LAYER (HTTP/HTTPS)                             │
│  - TCP/IP Connection                                                │
│  - HTTP Request/Response                                            │
│  - CORS Headers                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│              SPRING BOOT APPLICATION (Backend)                       │
│              http://localhost:8080                                  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Spring Security Filter Chain                                 │  │
│  │  - Authentication Filter                                      │  │
│  │  - Authorization Filter                                      │  │
│  │  - CORS Filter                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  DispatcherServlet (Front Controller)                         │  │
│  │  - Routes requests to appropriate controllers                │  │
│  │  - Handles exception mapping                                 │  │
│  │  - Manages view resolution                                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Controller Layer                                            │  │
│  │  - @RestController                                           │  │
│  │  - Request mapping                                          │  │
│  │  - DTO validation                                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Service Layer                                               │  │
│  │  - Business Logic                                            │  │
│  │  - Transaction Management                                    │  │
│  │  - Exception Handling                                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Repository Layer (Spring Data JPA)                          │  │
│  │  - Entity Management                                         │  │
│  │  - Query Generation                                          │  │
│  │  - Transaction Management                                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Hibernate ORM                                                │  │
│  │  - Object-Relational Mapping                                 │  │
│  │  - SQL Generation                                            │  │
│  │  - Connection Pooling                                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                    JDBC Protocol
                    SQL Queries
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    DATABASE (MySQL)                                  │
│              localhost:3306/ESDPROJECT                              │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Tables:                                                     │  │
│  │  - bills                                                     │  │
│  │  - student                                                   │  │
│  │  - student_bills (Junction Table)                           │  │
│  │  - domain                                                    │  │
│  │  - department                                                │  │
│  │  - employee                                                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔌 Frontend-Backend Connection

### 1. Connection Mechanism

#### HTTP/REST Communication

**Protocol**: HTTP/HTTPS over TCP/IP
**Data Format**: JSON (JavaScript Object Notation)
**Port**: Frontend (5173) → Backend (8080)

#### Connection Flow

```
Frontend (React)                    Backend (Spring Boot)
     │                                      │
     │ 1. User Action                      │
     │    (Button Click)                   │
     │                                      │
     │ 2. API Service Call                 │
     │    api.ts → addBill()               │
     │                                      │
     │ 3. HTTP Request                     │
     │    POST /bills/add-bill             │
     │    Headers:                         │
     │    - Content-Type: application/json │
     │    - Authorization: Bearer {token}  │
     │    Body: { description, amount... } │
     │──────────────────────────────────────>│
     │                                      │ 4. Spring Security
     │                                      │    Validates Token
     │                                      │
     │                                      │ 5. DispatcherServlet
     │                                      │    Routes to Controller
     │                                      │
     │                                      │ 6. Controller Processing
     │                                      │    Validates DTO
     │                                      │    Calls Service
     │                                      │
     │                                      │ 7. Service Layer
     │                                      │    Business Logic
     │                                      │    Calls Repository
     │                                      │
     │                                      │ 8. Repository Layer
     │                                      │    Generates SQL
     │                                      │    Executes Query
     │                                      │
     │                                      │ 9. Database
     │                                      │    Executes SQL
     │                                      │    Returns Data
     │                                      │
     │ 10. HTTP Response                   │
     │     Status: 201 Created             │
     │     Body: { billId, description... }│
     │<──────────────────────────────────────│
     │                                      │
     │ 11. Update UI                        │
     │     setState()                      │
     │     Show Success Message            │
```

### 2. API Service Layer (Frontend)

**Location**: `frontend/src/services/api.ts`

#### How It Works

```typescript
// Base Configuration
const API_BASE_URL = "http://localhost:8080";

// Token Management
const getAuthToken = (): string | null => {
  return localStorage.getItem("token");
};

// Generic API Call Function
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  // Create headers with authentication
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  
  // Make HTTP request
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  // Handle authentication errors
  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  
  // Handle other errors
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  // Parse and return JSON response
  return response.json();
};

// Specific API Functions
export const addBill = async (bill: BillRequest): Promise<BillResponse> => {
  return apiCall("/bills/add-bill", {
    method: "POST",
    body: JSON.stringify(bill),
  });
};
```

#### Key Features

1. **Centralized Configuration**: Single base URL
2. **Automatic Token Management**: Adds token to all requests
3. **Error Handling**: Handles 401, network errors
4. **Type Safety**: TypeScript types for requests/responses

### 3. CORS Configuration (Backend)

**Location**: `Backend/project/src/main/java/com/esd/project/Config/SecurityConfig.java`

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    
    // Allow credentials (cookies, auth headers)
    config.setAllowCredentials(true);
    
    // Allowed origins (frontend URLs)
    config.setAllowedOriginPatterns(List.of(
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ));
    
    // Allowed headers
    config.setAllowedHeaders(List.of("*"));
    
    // Allowed HTTP methods
    config.setAllowedMethods(List.of(
        "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
    ));
    
    UrlBasedCorsConfigurationSource source = 
        new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
}
```

**Why CORS is Needed**:
- Browser security policy (Same-Origin Policy)
- Frontend (5173) and Backend (8080) are different origins
- CORS allows cross-origin requests with proper headers

---

## 🗄️ Database Schema and Relationships

### Complete Database Schema

```sql
-- Bills Table
CREATE TABLE bills (
    bill_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    description VARCHAR(255) NOT NULL,
    amount DOUBLE NOT NULL,
    bill_date DATE NOT NULL,
    deadline DATE NOT NULL
);

-- Domain Table
CREATE TABLE domain (
    domain_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    domain_name VARCHAR(255) UNIQUE NOT NULL
);

-- Student Table
CREATE TABLE student (
    student_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    domain BIGINT NOT NULL,
    FOREIGN KEY (domain) REFERENCES domain(domain_id)
);

-- Student_Bills Junction Table (Many-to-Many)
CREATE TABLE student_bills (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    bill_id BIGINT NOT NULL,
    FOREIGN KEY (student_id) REFERENCES student(student_id),
    FOREIGN KEY (bill_id) REFERENCES bills(bill_id),
    UNIQUE KEY unique_student_bill (student_id, bill_id)
);

-- Department Table
CREATE TABLE department (
    department_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    department_name VARCHAR(255) UNIQUE NOT NULL
);

-- Employee Table
CREATE TABLE employee (
    employee_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    photo_path VARCHAR(500),
    department_id BIGINT NOT NULL,
    FOREIGN KEY (department_id) REFERENCES department(department_id)
);
```

### Entity Relationship Diagram (ERD)

```
┌─────────────┐         ┌──────────────┐
│   Domain    │         │   Student    │
│─────────────│         │──────────────│
│ domain_id   │◄───────│ student_id   │
│ domain_name │   1:N   │ roll_number  │
└─────────────┘         │ name         │
                       │ email        │
                       │ domain (FK)   │
                       └──────┬───────┘
                              │
                              │ N
                              │
                       ┌──────▼────────┐
                       │ student_bills │
                       │──────────────│
                       │ id           │
                       │ student_id(FK)│
                       │ bill_id (FK)  │
                       └──────┬───────┘
                              │
                              │ N
                              │
                       ┌──────▼──────┐
                       │    Bills    │
                       │─────────────│
                       │ bill_id     │
                       │ description │
                       │ amount      │
                       │ bill_date   │
                       │ deadline    │
                       └─────────────┘

┌──────────────┐         ┌─────────────┐
│  Department  │         │  Employee   │
│──────────────│         │─────────────│
│ department_id│◄────────│ employee_id │
│ dept_name    │   1:N   │ first_name  │
└──────────────┘         │ last_name   │
                         │ email       │
                         │ title       │
                         │ photo_path  │
                         │ dept_id (FK)│
                         └─────────────┘
```

### Relationship Types Explained

#### 1. One-to-Many (1:N)

**Example**: Domain → Student
- One domain can have many students
- Each student belongs to one domain
- Implemented with foreign key in `student` table

**JPA Mapping**:
```java
// In Domain entity
@OneToMany(mappedBy = "domain")
private List<Student> students;

// In Student entity
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "domain", nullable = false)
private Domain domain;
```

#### 2. Many-to-Many (N:M)

**Example**: Student ↔ Bills
- One student can have many bills
- One bill can be assigned to many students
- Requires junction table: `student_bills`

**JPA Mapping**:
```java
// In StudentBills entity (Junction Table)
@Entity
public class StudentBills {
    @Id
    @GeneratedValue
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;
    
    @ManyToOne
    @JoinColumn(name = "bill_id")
    private Bills bill;
}
```

**Why Junction Table?**
- Prevents data duplication
- Allows additional fields (e.g., assignment date)
- Maintains referential integrity

#### 3. Foreign Key Constraints

**Purpose**: Maintain referential integrity

**Example**:
```sql
FOREIGN KEY (domain) REFERENCES domain(domain_id)
```

**What It Does**:
- Prevents inserting student with non-existent domain
- Prevents deleting domain if students reference it
- Ensures data consistency

---

## 🏛️ Spring Framework Core Concepts

### What is Spring Framework?

**Spring Framework** is a comprehensive Java application framework that provides:
- **Dependency Injection (IoC)**: Inversion of Control container
- **Aspect-Oriented Programming (AOP)**: Cross-cutting concerns
- **Data Access**: Database integration
- **Web Framework**: MVC pattern for web applications
- **Security**: Authentication and authorization

### Spring Boot

**Spring Boot** is an extension of Spring Framework that:
- Provides auto-configuration
- Embedded servers (Tomcat)
- Production-ready features
- Convention over configuration

---

## 🔄 Dependency Injection and IoC

### Inversion of Control (IoC) Theory

#### Traditional Approach (Without IoC)

```java
// Traditional: Object creates its own dependencies
public class BillsService {
    private BillsRepository repository;
    
    public BillsService() {
        // Service creates its own dependency
        this.repository = new BillsRepository();
    }
}
```

**Problems**:
- Tight coupling
- Hard to test
- Difficult to swap implementations
- Object manages its own dependencies

#### IoC Approach (With Spring)

```java
// IoC: Dependencies are injected from outside
@Service
public class BillsService {
    private final BillsRepository repository;
    
    // Constructor injection - Spring provides the dependency
    public BillsService(BillsRepository repository) {
        this.repository = repository; // Injected by Spring
    }
}
```

**Benefits**:
- Loose coupling
- Easy to test (can inject mock objects)
- Flexible (can swap implementations)
- Spring manages object lifecycle

### How IoC Works in This Project

#### 1. Spring Container (ApplicationContext)

**Location**: `ProjectApplication.java`

```java
@SpringBootApplication
public class ProjectApplication {
    public static void main(String[] args) {
        // Spring creates ApplicationContext (IoC Container)
        SpringApplication.run(ProjectApplication.class, args);
        
        // Container manages all beans:
        // - Controllers
        // - Services
        // - Repositories
        // - Configuration beans
    }
}
```

**What Happens**:
1. Spring scans for `@Component`, `@Service`, `@Repository`, `@Controller`
2. Creates instances (beans) of these classes
3. Detects dependencies (constructor parameters)
4. Injects dependencies automatically
5. Manages bean lifecycle

#### 2. Dependency Injection Types

##### Constructor Injection (Recommended)

```java
@Service
public class BillsService {
    private final BillsRepository billsRepository;
    private final StudentBillsRepository studentBillsRepository;
    
    // Constructor injection - Spring automatically provides dependencies
    public BillsService(
            BillsRepository billsRepository,
            StudentBillsRepository studentBillsRepository) {
        this.billsRepository = billsRepository;
        this.studentBillsRepository = studentBillsRepository;
    }
}
```

**Why Constructor Injection?**
- Required dependencies are explicit
- Immutable (final fields)
- Easy to test
- Spring's recommended approach

##### Field Injection (Not Recommended)

```java
@Service
public class BillsService {
    @Autowired
    private BillsRepository billsRepository; // Not recommended
}
```

**Why Not Recommended?**
- Hidden dependencies
- Hard to test
- Not immutable

#### 3. Dependency Graph in This Project

```
ApplicationContext (Spring Container)
│
├── BillsController
│   └── depends on → BillsService
│
├── BillsService
│   ├── depends on → BillsRepository
│   └── depends on → StudentBillsRepository
│
├── StudentBillsController
│   └── depends on → StudentBillsService
│
├── StudentBillsService
│   ├── depends on → StudentBillsRepository
│   ├── depends on → StudentRepository
│   ├── depends on → BillsRepository
│   └── depends on → DomainRepository
│
└── Repositories (Spring Data JPA creates automatically)
    ├── BillsRepository
    ├── StudentRepository
    ├── StudentBillsRepository
    └── DomainRepository
```

**Spring's Injection Process**:
1. Spring creates repository beans first (no dependencies)
2. Then creates service beans (inject repositories)
3. Finally creates controller beans (inject services)
4. All done automatically!

---

## 🏷️ Spring Annotations Explained

### Component Annotations

#### @Component
**Purpose**: Marks a class as a Spring-managed component

```java
@Component
public class GoogleUserMapper {
    // Spring will create an instance of this class
    // and manage its lifecycle
}
```

**When to Use**: Generic Spring component

#### @Service
**Purpose**: Marks a class as a service layer component

```java
@Service
public class BillsService {
    // Indicates this is a service layer class
    // Spring creates instance and manages it
}
```

**When to Use**: Business logic classes

#### @Repository
**Purpose**: Marks a class as a data access component

```java
@Repository
public interface BillsRepository extends JpaRepository<Bills, Long> {
    // Spring Data JPA creates implementation automatically
    // Handles database exceptions
}
```

**When to Use**: Data access interfaces/classes

#### @Controller / @RestController
**Purpose**: Marks a class as a web controller

```java
@RestController  // @Controller + @ResponseBody
@RequestMapping("/bills")
public class BillsController {
    // Handles HTTP requests
    // Returns JSON responses
}
```

**Difference**:
- `@Controller`: Returns view names (for MVC)
- `@RestController`: Returns data directly (for REST APIs)

### Dependency Injection Annotations

#### @Autowired
**Purpose**: Injects dependencies automatically

```java
@Service
public class BillsService {
    @Autowired
    private BillsRepository repository; // Spring injects this
}
```

**Note**: Constructor injection is preferred over `@Autowired` on fields

#### @RequiredArgsConstructor (Lombok)
**Purpose**: Generates constructor for final fields

```java
@Service
@RequiredArgsConstructor  // Lombok generates constructor
public class BillsService {
    private final BillsRepository repository;
    // Constructor automatically created:
    // public BillsService(BillsRepository repository) {
    //     this.repository = repository;
    // }
}
```

### Request Mapping Annotations

#### @RequestMapping
**Purpose**: Maps HTTP requests to controller methods

```java
@RestController
@RequestMapping("/bills")  // Base path for all methods
public class BillsController {
    // All methods will have /bills prefix
}
```

#### @GetMapping, @PostMapping, @PutMapping, @DeleteMapping, @PatchMapping
**Purpose**: Specific HTTP method mappings

```java
@GetMapping("/show-all-bills")  // GET /bills/show-all-bills
public ResponseEntity<List<BillResponse>> getAllBills() { }

@PostMapping("/add-bill")  // POST /bills/add-bill
public ResponseEntity<BillResponse> addBill(@RequestBody BillRequest request) { }

@PatchMapping("/update-bill-details/{billId}")  // PATCH /bills/update-bill-details/5
public ResponseEntity<BillResponse> updateBill(@PathVariable Long billId) { }
```

### Parameter Annotations

#### @RequestBody
**Purpose**: Binds HTTP request body to method parameter

```java
@PostMapping("/add-bill")
public ResponseEntity<BillResponse> addBill(
        @RequestBody BillRequest request) {
    // Spring deserializes JSON body to BillRequest object
    // {
    //   "description": "Tuition Fee",
    //   "amount": 50000
    // } → BillRequest object
}
```

**Process**:
1. HTTP request body contains JSON
2. Spring uses Jackson to deserialize JSON
3. Creates BillRequest object
4. Passes to method parameter

#### @PathVariable
**Purpose**: Extracts path variable from URL

```java
@GetMapping("/{billId}")
public ResponseEntity<BillResponse> getBillById(
        @PathVariable Long billId) {
    // URL: /bills/5
    // billId = 5
}
```

#### @RequestParam
**Purpose**: Extracts query parameter from URL

```java
@GetMapping("/search")
public ResponseEntity<List<BillResponse>> search(
        @RequestParam String keyword) {
    // URL: /bills/search?keyword=tuition
    // keyword = "tuition"
}
```

### Validation Annotations

#### @Valid
**Purpose**: Triggers validation on object

```java
@PostMapping("/add-bill")
public ResponseEntity<BillResponse> addBill(
        @Valid @RequestBody BillRequest request) {
    // @Valid triggers validation annotations in BillRequest
    // If validation fails, returns 400 Bad Request
}
```

**Validation Annotations in DTO**:
```java
public class BillRequest {
    @NotBlank(message = "Description is required")
    private String description;
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private Double amount;
}
```

### Transaction Annotations

#### @Transactional
**Purpose**: Manages database transactions

```java
@Transactional
public BillResponse updateBillPartially(Long billId, BillUpdateRequest request) {
    // All database operations in this method are in one transaction
    // If any operation fails, all changes are rolled back
    Bills existing = billsRepository.findById(billId).orElseThrow();
    BillMapper.updateEntityFromRequest(existing, request);
    return BillMapper.toResponse(billsRepository.save(existing));
}
```

**What It Does**:
- Starts transaction before method
- Commits transaction after method (if successful)
- Rolls back transaction if exception occurs
- Ensures data consistency

### Configuration Annotations

#### @Configuration
**Purpose**: Marks class as configuration source

```java
@Configuration
public class SecurityConfig {
    // Spring processes this class for configuration
}
```

#### @Bean
**Purpose**: Defines a Spring-managed bean

```java
@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        // Spring will call this method
        // Create and manage SecurityFilterChain bean
        return http.build();
    }
}
```

### Exception Handling Annotations

#### @ControllerAdvice
**Purpose**: Global exception handler

```java
@ControllerAdvice
public class GlobalExceptionHandler {
    // Handles exceptions from all controllers
    // Provides consistent error responses
}
```

#### @ExceptionHandler
**Purpose**: Handles specific exception types

```java
@ExceptionHandler(ResourceNotFoundException.class)
public ResponseEntity<Map<String, Object>> handleResourceNotFound(
        ResourceNotFoundException ex) {
    // Handles ResourceNotFoundException from any controller
    return buildResponse(ex.getMessage(), HttpStatus.NOT_FOUND);
}
```

---

## 🗃️ JPA and Hibernate Concepts

### What is JPA?

**JPA (Java Persistence API)** is a specification for:
- Object-Relational Mapping (ORM)
- Database operations
- Entity management

### What is Hibernate?

**Hibernate** is an implementation of JPA that:
- Maps Java objects to database tables
- Generates SQL queries automatically
- Manages database connections
- Handles transactions

### Entity Mapping

#### @Entity
**Purpose**: Marks class as JPA entity (maps to database table)

```java
@Entity
@Table(name = "bills")
public class Bills {
    // Maps to 'bills' table in database
}
```

#### @Table
**Purpose**: Specifies table name

```java
@Table(name = "bills")  // Table name in database
public class Bills {
    // If not specified, uses class name (Bills → bills)
}
```

#### @Id
**Purpose**: Marks field as primary key

```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long billId;
```

#### @GeneratedValue
**Purpose**: Specifies how primary key is generated

**Strategies**:
- `GenerationType.IDENTITY`: Auto-increment (MySQL)
- `GenerationType.SEQUENCE`: Database sequence
- `GenerationType.TABLE`: Table-based generation

#### @Column
**Purpose**: Maps field to database column

```java
@Column(name = "bill_date", nullable = false)
private LocalDate billDate;
```

**Attributes**:
- `name`: Column name in database
- `nullable`: Can be null?
- `unique`: Must be unique?
- `length`: Maximum length

### Relationship Mapping

#### @ManyToOne
**Purpose**: Many-to-one relationship

```java
@Entity
public class StudentBills {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;
    
    // Many StudentBills can reference one Student
    // Foreign key: student_id in student_bills table
}
```

**FetchType**:
- `LAZY`: Load when accessed (default, recommended)
- `EAGER`: Load immediately (can cause N+1 problem)

#### @OneToMany
**Purpose**: One-to-many relationship

```java
@Entity
public class Domain {
    @OneToMany(mappedBy = "domain")
    private List<Student> students;
    
    // One Domain can have many Students
    // mappedBy: field name in Student entity
}
```

#### @JoinColumn
**Purpose**: Specifies foreign key column

```java
@ManyToOne
@JoinColumn(name = "student_id", nullable = false)
private Student student;
// Creates foreign key: student_id → student.student_id
```

### Spring Data JPA

#### Repository Interface

```java
public interface BillsRepository extends JpaRepository<Bills, Long> {
    // Spring Data JPA automatically provides:
    // - save(entity)
    // - findById(id)
    // - findAll()
    // - deleteById(id)
    // - count()
    // - existsById(id)
}
```

**How It Works**:
1. Spring creates proxy implementation at runtime
2. Generates SQL queries from method names
3. Executes queries via Hibernate
4. Returns entity objects

#### Query Method Naming

```java
public interface StudentRepository extends JpaRepository<Student, Long> {
    // Spring generates: SELECT * FROM student WHERE roll_number = ?
    Student findByRollNumber(String rollNumber);
    
    // Spring generates: SELECT * FROM student WHERE domain_id = ?
    List<Student> findByDomain_DomainId(Long domainId);
    
    // Spring generates: SELECT * FROM student WHERE email = ? AND name = ?
    Student findByEmailAndName(String email, String name);
}
```

**Naming Convention**:
- `findBy` + FieldName
- `findBy` + FieldName + `And` + AnotherField
- `findBy` + EntityName + `_` + FieldName (for relationships)

### Hibernate Session and Entity Lifecycle

#### Entity States

1. **Transient**: New object, not in database
   ```java
   Bills bill = new Bills(); // Transient
   ```

2. **Persistent**: Managed by Hibernate, in database
   ```java
   Bills saved = repository.save(bill); // Persistent
   ```

3. **Detached**: Was persistent, no longer managed
   ```java
   // After transaction ends, entity becomes detached
   ```

4. **Removed**: Marked for deletion
   ```java
   repository.delete(bill); // Removed
   ```

---

## 🔐 Security Architecture

### Spring Security Filter Chain

```
HTTP Request
    │
    ▼
┌─────────────────────────────────────┐
│ 1. SecurityContextPersistenceFilter │
│    - Loads security context         │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 2. UsernamePasswordAuthenticationFilter│
│    - Handles form login             │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 3. OAuth2LoginAuthenticationFilter │
│    - Handles OAuth2 login           │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 4. AuthorizationFilter              │
│    - Checks permissions             │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 5. ExceptionTranslationFilter       │
│    - Handles security exceptions    │
└─────────────────────────────────────┘
    │
    ▼
Controller
```

### OAuth2 Flow in Detail

```
1. User clicks "Sign in with Google"
   └─> Frontend redirects to: /oauth2/authorization/google

2. Spring Security OAuth2
   └─> Redirects to Google OAuth
   └─> URL: https://accounts.google.com/o/oauth2/v2/auth
       ?client_id=...
       &redirect_uri=http://localhost:8080/login/oauth2/code/google
       &response_type=code
       &scope=email profile

3. User authenticates with Google
   └─> Google validates credentials
   └─> Redirects back with authorization code

4. Backend receives code
   └─> Exchanges code for access token
   └─> Uses access token to get user info
   └─> Creates OAuth2User object

5. OAuth2SuccessHandler
   └─> Extracts user info (name, email, picture)
   └─> Stores in session
   └─> Redirects to frontend with token

6. Frontend receives token
   └─> Stores in localStorage
   └─> Uses for subsequent API calls
```

### Session Management

```java
// Storing in session
request.getSession().setAttribute("userEmail", email);
request.getSession().setAttribute("userName", name);
request.getSession().setAttribute("userPicture", picture);

// Retrieving from session
String email = (String) request.getSession().getAttribute("userEmail");
```

---

## 🔄 Request Processing Pipeline

### Complete Request Lifecycle

```
1. HTTP Request Arrives
   POST /bills/add-bill
   Headers: Authorization: Bearer {token}
   Body: JSON

2. Servlet Container (Tomcat)
   └─> Receives request
   └─> Passes to DispatcherServlet

3. DispatcherServlet (Front Controller)
   └─> Determines handler (controller method)
   └─> Applies interceptors
   └─> Invokes handler

4. Handler Method (Controller)
   └─> @Valid triggers validation
   └─> @RequestBody deserializes JSON
   └─> Calls service method

5. Service Method
   └─> Business logic
   └─> Uses mapper to convert DTO → Entity
   └─> Calls repository

6. Repository Method
   └─> Spring Data JPA generates SQL
   └─> Hibernate executes query
   └─> Returns entity

7. Response Flow
   └─> Entity → Mapper → DTO
   └─> Controller returns ResponseEntity
   └─> Spring serializes to JSON
   └─> HTTP Response sent
```

### DispatcherServlet Responsibilities

1. **Request Mapping**: Routes to correct controller
2. **View Resolution**: Resolves view names (for MVC)
3. **Exception Handling**: Maps exceptions to error views
4. **Model Binding**: Binds request parameters to objects

---

## 💾 Data Persistence Flow

### Saving Entity to Database

```
1. Service calls repository.save(entity)
   └─> BillsService.addBill()
       └─> billsRepository.save(bill)

2. Spring Data JPA receives call
   └─> Checks if entity is new or existing
   └─> If new: INSERT
   └─> If existing: UPDATE

3. Hibernate generates SQL
   └─> INSERT INTO bills (description, amount, bill_date, deadline)
       VALUES (?, ?, ?, ?)

4. JDBC executes SQL
   └─> PreparedStatement with parameters
   └─> Executes on database connection

5. Database processes
   └─> Validates constraints
   └─> Generates ID (auto-increment)
   └─> Inserts row
   └─> Returns generated ID

6. Hibernate updates entity
   └─> Sets billId with generated value
   └─> Entity becomes persistent

7. Transaction commits
   └─> Changes are permanent
   └─> Entity becomes detached
```

### Fetching Data from Database

```
1. Service calls repository.findById(id)
   └─> BillsService.getBillById(5L)

2. Spring Data JPA generates SQL
   └─> SELECT * FROM bills WHERE bill_id = ?

3. Hibernate executes query
   └─> JDBC PreparedStatement
   └─> Executes on database

4. Database returns result set
   └─> Row data: (5, "Tuition Fee", 50000.0, ...)

5. Hibernate maps to entity
   └─> Creates Bills object
   └─> Sets all fields
   └─> Returns entity

6. Service converts to DTO
   └─> BillMapper.toResponse(entity)
   └─> Returns BillResponse DTO
```

---

## 🎯 Key Technical Concepts Summary

### 1. IoC Container
- Spring manages object creation and dependencies
- Objects don't create their own dependencies
- Dependencies are injected from outside
- Enables loose coupling and testability

### 2. Dependency Injection
- Constructor injection (recommended)
- Spring automatically provides dependencies
- No manual object creation needed
- Enables easy testing with mocks

### 3. Annotations
- Metadata for Spring framework
- Tell Spring how to handle classes
- Reduce boilerplate code
- Enable declarative programming

### 4. JPA/Hibernate
- Maps Java objects to database tables
- Generates SQL automatically
- Manages entity lifecycle
- Handles relationships

### 5. Spring Data JPA
- Automatic repository implementation
- Query generation from method names
- Reduces boilerplate code
- Type-safe database access

### 6. Transaction Management
- @Transactional ensures data consistency
- All-or-nothing operations
- Automatic rollback on errors
- ACID properties

---

## 📚 Additional Resources

### Spring Framework Documentation
- Official Spring Docs: https://spring.io/docs
- Spring Boot Reference: https://docs.spring.io/spring-boot/docs/current/reference/html/

### JPA/Hibernate Documentation
- JPA Specification: https://jakarta.ee/specifications/persistence/
- Hibernate Docs: https://hibernate.org/orm/documentation/

### React Documentation
- React Docs: https://react.dev/
- React Router: https://reactrouter.com/

---

**Last Updated**: 2024
**Version**: 1.0.0

