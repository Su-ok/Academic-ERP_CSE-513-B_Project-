# Frontend Architecture - Complete Guide

## 📁 Project Structure

```
frontend/
├── src/
│   ├── pages/                    # Page Components
│   │   ├── Login.tsx            # Google OAuth login page
│   │   ├── AuthCallback.tsx     # OAuth callback handler
│   │   ├── InvalidAccess.tsx   # Access denied page
│   │   ├── Employee.tsx        # Main dashboard layout
│   │   ├── bills/               # Bill management pages
│   │   │   ├── AddBill.tsx
│   │   │   ├── ViewBills.tsx
│   │   │   ├── UpdateBill.tsx
│   │   │   └── DeleteBill.tsx
│   │   └── studentbills/        # Student bill pages
│   │       ├── AssignToRoll.tsx
│   │       ├── AssignToDomain.tsx
│   │       ├── StudentBillsView.tsx
│   │       ├── DeleteStudentBill.tsx
│   │       └── DeleteSpecificBill.tsx
│   ├── components/              # Reusable Components
│   │   └── ProtectedRoute.tsx  # Route protection wrapper
│   ├── context/                # Context Providers
│   │   └── AuthContext.tsx     # Global authentication state
│   ├── services/               # API Service Layer
│   │   ├── api.ts             # TypeScript API service
│   │   └── api.js             # JavaScript API service
│   ├── App.tsx                 # Main router component
│   ├── main.tsx                # Application entry point
│   └── index.css               # Global styles
├── public/                     # Static assets
├── package.json                # Dependencies
└── vite.config.js             # Vite configuration
```

---

## 🔄 Component Hierarchy

```
App.tsx (Root)
│
├── AuthProvider (Context Wrapper)
│   │
│   └── BrowserRouter
│       │
│       ├── Route: /login
│       │   └── Login.tsx
│       │       ├── useAuth() hook
│       │       └── handleGoogleLogin()
│       │
│       ├── Route: /oauth-callback
│       │   └── AuthCallback.tsx
│       │       ├── Extracts token from URL
│       │       ├── Stores in localStorage
│       │       └── Calls getCurrentUser()
│       │
│       ├── Route: /invalid-access
│       │   └── ProtectedRoute
│       │       └── InvalidAccess.tsx
│       │
│       └── Route: /employee
│           └── ProtectedRoute (requireFinance=true)
│               └── Employee.tsx (Layout)
│                   ├── Header (Navbar)
│                   │   ├── User info display
│                   │   └── Logout button
│                   │
│                   ├── Dashboard Cards
│                   │   ├── Bills Management
│                   │   └── Student Bills Management
│                   │
│                   └── Outlet (Nested Routes)
│                       ├── /employee/bills/all
│                       │   └── ViewBills.tsx
│                       ├── /employee/bills/add
│                       │   └── AddBill.tsx
│                       ├── /employee/bills/update
│                       │   └── UpdateBill.tsx
│                       ├── /employee/bills/delete
│                       │   └── DeleteBill.tsx
│                       ├── /employee/student-bills/assign-roll
│                       │   └── AssignToRoll.tsx
│                       └── ... (other student bill routes)
```

---

## 🔐 Authentication Context (AuthContext.tsx)

### Purpose
Global state management for authentication across the entire application.

### State Variables
```typescript
interface AuthContextType {
  isAuthenticated: boolean;    // Is user logged in?
  user: User | null;           // User information
  loading: boolean;            // Initial auth check in progress
  setIsAuthenticated: (value: boolean) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
}
```

### How It Works

1. **Initial Load**
   ```typescript
   useEffect(() => {
     const token = localStorage.getItem("token");
     if (token) {
       // Try to fetch user info
       getCurrentUser()
         .then(userData => {
           setUser(userData);
           setIsAuthenticated(true);
         })
         .catch(() => {
           // Token invalid, clear it
           localStorage.removeItem("token");
         });
     }
     setLoading(false);
   }, []);
   ```

2. **Login Flow**
   - User clicks "Sign in with Google"
   - Redirects to backend OAuth endpoint
   - Backend redirects back with token
   - Token stored in localStorage
   - User info fetched and stored in context

3. **Logout Flow**
   ```typescript
   const logout = () => {
     localStorage.removeItem("token");
     setIsAuthenticated(false);
     setUser(null);
     window.location.href = "/login";
   };
   ```

---

## 🌐 API Service Layer (api.ts)

### Purpose
Centralized HTTP communication with the backend.

### Key Functions

#### 1. Token Management
```typescript
const getAuthToken = (): string | null => {
  return localStorage.getItem("token");
};
```

#### 2. Generic API Call Function
```typescript
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (response.status === 401) {
    // Unauthorized - clear token and redirect
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};
```

#### 3. Bill Management Functions
```typescript
// Get all bills
export const getAllBills = async (): Promise<BillResponse[]> => {
  return apiCall("/bills/show-all-bills");
};

// Add new bill
export const addBill = async (bill: BillRequest): Promise<BillResponse> => {
  return apiCall("/bills/add-bill", {
    method: "POST",
    body: JSON.stringify(bill),
  });
};

// Get bill by ID
export const getBillById = async (billId: number): Promise<BillResponse> => {
  return apiCall(`/bills/${billId}`);
};

// Update bill
export const updateBill = async (
  billId: number,
  bill: BillUpdateRequest
): Promise<BillResponse> => {
  return apiCall(`/bills/update-bill-details/${billId}`, {
    method: "PATCH",
    body: JSON.stringify(bill),
  });
};

// Delete bill
export const deleteBill = async (billId: number): Promise<void> => {
  return apiCall(`/bills/delete-billid/${billId}`, {
    method: "DELETE",
  });
};
```

#### 4. Authentication Functions
```typescript
// Get current user info
export const getCurrentUser = async (): Promise<UserResponse> => {
  return apiCall("/auth/user");
};
```

---

## 🛡️ Protected Routes (ProtectedRoute.tsx)

### Purpose
Ensure only authenticated users (and finance users) can access certain routes.

### Implementation
```typescript
export default function ProtectedRoute({ 
  children, 
  requireFinance = false 
}: Props) {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Check finance email requirement
  if (requireFinance && user?.email) {
    const email = user.email.toLowerCase();
    if (!email.startsWith("finance")) {
      return <InvalidAccess />;
    }
  }
  
  return <>{children}</>;
}
```

### Usage
```typescript
<Route
  path="/employee"
  element={
    <ProtectedRoute requireFinance={true}>
      <Employee />
    </ProtectedRoute>
  }
/>
```

---

## 📄 Page Components

### 1. Login.tsx

**Purpose**: Google OAuth login page

**Key Features**:
- Full-page centered layout
- Google sign-in button
- Auto-redirect if already authenticated
- Finance email check

**Flow**:
```typescript
const handleGoogleLogin = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
  window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
};
```

### 2. AuthCallback.tsx

**Purpose**: Handle OAuth callback from backend

**Flow**:
1. Extract token from URL query parameter
2. Store token in localStorage
3. Fetch user info from `/auth/user`
4. Update AuthContext
5. Redirect based on email domain:
   - `finance*` → `/employee`
   - Others → `/invalid-access`

### 3. Employee.tsx

**Purpose**: Main dashboard layout

**Structure**:
- Top navbar with user info and logout
- Two main cards:
  - Bills Management (CRUD operations)
  - Student Bills Management
- Outlet for nested routes

### 4. AddBill.tsx

**Purpose**: Create new bills

**Features**:
- Form validation
- Date validation (deadline > bill date)
- Amount validation (> 0)
- Success/error messages
- Form reset on success

**Data Flow**:
```
User Input → Validation → API Call → Success Message → Form Reset
```

### 5. ViewBills.tsx

**Purpose**: Display all bills in a table

**Features**:
- Search by ID or description
- Delete inline with confirmation
- Status indicators (days until deadline)
- Total amount calculation
- Refresh button

**State Management**:
```typescript
const [bills, setBills] = useState<BillResponse[]>([]);
const [searchTerm, setSearchTerm] = useState("");
const [loading, setLoading] = useState(true);
```

### 6. UpdateBill.tsx

**Purpose**: Update existing bills

**Flow**:
1. User enters bill ID
2. Fetch bill details
3. Populate form
4. User modifies fields
5. Submit updates
6. Show success message

### 7. DeleteBill.tsx

**Purpose**: Delete bills with confirmation

**Flow**:
1. User enters bill ID
2. Fetch and display bill details
3. User confirms deletion
4. Delete via API
5. Show success message

---

## 🎨 Styling Architecture

### Tailwind CSS Configuration
- **Location**: `tailwind.config.js`
- **Purpose**: Utility-first CSS framework
- **Features**:
  - Responsive design
  - Custom color palette
  - Component classes

### Global Styles
- **Location**: `src/index.css`
- **Purpose**: Base styles and resets
- **Features**:
  - Full-height layout
  - Scroll handling
  - Base typography

---

## 🔄 State Management Flow

### Component State (useState)
```typescript
// Local component state
const [bills, setBills] = useState<BillResponse[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### Global State (Context)
```typescript
// Accessed via useAuth() hook
const { user, isAuthenticated, logout } = useAuth();
```

### Side Effects (useEffect)
```typescript
// Fetch data on component mount
useEffect(() => {
  const fetchBills = async () => {
    setLoading(true);
    try {
      const data = await getAllBills();
      setBills(data);
    } catch (err) {
      setError("Failed to load bills");
    } finally {
      setLoading(false);
    }
  };
  
  fetchBills();
}, []);
```

---

## 🚨 Error Handling

### API Error Handling
```typescript
try {
  const data = await getAllBills();
  setBills(data);
} catch (error) {
  if (error instanceof Error) {
    setError(error.message);
  } else {
    setError("An unexpected error occurred");
  }
}
```

### Network Error Handling
- Display user-friendly messages
- Allow retry operations
- Log errors to console (development)

### Authentication Error Handling
- Auto-logout on 401
- Redirect to login page
- Clear invalid tokens

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Layout Adaptations
- Mobile: Single column, stacked layout
- Tablet: Two columns
- Desktop: Full layout with sidebar

---

## 🔧 Development Tools

### Vite
- **Purpose**: Build tool and dev server
- **Features**: Hot Module Replacement (HMR), fast builds

### TypeScript
- **Purpose**: Type safety
- **Location**: `tsconfig.json`
- **Benefits**: Catch errors at compile time

### ESLint
- **Purpose**: Code quality
- **Location**: `eslint.config.js`
- **Rules**: React best practices

---

## 📦 Build Process

### Development
```bash
npm run dev
# Starts Vite dev server on http://localhost:5173
# Hot reload enabled
```

### Production Build
```bash
npm run build
# Creates optimized build in dist/ folder
# Minified and tree-shaken
```

### Preview Production Build
```bash
npm run preview
# Serves production build locally
```

---

## 🎯 Key Design Decisions

### 1. Why React Context for Auth?
- Simple state management
- No external dependencies
- Sufficient for auth state
- Easy to understand

### 2. Why Centralized API Service?
- Single source of truth
- Consistent error handling
- Easy to update endpoints
- Token management in one place

### 3. Why TypeScript?
- Type safety
- Better IDE support
- Catch errors early
- Self-documenting code

### 4. Why Tailwind CSS?
- Rapid development
- Consistent design
- Small bundle size
- Easy customization

---

## 📚 Next Steps

1. **Read**: `03_BACKEND_ARCHITECTURE.md` - Backend structure
2. **Read**: `04_DATA_FLOW.md` - Detailed data flow
3. **Read**: `05_API_REFERENCE.md` - API documentation

---

**Last Updated**: 2024
**Version**: 1.0.0

