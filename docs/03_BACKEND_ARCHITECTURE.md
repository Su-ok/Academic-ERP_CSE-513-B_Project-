# Backend Architecture - Complete Guide

## 📁 Project Structure

```
Backend/project/src/main/java/com/esd/project/
├── Config/                      # Configuration Classes
│   ├── SecurityConfig.java     # Spring Security configuration
│   └── OAuth2SuccessHandler.java # OAuth callback handler
│
├── Controller/                  # REST Controllers (API Endpoints)
│   ├── AuthController.java     # Authentication endpoints
│   ├── BillsController.java    # Bill management endpoints
│   └── StudentBillsController.java # Student bill endpoints
│
├── Service/                     # Business Logic Layer
│   ├── BillsService.java       # Bill business logic
│   └── StudentBillsService.java # Student bill business logic
│
├── Repository/                  # Data Access Layer
│   ├── BillsRepository.java    # Bill database operations
│   ├── StudentRepository.java  # Student database operations
│   ├── StudentBillsRepository.java
│   ├── DomainRepository.java
│   ├── DepartmentRepository.java
│   └── EmployeeRepository.java
│
├── Entity/                      # JPA Entities (Database Models)
│   ├── Bills.java
│   ├── Student.java
│   ├── StudentBills.java
│   ├── Domain.java
│   ├── Department.java
│   └── Employee.java
│
├── DTO/                         # Data Transfer Objects
│   ├── Request/                 # Request DTOs
│   │   ├── BillRequest.java
│   │   └── BillUpdateRequest.java
│   └── Response/                # Response DTOs
│       ├── BillResponse.java
│       ├── StudentBillResponse.java
│       ├── UserResponse.java
│       └── MessageResponse.java
│
├── Mapper/                      # Entity ↔ DTO Converters
│   ├── BillMapper.java
│   ├── StudentBillMapper.java
│   └── UserMapper.java
│
├── Exception/                   # Custom Exceptions
│   ├── ResourceNotFoundException.java
│   ├── BusinessException.java
│   └── GlobalExceptionHandler.java
│
└── ProjectApplication.java     # Spring Boot Main Class
```

---

## 🏗️ Architecture Layers

### 1. Controller Layer

**Purpose**: Handle HTTP requests and responses

**Responsibilities**:
- Receive HTTP requests
- Validate input using DTOs
- Call service layer
- Return DTOs as JSON responses
- Handle HTTP status codes

**Example: BillsController.java**
```java
@RestController
@RequestMapping("/bills")
public class BillsController {
    
    private final BillsService billsService;
    
    @PostMapping("/add-bill")
    public ResponseEntity<BillResponse> addBill(
            @Valid @RequestBody BillRequest request) {
        return ResponseEntity.status(201)
                .body(billsService.addBill(request));
    }
    
    @GetMapping("/show-all-bills")
    public ResponseEntity<List<BillResponse>> getAllBills() {
        return ResponseEntity.ok(billsService.getAllBills());
    }
}
```

**Key Annotations**:
- `@RestController`: Marks as REST controller
- `@RequestMapping`: Base URL path
- `@PostMapping`, `@GetMapping`, etc.: HTTP methods
- `@Valid`: Triggers validation on DTO
- `@RequestBody`: Deserializes JSON to DTO
- `@PathVariable`: Extracts path variables

---

### 2. Service Layer

**Purpose**: Business logic and orchestration

**Responsibilities**:
- Implement business rules
- Use mappers to convert DTOs ↔ Entities
- Call repository layer
- Handle transactions
- Throw custom exceptions

**Example: BillsService.java**
```java
@Service
public class BillsService {
    
    private final BillsRepository billsRepository;
    
    public BillResponse addBill(BillRequest request) {
        // Convert DTO to Entity
        Bills bill = BillMapper.toEntity(request);
        
        // Save to database
        Bills savedBill = billsRepository.save(bill);
        
        // Convert Entity to DTO
        return BillMapper.toResponse(savedBill);
    }
    
    @Transactional
    public BillResponse updateBillPartially(
            Long billId, 
            BillUpdateRequest request) {
        // Find existing bill
        Bills existing = billsRepository.findById(billId)
                .orElseThrow(() -> 
                    new ResourceNotFoundException("Bill not found"));
        
        // Update fields
        BillMapper.updateEntityFromRequest(existing, request);
        
        // Save and return
        Bills updated = billsRepository.save(existing);
        return BillMapper.toResponse(updated);
    }
}
```

**Key Features**:
- `@Service`: Marks as Spring service
- `@Transactional`: Manages database transactions
- Exception handling
- Business rule validation

---

### 3. Repository Layer

**Purpose**: Database access abstraction

**Technology**: Spring Data JPA

**Responsibilities**:
- Generate SQL queries automatically
- Execute database operations
- Return entity objects
- Handle relationships

**Example: BillsRepository.java**
```java
public interface BillsRepository 
        extends JpaRepository<Bills, Long> {
    // Spring Data JPA automatically provides:
    // - save()
    // - findById()
    // - findAll()
    // - deleteById()
    // - etc.
}
```

**Custom Query Methods**:
```java
public interface StudentRepository 
        extends JpaRepository<Student, Long> {
    
    // Spring generates: SELECT * FROM student WHERE roll_number = ?
    Student findByRollNumber(String rollNumber);
    
    // Spring generates: SELECT * FROM student WHERE domain_id = ?
    List<Student> findByDomain_DomainId(Long domainId);
}
```

**Key Features**:
- Automatic query generation from method names
- Custom queries with `@Query` annotation
- Pagination and sorting support
- Transaction management

---

### 4. Entity Layer

**Purpose**: Database table mapping

**Technology**: JPA/Hibernate

**Example: Bills.java**
```java
@Entity
@Table(name = "bills")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Bills {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long billId;
    
    @Column(nullable = false)
    private String description;
    
    @Column(nullable = false)
    private Double amount;
    
    @Column(name = "bill_date", nullable = false)
    private LocalDate billDate;
    
    @Column(nullable = false)
    private LocalDate deadline;
}
```

**Key Annotations**:
- `@Entity`: Marks as JPA entity
- `@Table`: Maps to database table
- `@Id`: Primary key
- `@GeneratedValue`: Auto-increment
- `@Column`: Column mapping
- `@ManyToOne`, `@OneToMany`: Relationships

**Relationships Example: StudentBills.java**
```java
@Entity
public class StudentBills {
    
    @Id
    @GeneratedValue
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bill_id")
    private Bills bill;
}
```

---

### 5. DTO Layer

**Purpose**: Separate API contracts from database entities

**Benefits**:
- API versioning
- Data validation
- Security (hide internal structure)
- Performance (fetch only needed fields)

**Request DTO Example: BillRequest.java**
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BillRequest {
    
    @NotBlank(message = "Description is required")
    private String description;
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private Double amount;
    
    @NotNull(message = "Bill date is required")
    private LocalDate billDate;
    
    @NotNull(message = "Deadline is required")
    private LocalDate deadline;
}
```

**Response DTO Example: BillResponse.java**
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BillResponse {
    private Long billId;
    private String description;
    private Double amount;
    private LocalDate billDate;
    private LocalDate deadline;
}
```

---

### 6. Mapper Layer

**Purpose**: Convert between DTOs and Entities

**Example: BillMapper.java**
```java
public class BillMapper {
    
    // DTO → Entity
    public static Bills toEntity(BillRequest request) {
        Bills bill = new Bills();
        bill.setDescription(request.getDescription());
        bill.setAmount(request.getAmount());
        bill.setBillDate(request.getBillDate());
        bill.setDeadline(request.getDeadline());
        return bill;
    }
    
    // Entity → DTO
    public static BillResponse toResponse(Bills bill) {
        if (bill == null) return null;
        return new BillResponse(
                bill.getBillId(),
                bill.getDescription(),
                bill.getAmount(),
                bill.getBillDate(),
                bill.getDeadline()
        );
    }
    
    // Update Entity from DTO
    public static void updateEntityFromRequest(
            Bills existing, 
            BillUpdateRequest request) {
        if (request.getDescription() != null) {
            existing.setDescription(request.getDescription());
        }
        // ... other fields
    }
}
```

---

## 🔐 Security Architecture

### SecurityConfig.java

**Purpose**: Configure Spring Security

**Key Features**:
- OAuth2 login configuration
- CORS configuration
- Route protection
- Session management

```java
@Configuration
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/oauth2/**", "/login/**", "/error")
                    .permitAll()
                .requestMatchers("/auth/user")
                    .authenticated()
                .anyRequest()
                    .authenticated()
            )
            .oauth2Login(oauth -> oauth
                .successHandler(oAuth2SuccessHandler)
            );
        return http.build();
    }
}
```

### OAuth2SuccessHandler.java

**Purpose**: Handle OAuth callback

**Flow**:
1. Receive OAuth2User from Google
2. Extract user info (name, email, picture)
3. Store in session
4. Redirect to frontend with token

```java
@Component
public class OAuth2SuccessHandler 
        extends SimpleUrlAuthenticationSuccessHandler {
    
    @Override
    public void onAuthenticationSuccess(...) {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String email = oauth2User.getAttribute("email");
        
        // Store in session
        request.getSession().setAttribute("userEmail", email);
        
        // Redirect to frontend
        String redirectUrl = "http://localhost:5173/oauth-callback?token=" + token;
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
```

---

## 🛡️ Exception Handling

### GlobalExceptionHandler.java

**Purpose**: Centralized exception handling

**Features**:
- Custom exception handlers
- Consistent error responses
- Validation error details
- Production-safe error messages

```java
@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFound(
            ResourceNotFoundException ex) {
        return buildResponse(ex.getMessage(), HttpStatus.NOT_FOUND);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        FieldError::getDefaultMessage
                ));
        
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", LocalDateTime.now());
        error.put("status", HttpStatus.BAD_REQUEST.value());
        error.put("message", "Validation failed");
        error.put("errors", errors);
        
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }
}
```

**Exception Types Handled**:
- `ResourceNotFoundException` → 404
- `BusinessException` → 400
- `DataIntegrityViolationException` → 409
- `MethodArgumentNotValidException` → 400
- `HttpMessageNotReadableException` → 400
- `AccessDeniedException` → 403
- Generic `Exception` → 500

---

## 🔄 Request Processing Flow

### Complete Flow: POST /bills/add-bill

```
1. HTTP Request Arrives
   POST /bills/add-bill
   Headers: Authorization: Bearer {token}
   Body: { "description": "...", "amount": 50000, ... }

2. Spring Security Filter
   └─> Validates token
   └─> Checks authentication
   └─> Allows request if valid

3. Controller Layer (BillsController)
   └─> @PostMapping("/add-bill") receives request
   └─> @Valid triggers validation on BillRequest
   └─> If valid, calls billsService.addBill(request)

4. Service Layer (BillsService)
   └─> addBill() method:
       ├─> BillMapper.toEntity(request) → Bills entity
       ├─> billsRepository.save(bill)
       └─> BillMapper.toResponse(savedBill) → BillResponse

5. Repository Layer (BillsRepository)
   └─> Spring Data JPA:
       ├─> Generates SQL: INSERT INTO bills ...
       ├─> Executes via Hibernate
       └─> Returns saved entity with ID

6. Database (MySQL)
   └─> Executes INSERT statement
   └─> Returns generated ID

7. Response Flow (Reverse)
   └─> Entity → Mapper → DTO → Controller → JSON Response
   └─> HTTP 201 Created
   └─> Body: { "billId": 5, "description": "...", ... }
```

---

## 📊 Database Relationships

### Entity Relationships

```
Bills (1) ────< (Many) StudentBills (Many) >─── (1) Student
                                                      │
                                                      │ ManyToOne
                                                      ▼
                                                   Domain
```

**StudentBills** is a junction table representing:
- Many students can have many bills
- Many bills can be assigned to many students

### JPA Relationship Mapping

```java
// In StudentBills entity
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "student_id")
private Student student;

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "bill_id")
private Bills bill;
```

**FetchType.LAZY**: Load related entities only when accessed
**FetchType.EAGER**: Load immediately (not recommended for performance)

---

## 🔧 Configuration Files

### application.properties

**Location**: `src/main/resources/application.properties`

**Key Configurations**:
```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/ESDPROJECT
spring.datasource.username=root
spring.datasource.password=admin

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# OAuth2
spring.security.oauth2.client.registration.google.client-id=...
spring.security.oauth2.client.registration.google.client-secret=...
```

---

## 🎯 Design Patterns Used

### 1. Layered Architecture
- **Controller** → **Service** → **Repository** → **Database**
- Clear separation of concerns
- Easy to test and maintain

### 2. DTO Pattern
- Separate API contracts from entities
- Better security and versioning

### 3. Repository Pattern
- Abstract database access
- Easy to swap databases

### 4. Mapper Pattern
- Clean conversion logic
- Reusable transformations

### 5. Exception Handling Pattern
- Centralized error handling
- Consistent error responses

---

## 📚 Next Steps

1. **Read**: `04_DATA_FLOW.md` - Detailed data flow examples
2. **Read**: `05_API_REFERENCE.md` - Complete API documentation
3. **Read**: `06_SETUP_GUIDE.md` - Setup instructions

---

**Last Updated**: 2024
**Version**: 1.0.0

