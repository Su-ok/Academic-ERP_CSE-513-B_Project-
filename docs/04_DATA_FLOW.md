# Complete Data Flow - Frontend to Database

## 🔄 End-to-End Flow: Adding a Bill

### Step-by-Step Process

```
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: USER INTERACTION (Frontend)                             │
└─────────────────────────────────────────────────────────────────┘
Location: frontend/src/pages/bills/AddBill.tsx

User Action:
  - Opens "Add Bill" page
  - Fills form:
    * Description: "Tuition Fee"
    * Amount: 50000
    * Bill Date: 2024-01-15
    * Deadline: 2024-02-15
  - Clicks "Submit" button

Component State:
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    billDate: "",
    deadline: ""
  });

Validation:
  ✓ All fields filled
  ✓ Amount > 0
  ✓ Deadline > Bill Date

┌─────────────────────────────────────────────────────────────────┐
│ STEP 2: API CALL (Frontend Service)                             │
└─────────────────────────────────────────────────────────────────┘
Location: frontend/src/services/api.ts

Function Called:
  addBill({
    description: "Tuition Fee",
    amount: 50000,
    billDate: "2024-01-15",
    deadline: "2024-02-15"
  })

Process:
  1. Get token from localStorage
     const token = localStorage.getItem("token");
     // token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

  2. Create request headers
     headers: {
       "Content-Type": "application/json",
       "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     }

  3. Create request body (JSON)
     body: JSON.stringify({
       description: "Tuition Fee",
       amount: 50000,
       billDate: "2024-01-15",
       deadline: "2024-02-15"
     })

  4. Make HTTP POST request
     fetch("http://localhost:8080/bills/add-bill", {
       method: "POST",
       headers: {...},
       body: {...}
     })

┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: NETWORK TRANSMISSION                                    │
└─────────────────────────────────────────────────────────────────┘
HTTP Request:
  POST http://localhost:8080/bills/add-bill HTTP/1.1
  Host: localhost:8080
  Content-Type: application/json
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Length: 123

  {
    "description": "Tuition Fee",
    "amount": 50000,
    "billDate": "2024-01-15",
    "deadline": "2024-02-15"
  }

┌─────────────────────────────────────────────────────────────────┐
│ STEP 4: SPRING SECURITY (Backend)                               │
└─────────────────────────────────────────────────────────────────┘
Location: Backend/project/src/main/java/com/esd/project/Config/SecurityConfig.java

Process:
  1. SecurityFilterChain intercepts request
  2. Extracts Authorization header
  3. Validates JWT token
  4. Checks user authentication
  5. If valid, allows request to proceed
  6. If invalid, returns 401 Unauthorized

┌─────────────────────────────────────────────────────────────────┐
│ STEP 5: CONTROLLER LAYER (Backend)                               │
└─────────────────────────────────────────────────────────────────┘
Location: Backend/project/src/main/java/com/esd/project/Controller/BillsController.java

Method:
  @PostMapping("/add-bill")
  public ResponseEntity<BillResponse> addBill(
          @Valid @RequestBody BillRequest request)

Process:
  1. Spring deserializes JSON body to BillRequest DTO
     BillRequest {
       description: "Tuition Fee",
       amount: 50000.0,
       billDate: LocalDate(2024-01-15),
       deadline: LocalDate(2024-02-15)
     }

  2. @Valid annotation triggers validation
     ✓ @NotBlank on description → Valid
     ✓ @NotNull on amount → Valid
     ✓ @Positive on amount → Valid (50000 > 0)
     ✓ @NotNull on dates → Valid

  3. If validation fails:
     → Returns 400 Bad Request with error details
     → Request stops here

  4. If validation passes:
     → Calls billsService.addBill(request)

┌─────────────────────────────────────────────────────────────────┐
│ STEP 6: SERVICE LAYER (Backend)                                  │
└─────────────────────────────────────────────────────────────────┘
Location: Backend/project/src/main/java/com/esd/project/Service/BillsService.java

Method:
  public BillResponse addBill(BillRequest request)

Process:
  1. Convert DTO to Entity using Mapper
     Bills bill = BillMapper.toEntity(request);
     
     Bills {
       billId: null,  // Will be generated by database
       description: "Tuition Fee",
       amount: 50000.0,
       billDate: LocalDate(2024-01-15),
       deadline: LocalDate(2024-02-15)
     }

  2. Save entity to database
     Bills savedBill = billsRepository.save(bill);
     // This triggers repository layer

  3. Convert Entity back to DTO
     return BillMapper.toResponse(savedBill);

┌─────────────────────────────────────────────────────────────────┐
│ STEP 7: REPOSITORY LAYER (Backend)                              │
└─────────────────────────────────────────────────────────────────┘
Location: Backend/project/src/main/java/com/esd/project/Repository/BillsRepository.java

Interface:
  public interface BillsRepository extends JpaRepository<Bills, Long>

Process:
  1. Spring Data JPA receives save() call
  2. Hibernate generates SQL:
     INSERT INTO bills (description, amount, bill_date, deadline)
     VALUES ('Tuition Fee', 50000.0, '2024-01-15', '2024-02-15')

  3. Hibernate executes SQL via JDBC
  4. Returns entity with generated ID

┌─────────────────────────────────────────────────────────────────┐
│ STEP 8: DATABASE LAYER (MySQL)                                  │
└─────────────────────────────────────────────────────────────────┘
Database: ESDPROJECT
Table: bills

SQL Execution:
  INSERT INTO bills (description, amount, bill_date, deadline)
  VALUES ('Tuition Fee', 50000.0, '2024-01-15', '2024-02-15');

Database Process:
  1. Receives INSERT statement
  2. Validates constraints:
     ✓ description NOT NULL → Valid
     ✓ amount NOT NULL → Valid
     ✓ bill_date NOT NULL → Valid
     ✓ deadline NOT NULL → Valid
  3. Generates auto-increment ID: bill_id = 5
  4. Inserts row into table
  5. Returns success

Table State After Insert:
  ┌─────────┬──────────────┬─────────┬────────────┬────────────┐
  │ bill_id │ description  │ amount  │ bill_date  │ deadline   │
  ├─────────┼──────────────┼─────────┼────────────┼────────────┤
  │    5    │ Tuition Fee  │ 50000.0 │ 2024-01-15 │ 2024-02-15 │
  └─────────┴──────────────┴─────────┴────────────┴────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ STEP 9: RESPONSE FLOW (Reverse Path)                            │
└─────────────────────────────────────────────────────────────────┘

Database → Repository:
  Returns: Bills entity with billId = 5

Repository → Service:
  Bills savedBill = {
    billId: 5,
    description: "Tuition Fee",
    amount: 50000.0,
    billDate: LocalDate(2024-01-15),
    deadline: LocalDate(2024-02-15)
  }

Service → Mapper:
  BillResponse response = BillMapper.toResponse(savedBill);
  
  BillResponse {
    billId: 5,
    description: "Tuition Fee",
    amount: 50000.0,
    billDate: LocalDate(2024-01-15),
    deadline: LocalDate(2024-02-15)
  }

Mapper → Controller:
  return ResponseEntity.status(201).body(response);

Controller → HTTP Response:
  HTTP/1.1 201 Created
  Content-Type: application/json
  
  {
    "billId": 5,
    "description": "Tuition Fee",
    "amount": 50000.0,
    "billDate": "2024-01-15",
    "deadline": "2024-02-15"
  }

┌─────────────────────────────────────────────────────────────────┐
│ STEP 10: FRONTEND RECEIVES RESPONSE                             │
└─────────────────────────────────────────────────────────────────┘
Location: frontend/src/services/api.ts

Process:
  1. fetch() promise resolves
  2. response.json() parses JSON
  3. Returns data to component

Component Update:
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await addBill(formData);
      // response = { billId: 5, description: "...", ... }
      
      setSuccessMessage("Bill added successfully!");
      setFormData({ description: "", amount: "", ... }); // Reset form
    } catch (error) {
      setErrorMessage("Failed to add bill");
    } finally {
      setLoading(false);
    }
  };

UI Update:
  - Success message displayed
  - Form cleared
  - User can add another bill
```

---

## 🔄 Data Flow: Viewing All Bills

```
1. USER ACTION
   └─> User navigates to "View Bills" page

2. COMPONENT MOUNT
   └─> ViewBills.tsx component loads
   └─> useEffect hook triggers

3. API CALL
   └─> getAllBills() function called
   └─> GET http://localhost:8080/bills/show-all-bills
   └─> Headers: Authorization: Bearer {token}

4. BACKEND PROCESSING
   └─> BillsController.getAllBills()
       └─> BillsService.getAllBills()
           └─> billsRepository.findAll()
               └─> Hibernate generates: SELECT * FROM bills

5. DATABASE QUERY
   └─> MySQL executes SELECT statement
   └─> Returns all rows from bills table

6. RESPONSE
   └─> List<BillResponse> converted to JSON
   └─> HTTP 200 OK
   └─> Body: [{ billId: 1, ... }, { billId: 2, ... }, ...]

7. FRONTEND UPDATE
   └─> Component receives array
   └─> setBills(data) updates state
   └─> Table renders with all bills
```

---

## 🔄 Data Flow: Assigning Bill to Student

```
1. USER ACTION
   └─> User enters roll number and bill ID
   └─> Clicks "Assign" button

2. API CALL
   └─> POST /student-bills/assign-to-roll/{rollNumber}/{billId}
   └─> Example: POST /student-bills/assign-to-roll/CS2024001/5

3. BACKEND PROCESSING
   └─> StudentBillsController.assignBillToStudent()
       └─> StudentBillsService.assignBillToStudent()
           ├─> studentRepository.findByRollNumber("CS2024001")
           │   └─> Returns Student entity
           ├─> billsRepository.findById(5)
           │   └─> Returns Bills entity
           ├─> Check for duplicate assignment
           └─> Create StudentBills entity:
               {
                 student: Student{...},
                 bill: Bills{...}
               }

4. DATABASE INSERT
   └─> INSERT INTO student_bills (student_id, bill_id)
       VALUES (123, 5)

5. RESPONSE
   └─> StudentBillResponse DTO created
   └─> Includes student and bill information
   └─> HTTP 201 Created

6. FRONTEND UPDATE
   └─> Success message displayed
   └─> Form cleared
```

---

## 🔄 Data Flow: Authentication

```
1. USER CLICKS "Sign in with Google"
   └─> Login.tsx: handleGoogleLogin()
   └─> Redirects to: http://localhost:8080/oauth2/authorization/google

2. SPRING SECURITY OAUTH FLOW
   └─> SecurityConfig redirects to Google
   └─> User authenticates with Google
   └─> Google redirects back with authorization code

3. OAUTH CALLBACK HANDLER
   └─> OAuth2SuccessHandler.onAuthenticationSuccess()
       ├─> Extracts user info from OAuth2User
       ├─> Stores in session:
       │   - userEmail
       │   - userName
       │   - userPicture
       └─> Redirects to: http://localhost:5173/oauth-callback?token=JWT

4. FRONTEND CALLBACK
   └─> AuthCallback.tsx component
       ├─> Extracts token from URL
       ├─> localStorage.setItem("token", token)
       └─> Calls getCurrentUser()

5. USER INFO REQUEST
   └─> GET /auth/user
   └─> Headers: Authorization: Bearer {token}

6. BACKEND RESPONSE
   └─> AuthController.currentUser()
       ├─> Gets OAuth2User from session
       ├─> UserMapper.toResponse() converts to DTO
       └─> Returns UserResponse:
           {
             "name": "John Doe",
             "email": "john@example.com",
             "picture": "https://..."
           }

7. AUTHENTICATION STATE UPDATE
   └─> AuthContext updates:
       ├─> setUser(userData)
       ├─> setIsAuthenticated(true)
       └─> Redirects to /employee (if finance email)
           or /invalid-access (if not finance email)
```

---

## 📊 Data Transformation at Each Layer

### Request Flow (DTO → Entity)

```
Frontend JSON
{
  "description": "Tuition Fee",
  "amount": 50000,
  "billDate": "2024-01-15",
  "deadline": "2024-02-15"
}
        ↓
BillRequest DTO (Controller)
{
  description: String,
  amount: Double,
  billDate: LocalDate,
  deadline: LocalDate
}
        ↓
BillMapper.toEntity()
        ↓
Bills Entity (Service/Repository)
{
  billId: Long (null),
  description: String,
  amount: Double,
  billDate: LocalDate,
  deadline: LocalDate
}
        ↓
Database Row
INSERT INTO bills (description, amount, bill_date, deadline)
VALUES ('Tuition Fee', 50000.0, '2024-01-15', '2024-02-15')
```

### Response Flow (Entity → DTO)

```
Database Row
SELECT * FROM bills WHERE bill_id = 5
        ↓
Bills Entity (Repository)
{
  billId: 5,
  description: "Tuition Fee",
  amount: 50000.0,
  billDate: LocalDate(2024-01-15),
  deadline: LocalDate(2024-02-15)
}
        ↓
BillMapper.toResponse()
        ↓
BillResponse DTO (Service/Controller)
{
  billId: 5,
  description: "Tuition Fee",
  amount: 50000.0,
  billDate: LocalDate(2024-01-15),
  deadline: LocalDate(2024-02-15)
}
        ↓
JSON Response
{
  "billId": 5,
  "description": "Tuition Fee",
  "amount": 50000.0,
  "billDate": "2024-01-15",
  "deadline": "2024-02-15"
}
```

---

## 🔍 Key Points

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Data Validation**: Happens at multiple levels (frontend, DTO, database)
3. **Type Safety**: DTOs ensure type consistency
4. **Error Handling**: Errors can occur at any layer and are handled appropriately
5. **Transaction Management**: Service layer manages database transactions
6. **Security**: Authentication checked at security filter level

---

**Last Updated**: 2024
**Version**: 1.0.0

