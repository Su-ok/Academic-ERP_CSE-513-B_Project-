# Complete Code Reference - What Each File Contains

## 📋 Table of Contents

1. [Backend Code Reference](#backend-code-reference)
   - [Controllers](#controllers)
   - [Services](#services)
   - [Repositories](#repositories)
   - [Entities](#entities)
   - [DTOs](#dtos)
   - [Mappers](#mappers)
   - [Configuration](#configuration)
   - [Exception Handling](#exception-handling)
2. [Frontend Code Reference](#frontend-code-reference)
   - [Pages](#pages)
   - [Services](#services-1)
   - [Context](#context)
   - [Components](#components)
3. [Configuration Files](#configuration-files)

---

## 🔷 Backend Code Reference

### Controllers

#### `Backend/project/src/main/java/com/esd/project/Controller/BillsController.java`

**Purpose**: Handles all HTTP requests related to bill management

**Logic Contains**:
- **addBill()** - POST `/bills/add-bill`
  - Receives BillRequest DTO
  - Validates request (@Valid)
  - Calls BillsService.addBill()
  - Returns BillResponse with 201 Created status

- **getAllBills()** - GET `/bills/show-all-bills`
  - Calls BillsService.getAllBills()
  - Returns List<BillResponse> with 200 OK

- **getBillById()** - GET `/bills/{billId}`
  - Extracts billId from URL path
  - Calls BillsService.getBillById()
  - Returns BillResponse with 200 OK

- **updateBillPartially()** - PATCH `/bills/update-bill-details/{billId}`
  - Extracts billId from URL path
  - Receives BillUpdateRequest DTO
  - Validates request (@Valid)
  - Calls BillsService.updateBillPartially()
  - Returns BillResponse with 200 OK

- **deleteBill()** - DELETE `/bills/delete-bill/{billId}`
  - Extracts billId from URL path
  - Calls BillsService.deleteBill()
  - Returns MessageResponse with 200 OK

**Dependencies**: BillsService

**Input**: HTTP requests, DTOs (BillRequest, BillUpdateRequest)

**Output**: ResponseEntity with DTOs (BillResponse, MessageResponse)

---

#### `Backend/project/src/main/java/com/esd/project/Controller/StudentBillsController.java`

**Purpose**: Handles HTTP requests for student bill assignments

**Logic Contains**:
- **assignBillToStudent()** - POST `/student-bills/assign-to-roll/{rollNumber}/{billId}`
  - Extracts rollNumber and billId from URL path
  - Calls StudentBillsService.assignBillToStudent()
  - Returns StudentBillResponse with 201 Created

- **assignBillToDomain()** - POST `/student-bills/assign-to-domain/{domainId}/{billId}`
  - Extracts domainId and billId from URL path
  - Calls StudentBillsService.assignBillToDomain()
  - Returns List<StudentBillResponse> with 201 Created

- **getAllStudentBills()** - GET `/student-bills/show-all-student-bills`
  - Calls StudentBillsService.getAllStudentBills()
  - Returns List<StudentBillResponse> with 200 OK

- **getStudentBillsByRollNumber()** - GET `/student-bills/show-student-bills/{rollNumber}`
  - Extracts rollNumber from URL path
  - Calls StudentBillsService.getStudentBillsByRollNumber()
  - Returns List<StudentBillResponse> with 200 OK

- **deleteStudentBill()** - DELETE `/student-bills/delete-student-bill/{id}`
  - Extracts id from URL path
  - Calls StudentBillsService.deleteStudentBill()
  - Returns MessageResponse with 200 OK

- **deleteSpecificBill()** - DELETE `/student-bills/delete-specific-bill/{rollNumber}/{billId}`
  - Extracts rollNumber and billId from URL path
  - Calls StudentBillsService.deleteSpecificBill()
  - Returns MessageResponse with 200 OK

**Dependencies**: StudentBillsService

**Input**: HTTP requests, path variables (rollNumber, billId, domainId)

**Output**: ResponseEntity with DTOs (StudentBillResponse, MessageResponse)

---

#### `Backend/project/src/main/java/com/esd/project/Controller/AuthController.java`

**Purpose**: Handles authentication-related requests

**Logic Contains**:
- **currentUser()** - GET `/auth/user`
  - Gets OAuth2User from Spring Security context
  - Converts to UserResponse DTO using UserMapper
  - Returns UserResponse with 200 OK

**Dependencies**: UserMapper

**Input**: OAuth2User from session

**Output**: ResponseEntity<UserResponse>

---

### Services

#### `Backend/project/src/main/java/com/esd/project/Service/BillsService.java`

**Purpose**: Contains business logic for bill operations

**Logic Contains**:
- **addBill(BillRequest request)**
  - Converts BillRequest DTO to Bills entity using BillMapper.toEntity()
  - Saves entity to database via BillsRepository.save()
  - Converts saved entity back to BillResponse DTO using BillMapper.toResponse()
  - Returns BillResponse

- **getAllBills()**
  - Retrieves all bills from database via BillsRepository.findAll()
  - Converts each entity to DTO using BillMapper.toResponse()
  - Returns List<BillResponse>

- **getBillById(Long billId)**
  - Finds bill by ID via BillsRepository.findById()
  - Throws ResourceNotFoundException if not found
  - Converts entity to DTO using BillMapper.toResponse()
  - Returns BillResponse

- **updateBillPartially(Long billId, BillUpdateRequest request)** (@Transactional)
  - Starts database transaction
  - Finds existing bill by ID
  - Throws ResourceNotFoundException if not found
  - Updates entity fields from request using BillMapper.updateEntityFromRequest()
  - Saves updated entity
  - Converts to DTO
  - Commits transaction
  - Returns BillResponse

- **deleteBill(Long billId)** (@Transactional)
  - Starts database transaction
  - Finds bill by ID (throws exception if not found)
  - Deletes all associated student bills first via StudentBillsRepository.deleteByBill_BillId()
  - Deletes the bill via BillsRepository.deleteById()
  - Commits transaction

**Dependencies**: BillsRepository, StudentBillsRepository, BillMapper

**Input**: DTOs (BillRequest, BillUpdateRequest), Long (billId)

**Output**: DTOs (BillResponse), void (for delete)

---

#### `Backend/project/src/main/java/com/esd/project/Service/StudentBillsService.java`

**Purpose**: Contains business logic for student bill assignments

**Logic Contains**:
- **assignBillToStudent(String rollNumber, Long billId)** (@Transactional)
  - Starts transaction
  - Finds student by rollNumber (throws exception if not found)
  - Finds bill by billId (throws exception if not found)
  - Checks for duplicate assignment (throws BusinessException if exists)
  - Creates new StudentBills entity
  - Sets student and bill references
  - Saves entity
  - Converts to DTO using StudentBillMapper.toResponse()
  - Commits transaction
  - Returns StudentBillResponse

- **assignBillToDomain(Long domainId, Long billId)** (@Transactional)
  - Starts transaction
  - Finds domain by ID (throws exception if not found)
  - Finds bill by ID (throws exception if not found)
  - Retrieves all students in domain via StudentRepository.findByDomain_DomainId()
  - For each student:
    - Checks for duplicate assignment
    - Creates StudentBills entity
    - Saves assignment
  - Converts all to DTOs
  - Commits transaction
  - Returns List<StudentBillResponse>

- **getAllStudentBills()**
  - Retrieves all student bills via StudentBillsRepository.findAll()
  - Converts each to DTO using StudentBillMapper.toResponse()
  - Returns List<StudentBillResponse>

- **getStudentBillsByRollNumber(String rollNumber)**
  - Finds student by rollNumber (throws exception if not found)
  - Retrieves student bills via StudentBillsRepository.findByStudent_StudentId()
  - Converts to DTOs
  - Returns List<StudentBillResponse>

- **deleteStudentBill(Long id)** (@Transactional)
  - Starts transaction
  - Finds StudentBills by ID (throws exception if not found)
  - Deletes via StudentBillsRepository.deleteById()
  - Commits transaction

- **deleteSpecificBill(String rollNumber, Long billId)** (@Transactional)
  - Starts transaction
  - Finds student by rollNumber
  - Finds bill by billId
  - Finds StudentBills by student and bill
  - Deletes if found
  - Commits transaction

**Dependencies**: StudentBillsRepository, StudentRepository, BillsRepository, DomainRepository, StudentBillMapper

**Input**: String (rollNumber), Long (billId, domainId, id)

**Output**: DTOs (StudentBillResponse), List<StudentBillResponse>, void

---

### Repositories

#### `Backend/project/src/main/java/com/esd/project/Repository/BillsRepository.java`

**Purpose**: Database access interface for Bills entity

**Logic Contains**:
- Extends JpaRepository<Bills, Long>
- Inherits methods: save(), findById(), findAll(), deleteById(), count(), existsById()
- Spring Data JPA automatically generates SQL queries

**Methods Available**:
- `save(Bills bill)` - INSERT or UPDATE
- `findById(Long id)` - SELECT WHERE bill_id = ?
- `findAll()` - SELECT * FROM bills
- `deleteById(Long id)` - DELETE WHERE bill_id = ?

**Input**: Bills entities, Long (ID)

**Output**: Bills entities, Optional<Bills>, List<Bills>

---

#### `Backend/project/src/main/java/com/esd/project/Repository/StudentRepository.java`

**Purpose**: Database access interface for Student entity

**Logic Contains**:
- Extends JpaRepository<Student, Long>
- Custom query method: `findByRollNumber(String rollNumber)`
  - Spring generates: SELECT * FROM student WHERE roll_number = ?

**Methods Available**:
- `findByRollNumber(String rollNumber)` - Custom query
- `findByDomain_DomainId(Long domainId)` - Find students by domain
- Standard JPA methods: save(), findById(), findAll(), etc.

**Input**: String (rollNumber), Long (ID, domainId)

**Output**: Student entities, Optional<Student>, List<Student>

---

#### `Backend/project/src/main/java/com/esd/project/Repository/StudentBillsRepository.java`

**Purpose**: Database access interface for StudentBills entity

**Logic Contains**:
- Extends JpaRepository<StudentBills, Long>
- Custom query methods:
  - `existsByStudentAndBill(Student student, Bills bill)` - Check duplicate
  - `findByStudent_StudentId(Long studentId)` - Find bills for student
  - `deleteByBill_BillId(Long billId)` - Delete all assignments for a bill

**Methods Available**:
- `existsByStudentAndBill(...)` - Checks if assignment exists
- `findByStudent_StudentId(...)` - Gets all bills for a student
- `deleteByBill_BillId(...)` - Deletes all assignments for a bill
- Standard JPA methods

**Input**: StudentBills entities, Student, Bills, Long (IDs)

**Output**: StudentBills entities, boolean, List<StudentBills>

---

#### `Backend/project/src/main/java/com/esd/project/Repository/DomainRepository.java`

**Purpose**: Database access interface for Domain entity

**Logic Contains**:
- Extends JpaRepository<Domain, Long>
- Standard JPA methods for domain operations

**Input**: Domain entities, Long (ID)

**Output**: Domain entities, Optional<Domain>, List<Domain>

---

#### `Backend/project/src/main/java/com/esd/project/Repository/DepartmentRepository.java`

**Purpose**: Database access interface for Department entity

**Logic Contains**:
- Extends JpaRepository<Department, Long>
- Standard JPA methods for department operations

**Input**: Department entities, Long (ID)

**Output**: Department entities, Optional<Department>, List<Department>

---

#### `Backend/project/src/main/java/com/esd/project/Repository/EmployeeRepository.java`

**Purpose**: Database access interface for Employee entity

**Logic Contains**:
- Extends JpaRepository<Employee, Long>
- Standard JPA methods for employee operations

**Input**: Employee entities, Long (ID)

**Output**: Employee entities, Optional<Employee>, List<Employee>

---

### Entities

#### `Backend/project/src/main/java/com/esd/project/Entity/Bills.java`

**Purpose**: Maps to `bills` database table

**Logic Contains**:
- Fields:
  - `billId` (Long, Primary Key, Auto-generated)
  - `description` (String, NOT NULL)
  - `amount` (Double, NOT NULL)
  - `billDate` (LocalDate, NOT NULL)
  - `deadline` (LocalDate, NOT NULL)
- JPA annotations: @Entity, @Table, @Id, @GeneratedValue, @Column
- Getters and setters
- Default constructor

**Database Table**: `bills`

**Relationships**: One-to-Many with StudentBills (via StudentBills.bill)

---

#### `Backend/project/src/main/java/com/esd/project/Entity/Student.java`

**Purpose**: Maps to `student` database table

**Logic Contains**:
- Fields:
  - `studentId` (Long, Primary Key)
  - `rollNumber` (String, UNIQUE, NOT NULL)
  - `name` (String, NOT NULL)
  - `email` (String, UNIQUE, NOT NULL)
  - `domain` (Domain, Many-to-One relationship)
- JPA annotations: @Entity, @ManyToOne, @JoinColumn
- Foreign key to domain table

**Database Table**: `student`

**Relationships**: 
- Many-to-One with Domain
- One-to-Many with StudentBills

---

#### `Backend/project/src/main/java/com/esd/project/Entity/StudentBills.java`

**Purpose**: Maps to `student_bills` junction table (Many-to-Many relationship)

**Logic Contains**:
- Fields:
  - `id` (Long, Primary Key)
  - `student` (Student, Many-to-One)
  - `bill` (Bills, Many-to-One)
- JPA annotations: @Entity, @ManyToOne, @JoinColumn
- Represents the many-to-many relationship between Student and Bills

**Database Table**: `student_bills`

**Relationships**: 
- Many-to-One with Student
- Many-to-One with Bills

---

#### `Backend/project/src/main/java/com/esd/project/Entity/Domain.java`

**Purpose**: Maps to `domain` database table

**Logic Contains**:
- Fields:
  - `domainId` (Long, Primary Key)
  - `domainName` (String, UNIQUE, NOT NULL)
- JPA annotations: @Entity, @OneToMany
- One-to-Many relationship with Student

**Database Table**: `domain`

**Relationships**: One-to-Many with Student

---

#### `Backend/project/src/main/java/com/esd/project/Entity/Department.java`

**Purpose**: Maps to `department` database table

**Logic Contains**:
- Fields:
  - `departmentId` (Long, Primary Key)
  - `departmentName` (String, UNIQUE, NOT NULL)
- JPA annotations: @Entity, @OneToMany
- One-to-Many relationship with Employee

**Database Table**: `department`

**Relationships**: One-to-Many with Employee

---

#### `Backend/project/src/main/java/com/esd/project/Entity/Employee.java`

**Purpose**: Maps to `employee` database table

**Logic Contains**:
- Fields:
  - `employeeId` (Long, Primary Key)
  - `firstName` (String, NOT NULL)
  - `lastName` (String, NOT NULL)
  - `email` (String, UNIQUE, NOT NULL)
  - `title` (String, NOT NULL)
  - `photoPath` (String, nullable)
  - `department` (Department, Many-to-One)
- JPA annotations: @Entity, @ManyToOne, @JoinColumn
- Foreign key to department table

**Database Table**: `employee`

**Relationships**: Many-to-One with Department

---

### DTOs

#### Request DTOs

##### `Backend/project/src/main/java/com/esd/project/DTO/Request/BillRequest.java`

**Purpose**: Data transfer object for creating a new bill

**Logic Contains**:
- Fields:
  - `description` (String, @NotBlank)
  - `amount` (Double, @NotNull, @Positive)
  - `billDate` (LocalDate, @NotNull)
  - `deadline` (LocalDate, @NotNull)
- Validation annotations for input validation
- Getters and setters
- Default constructor

**Used By**: BillsController.addBill()

**Input**: JSON from HTTP request body

**Output**: Converted to Bills entity via BillMapper

---

##### `Backend/project/src/main/java/com/esd/project/DTO/Request/BillUpdateRequest.java`

**Purpose**: Data transfer object for updating a bill (partial update)

**Logic Contains**:
- Fields (all optional/nullable):
  - `description` (String, nullable)
  - `amount` (Double, nullable, @Positive if provided)
  - `billDate` (LocalDate, nullable)
  - `deadline` (LocalDate, nullable)
- Only non-null fields are updated
- Getters and setters

**Used By**: BillsController.updateBillPartially()

**Input**: JSON from HTTP request body

**Output**: Used to update Bills entity via BillMapper

---

#### Response DTOs

##### `Backend/project/src/main/java/com/esd/project/DTO/Response/BillResponse.java`

**Purpose**: Data transfer object for bill responses

**Logic Contains**:
- Fields:
  - `billId` (Long)
  - `description` (String)
  - `amount` (Double)
  - `billDate` (LocalDate)
  - `deadline` (LocalDate)
- Getters and setters
- Default constructor

**Used By**: All bill-related endpoints

**Input**: Converted from Bills entity via BillMapper

**Output**: JSON in HTTP response

---

##### `Backend/project/src/main/java/com/esd/project/DTO/Response/StudentBillResponse.java`

**Purpose**: Data transfer object for student bill assignment responses

**Logic Contains**:
- Fields:
  - `id` (Long)
  - `student` (StudentResponse or nested object)
  - `bill` (BillResponse or nested object)
- Contains both student and bill information
- Getters and setters

**Used By**: Student bill assignment endpoints

**Input**: Converted from StudentBills entity via StudentBillMapper

**Output**: JSON in HTTP response

---

##### `Backend/project/src/main/java/com/esd/project/DTO/Response/UserResponse.java`

**Purpose**: Data transfer object for user information

**Logic Contains**:
- Fields:
  - `name` (String)
  - `email` (String)
  - `picture` (String, URL)
- Getters and setters

**Used By**: AuthController.currentUser()

**Input**: Converted from OAuth2User via UserMapper

**Output**: JSON in HTTP response

---

##### `Backend/project/src/main/java/com/esd/project/DTO/Response/MessageResponse.java`

**Purpose**: Generic response for simple messages

**Logic Contains**:
- Fields:
  - `message` (String)
- Getters and setters

**Used By**: Delete operations, success messages

**Input**: String message

**Output**: JSON in HTTP response

---

### Mappers

#### `Backend/project/src/main/java/com/esd/project/Mapper/BillMapper.java`

**Purpose**: Converts between BillRequest/BillUpdateRequest DTOs and Bills entity

**Logic Contains**:
- **toEntity(BillRequest request)** - Static method
  - Creates new Bills entity
  - Maps fields from BillRequest to Bills
  - Sets billId to null (will be generated)
  - Returns Bills entity

- **toResponse(Bills bill)** - Static method
  - Creates new BillResponse DTO
  - Maps all fields from Bills to BillResponse
  - Returns BillResponse

- **updateEntityFromRequest(Bills entity, BillUpdateRequest request)** - Static method
  - Updates only non-null fields from request
  - Leaves other fields unchanged
  - Modifies entity in-place

**Input**: BillRequest DTO or Bills entity

**Output**: Bills entity or BillResponse DTO

---

#### `Backend/project/src/main/java/com/esd/project/Mapper/StudentBillMapper.java`

**Purpose**: Converts StudentBills entity to StudentBillResponse DTO

**Logic Contains**:
- **toResponse(StudentBills studentBill)** - Static method
  - Creates new StudentBillResponse DTO
  - Maps id, student, and bill fields
  - May include nested student and bill information
  - Returns StudentBillResponse

**Input**: StudentBills entity

**Output**: StudentBillResponse DTO

---

#### `Backend/project/src/main/java/com/esd/project/Mapper/UserMapper.java`

**Purpose**: Converts OAuth2User to UserResponse DTO

**Logic Contains**:
- **toResponse(OAuth2User oauth2User)** - Static method
  - Creates new UserResponse DTO
  - Extracts name, email, picture from OAuth2User attributes
  - Returns UserResponse

**Input**: OAuth2User (from Spring Security)

**Output**: UserResponse DTO

---

### Configuration

#### `Backend/project/src/main/java/com/esd/project/Config/SecurityConfig.java`

**Purpose**: Configures Spring Security and OAuth2

**Logic Contains**:
- **filterChain(HttpSecurity http)** - @Bean method
  - Configures CORS (Cross-Origin Resource Sharing)
  - Allows OAuth2 login endpoints
  - Protects API endpoints (requires authentication)
  - Configures OAuth2 login
  - Sets up OAuth2SuccessHandler
  - Returns SecurityFilterChain

- **corsConfigurationSource()** - @Bean method
  - Configures CORS settings
  - Allows frontend origin (localhost:5173)
  - Allows credentials
  - Allows all headers and methods
  - Returns CorsConfigurationSource

**Dependencies**: OAuth2SuccessHandler

**Input**: HttpSecurity object

**Output**: SecurityFilterChain bean, CorsConfigurationSource bean

---

#### `Backend/project/src/main/java/com/esd/project/Config/OAuth2SuccessHandler.java`

**Purpose**: Handles successful OAuth2 authentication

**Logic Contains**:
- **onAuthenticationSuccess(...)** - Override method
  - Extracts user info from OAuth2User:
    - Email
    - Name
    - Picture URL
  - Stores in HTTP session:
    - userEmail
    - userName
    - userPicture
  - Generates JWT token (if needed)
  - Redirects to frontend callback URL with token
  - URL: `http://localhost:5173/oauth-callback?token={JWT_TOKEN}`

**Input**: HttpServletRequest, HttpServletResponse, Authentication (OAuth2User)

**Output**: Redirects to frontend

---

#### `Backend/project/src/main/java/com/esd/project/ProjectApplication.java`

**Purpose**: Spring Boot application entry point

**Logic Contains**:
- **main(String[] args)** - Main method
  - Starts Spring Boot application
  - Creates ApplicationContext (IoC Container)
  - Scans for @Component, @Service, @Repository, @Controller
  - Starts embedded Tomcat server on port 8080
  - Initializes all beans

**Input**: Command line arguments

**Output**: Running Spring Boot application

---

### Exception Handling

#### `Backend/project/src/main/java/com/esd/project/Exception/GlobalExceptionHandler.java`

**Purpose**: Global exception handler for all controllers

**Logic Contains**:
- **handleResourceNotFound(ResourceNotFoundException ex)**
  - Returns 404 Not Found with error message

- **handleBusinessException(BusinessException ex)**
  - Returns 400 Bad Request with error message

- **handleValidation(MethodArgumentNotValidException ex)**
  - Extracts field-level validation errors
  - Returns 400 Bad Request with detailed error map

- **handleDataIntegrityViolation(DataIntegrityViolationException ex)**
  - Handles database constraint violations
  - Checks for duplicate entries, foreign key violations, null constraints
  - Returns 409 Conflict with appropriate message

- **handleConstraintViolation(ConstraintViolationException ex)**
  - Handles Bean Validation constraint violations
  - Returns 400 Bad Request with violation details

- **handleException(Exception ex)** - Generic handler
  - Catches all unhandled exceptions
  - Returns 500 Internal Server Error
  - Prevents exposing internal error details

**Dependencies**: None (standalone exception handlers)

**Input**: Various exception types

**Output**: ResponseEntity with error details

---

#### `Backend/project/src/main/java/com/esd/project/Exception/ResourceNotFoundException.java`

**Purpose**: Custom exception for resource not found errors

**Logic Contains**:
- Extends RuntimeException
- Constructor with message parameter
- Used when entity is not found in database

**Thrown By**: Service layer methods

**Caught By**: GlobalExceptionHandler.handleResourceNotFound()

---

#### `Backend/project/src/main/java/com/esd/project/Exception/BusinessException.java`

**Purpose**: Custom exception for business logic errors

**Logic Contains**:
- Extends RuntimeException
- Constructor with message parameter
- Used for business rule violations (e.g., duplicate assignment)

**Thrown By**: Service layer methods

**Caught By**: GlobalExceptionHandler.handleBusinessException()

---

## 🎨 Frontend Code Reference

### Pages

#### `frontend/src/pages/Login.tsx`

**Purpose**: Login page with Google OAuth

**Logic Contains**:
- **useEffect** - Checks if user is already authenticated
  - If authenticated and finance email → redirects to /employee
  - If authenticated and non-finance email → redirects to /invalid-access

- **handleGoogleLogin()** - Function
  - Redirects to backend OAuth endpoint: `/oauth2/authorization/google`
  - Uses window.location.href

- **UI Rendering**:
  - Displays IIITB logo
  - Shows "Academic ERP" title
  - "Sign in with Google" button
  - Centered layout with gradient background

**Dependencies**: useAuth hook, useNavigate

**Input**: None (user interaction)

**Output**: Redirects to OAuth or dashboard

---

#### `frontend/src/pages/Employee.tsx`

**Purpose**: Main employee dashboard

**Logic Contains**:
- **useEffect** - Sets page title
- **useAuth** - Gets authenticated user
- **Default Avatar Logic**:
  - If user.picture fails to load or doesn't exist
  - Creates colored circle with user initials
  - Color is consistent for same user

- **UI Rendering**:
  - Navbar with "Academic ERP – Employee Portal"
  - User profile picture/avatar
  - Navigation links to bill management pages
  - Logout button

**Dependencies**: useAuth hook, ProtectedRoute

**Input**: Authenticated user data

**Output**: Dashboard UI

---

#### `frontend/src/pages/bills/AddBill.tsx`

**Purpose**: Form to add a new bill

**Logic Contains**:
- **State Management**:
  - `formData` - Form fields (description, amount, billDate, deadline)
  - `loading` - Loading state
  - `successMessage` - Success message
  - `errorMessage` - Error message

- **handleSubmit(e)** - Form submission handler
  - Prevents default form submission
  - Validates form data:
    - All fields filled
    - Amount > 0
    - Deadline > Bill Date
  - Calls `addBill(formData)` from API service
  - Shows success/error messages
  - Resets form on success

- **UI Rendering**:
  - Form with input fields
  - Date pickers for billDate and deadline
  - Submit button with loading state
  - Success/error message display

**Dependencies**: api service (addBill)

**Input**: User form input

**Output**: Calls API, shows success/error

---

#### `frontend/src/pages/bills/ViewBills.tsx`

**Purpose**: Display all bills in a table

**Logic Contains**:
- **State Management**:
  - `bills` - List of bills
  - `searchTerm` - Search filter
  - `loading` - Loading state
  - `errorMessage` - Error message

- **useEffect** - On component mount
  - Calls `getAllBills()` from API service
  - Updates bills state
  - Handles errors

- **handleDelete(billId)** - Delete handler
  - Shows confirmation dialog
  - Calls `deleteBill(billId)` from API service
  - Refreshes bill list

- **filteredBills** - Computed value
  - Filters bills by searchTerm (ID or description)

- **UI Rendering**:
  - Search input
  - Bills table with columns: ID, Description, Amount, Dates, Actions
  - Delete button for each bill
  - Refresh button
  - Summary (total bills, total amount)

**Dependencies**: api service (getAllBills, deleteBill)

**Input**: None (loads on mount)

**Output**: Displays bills table

---

#### `frontend/src/pages/bills/UpdateBill.tsx`

**Purpose**: Form to update an existing bill

**Logic Contains**:
- **State Management**:
  - `billId` - Bill ID to search
  - `formData` - Bill data
  - `loading` - Loading state
  - `errorMessage` - Error message

- **handleSearch()** - Search handler
  - Calls `getBillById(billId)` from API service
  - Loads bill data into form

- **handleSubmit(e)** - Update handler
  - Validates form data
  - Calls `updateBillPartially(billId, formData)` from API service
  - Shows success message
  - Resets form

- **UI Rendering**:
  - Search form (bill ID input)
  - Update form (all bill fields)
  - Save and Cancel buttons

**Dependencies**: api service (getBillById, updateBillPartially)

**Input**: Bill ID, updated form data

**Output**: Updates bill, shows success

---

#### `frontend/src/pages/bills/DeleteBill.tsx`

**Purpose**: Form to delete a bill with confirmation

**Logic Contains**:
- **State Management**:
  - `billId` - Bill ID to delete
  - `bill` - Bill data (for preview)
  - `loading` - Loading state
  - `confirmDelete` - Confirmation state

- **handleSearch()** - Search handler
  - Calls `getBillById(billId)` from API service
  - Loads bill data for preview

- **handleDelete()** - Delete handler
  - Shows confirmation dialog
  - Calls `deleteBill(billId)` from API service
  - Shows success message
  - Resets form

- **UI Rendering**:
  - Search form
  - Bill preview (if found)
  - Confirmation dialog
  - Delete button

**Dependencies**: api service (getBillById, deleteBill)

**Input**: Bill ID

**Output**: Deletes bill, shows success

---

#### `frontend/src/pages/studentbills/AssignToRoll.tsx`

**Purpose**: Form to assign a bill to a student by roll number

**Logic Contains**:
- **State Management**:
  - `rollNumber` - Student roll number
  - `billId` - Bill ID
  - `loading` - Loading state
  - `successMessage` - Success message
  - `errorMessage` - Error message

- **handleSubmit(e)** - Assignment handler
  - Validates inputs
  - Calls `assignBillToStudent(rollNumber, billId)` from API service
  - Shows success/error messages
  - Resets form

- **UI Rendering**:
  - Form with rollNumber and billId inputs
  - Submit button
  - Success/error messages

**Dependencies**: api service (assignBillToStudent)

**Input**: Roll number, Bill ID

**Output**: Assigns bill to student

---

#### `frontend/src/pages/studentbills/AssignToDomain.tsx`

**Purpose**: Form to assign a bill to all students in a domain

**Logic Contains**:
- **State Management**:
  - `domainId` - Domain ID
  - `billId` - Bill ID
  - `loading` - Loading state
  - `successMessage` - Success message
  - `errorMessage` - Error message

- **handleSubmit(e)** - Assignment handler
  - Validates inputs
  - Calls `assignBillToDomain(domainId, billId)` from API service
  - Shows success/error messages
  - Resets form

- **UI Rendering**:
  - Form with domainId and billId inputs
  - Submit button
  - Success/error messages

**Dependencies**: api service (assignBillToDomain)

**Input**: Domain ID, Bill ID

**Output**: Assigns bill to all students in domain

---

#### `frontend/src/pages/studentbills/StudentBillsView.tsx`

**Purpose**: Display student bills

**Logic Contains**:
- **State Management**:
  - `studentBills` - List of student bills
  - `rollNumber` - Search filter
  - `loading` - Loading state

- **useEffect** - Loads all student bills on mount
  - Calls `getAllStudentBills()` from API service

- **handleSearch()** - Search by roll number
  - Calls `getStudentBillsByRollNumber(rollNumber)` from API service

- **UI Rendering**:
  - Search form
  - Student bills table
  - Shows student info and bill info

**Dependencies**: api service (getAllStudentBills, getStudentBillsByRollNumber)

**Input**: None or roll number

**Output**: Displays student bills

---

#### `frontend/src/pages/AuthCallback.tsx`

**Purpose**: Handles OAuth callback from backend

**Logic Contains**:
- **useEffect** - On component mount
  - Extracts token from URL query parameter: `?token=...`
  - Stores token in localStorage
  - Calls `getCurrentUser()` from API service
  - Updates AuthContext
  - Redirects to /employee or /invalid-access

- **UI Rendering**:
  - Loading message while processing

**Dependencies**: api service (getCurrentUser), AuthContext

**Input**: Token from URL

**Output**: Stores token, updates auth state, redirects

---

#### `frontend/src/pages/InvalidAccess.tsx`

**Purpose**: Page shown to non-finance users

**Logic Contains**:
- **handleBackToLogin()** - Logout handler
  - Calls `logout()` from AuthContext
  - Ensures complete logout
  - Redirects to /login

- **UI Rendering**:
  - Error message
  - "Back to Login" button

**Dependencies**: useAuth hook (logout)

**Input**: None

**Output**: Logs out user, redirects to login

---

### Services

#### `frontend/src/services/api.ts`

**Purpose**: Centralized API service layer for all HTTP requests

**Logic Contains**:
- **API_BASE_URL** - Base URL constant (from env or default)
- **getAuthToken()** - Gets token from localStorage
- **apiCall(endpoint, options)** - Generic API call function
  - Adds Authorization header if token exists
  - Handles 401 errors (removes token, redirects to login)
  - Handles other errors
  - Parses JSON response
  - Returns Promise

- **Bill Functions**:
  - `addBill(billData)` - POST /bills/add-bill
  - `getAllBills()` - GET /bills/show-all-bills
  - `getBillById(billId)` - GET /bills/{billId}
  - `updateBillPartially(billId, updateData)` - PATCH /bills/update-bill-details/{billId}
  - `deleteBill(billId)` - DELETE /bills/delete-bill/{billId}

- **Student Bill Functions**:
  - `assignBillToStudent(rollNumber, billId)` - POST /student-bills/assign-to-roll/{rollNumber}/{billId}
  - `assignBillToDomain(domainId, billId)` - POST /student-bills/assign-to-domain/{domainId}/{billId}
  - `getAllStudentBills()` - GET /student-bills/show-all-student-bills
  - `getStudentBillsByRollNumber(rollNumber)` - GET /student-bills/show-student-bills/{rollNumber}
  - `deleteStudentBill(id)` - DELETE /student-bills/delete-student-bill/{id}
  - `deleteSpecificBill(rollNumber, billId)` - DELETE /student-bills/delete-specific-bill/{rollNumber}/{billId}

- **Auth Functions**:
  - `getCurrentUser()` - GET /auth/user

**Dependencies**: localStorage, fetch API

**Input**: Request data (DTOs, IDs)

**Output**: Promises with response data (DTOs)

---

### Context

#### `frontend/src/context/AuthContext.tsx`

**Purpose**: Global authentication state management

**Logic Contains**:
- **State**:
  - `user` - User object (name, email, picture)
  - `isAuthenticated` - Boolean authentication status
  - `loading` - Loading state

- **useEffect** - On mount
  - Checks localStorage for token
  - If token exists, calls `getCurrentUser()` API
  - Updates authentication state

- **login(userData)** - Login function
  - Sets user data
  - Sets isAuthenticated to true

- **logout()** - Logout function
  - Removes token from localStorage
  - Clears user data
  - Sets isAuthenticated to false
  - Redirects to /login

- **Provider Component**:
  - Wraps entire app
  - Provides auth state to all components

**Dependencies**: api service (getCurrentUser)

**Input**: User data, token

**Output**: Auth state, login/logout functions

---

### Components

#### `frontend/src/components/ProtectedRoute.tsx`

**Purpose**: Route protection component

**Logic Contains**:
- **ProtectedRoute Component**:
  - Checks if user is authenticated (from AuthContext)
  - If authenticated → renders child component
  - If not authenticated → redirects to /login
  - Shows loading state while checking

**Dependencies**: useAuth hook, useNavigate

**Input**: Child component to protect

**Output**: Renders protected component or redirects

---

#### `frontend/src/App.tsx`

**Purpose**: Main app component with routing

**Logic Contains**:
- **Routes Configuration**:
  - `/login` → Login component
  - `/employee` → Employee component (protected)
  - `/oauth-callback` → AuthCallback component
  - `/invalid-access` → InvalidAccess component
  - `/bills/add` → AddBill component (protected)
  - `/bills/view` → ViewBills component (protected)
  - `/bills/update` → UpdateBill component (protected)
  - `/bills/delete` → DeleteBill component (protected)
  - `/student-bills/assign-roll` → AssignToRoll component (protected)
  - `/student-bills/assign-domain` → AssignToDomain component (protected)
  - `/student-bills/view` → StudentBillsView component (protected)
  - Default → Redirects to /login

- **AuthContext Provider**:
  - Wraps all routes
  - Provides authentication state

**Dependencies**: React Router, AuthContext

**Input**: URL path

**Output**: Renders appropriate component

---

#### `frontend/src/main.tsx`

**Purpose**: React application entry point

**Logic Contains**:
- Creates React root
- Renders App component
- Sets up React Router BrowserRouter

**Input**: None

**Output**: Renders React app

---

## ⚙️ Configuration Files

### `Backend/project/src/main/resources/application.properties`

**Purpose**: Spring Boot configuration file

**Logic Contains**:
- **Database Configuration**:
  - Database URL: `jdbc:mysql://localhost:3306/ESDPROJECT`
  - Username and password
  - Hibernate settings (ddl-auto, show-sql, dialect)

- **OAuth2 Configuration**:
  - Google client ID and secret
  - OAuth2 provider URLs
  - Scopes (email, profile)

- **Application Settings**:
  - Server port: 8080
  - Application name

**Input**: Configuration values

**Output**: Configured Spring Boot application

---

### `frontend/package.json`

**Purpose**: Node.js project configuration

**Logic Contains**:
- Dependencies: React, React Router, Tailwind CSS, etc.
- Scripts: dev, build, preview
- Project metadata

**Input**: npm install

**Output**: Installed dependencies

---

### `frontend/vite.config.js`

**Purpose**: Vite build tool configuration

**Logic Contains**:
- React plugin configuration
- Build settings
- Development server settings

**Input**: Configuration values

**Output**: Configured Vite build system

---

## 📊 Code Flow Summary

### Adding a Bill Flow:
1. `AddBill.tsx` → User fills form
2. `api.ts` → `addBill()` makes HTTP POST request
3. `BillsController.java` → Receives request, validates
4. `BillsService.java` → Business logic
5. `BillMapper.java` → Converts DTO to Entity
6. `BillsRepository.java` → Saves to database
7. Database → Stores bill
8. Response flows back through layers
9. `AddBill.tsx` → Shows success message

### Authentication Flow:
1. `Login.tsx` → User clicks "Sign in with Google"
2. Backend `/oauth2/authorization/google` → Redirects to Google
3. Google → User authenticates
4. `OAuth2SuccessHandler.java` → Stores user in session, redirects to frontend
5. `AuthCallback.tsx` → Receives token, stores in localStorage
6. `api.ts` → `getCurrentUser()` gets user info
7. `AuthController.java` → Returns user data
8. `AuthContext.tsx` → Updates authentication state
9. Redirects to `/employee` or `/invalid-access`

---

**Last Updated**: 2024
**Version**: 1.0.0

