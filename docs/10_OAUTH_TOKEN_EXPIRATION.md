# Complete OAuth 2.0 & Token Expiration Guide

## 📋 Table of Contents

1. [OAuth 2.0 Flow Overview](#oauth-20-flow-overview)
2. [Current Token Implementation](#current-token-implementation)
3. [Session-Based Authentication](#session-based-authentication)
4. [Token Expiration](#token-expiration)
5. [What Happens When Token/Session Expires](#what-happens-when-tokensession-expires)
6. [How to Check Expiration](#how-to-check-expiration)
7. [Files Involved in Authentication](#files-involved-in-authentication)
8. [Session Configuration](#session-configuration)
9. [Implementing JWT Tokens (Future Enhancement)](#implementing-jwt-tokens-future-enhancement)
10. [Troubleshooting Authentication Issues](#troubleshooting-authentication-issues)

---

## 🔐 OAuth 2.0 Flow Overview

### Complete Authentication Flow (Current Implementation with Google Token Validation)

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐         ┌──────────────┐
│   Frontend  │         │   Backend    │         │   Google    │         │   Backend    │
│  (Login.tsx)│         │  (Spring)    │         │   OAuth     │         │  (Session)   │
└──────┬──────┘         └──────┬───────┘         └──────┬──────┘         └──────┬───────┘
       │                      │                        │                        │
       │ 1. Click "Sign in    │                        │                        │
       │    with Google"      │                        │                        │
       ├─────────────────────>│                        │                        │
       │                      │                        │                        │
       │                      │ 2. Redirect to Google  │                        │
       │                      │    OAuth endpoint      │                        │
       │                      ├───────────────────────>│                        │
       │                      │                        │                        │
       │                      │                        │ 3. User authenticates  │
       │                      │                        │    with Google         │
       │                      │                        │                        │
       │                      │ 4. Google redirects    │                        │
       │                      │    back with code      │                        │
       │                      │<───────────────────────┤                        │
       │                      │                        │                        │
       │                      │ 5. Exchange code for   │                        │
       │                      │    access token        │                        │
       │                      ├───────────────────────>│                        │
       │                      │                        │                        │
       │                      │ 6. Get user info       │                        │
       │                      │    from Google         │                        │
       │                      ├───────────────────────>│                        │
       │                      │                        │                        │
       │                      │ 7. Extract Google      │                        │
       │                      │    Access Token from   │                        │
       │                      │    OAuth2Authorized    │                        │
       │                      │    ClientService       │                        │
       │                      │                        │                        │
       │                      │ 8. Store user in       │                        │
       │                      │    HTTP session        │                        │
       │                      │    Store Google token  │                        │
       │                      │    in session          │                        │
       │                      │                        │                        │
       │ 9. Redirect to       │                        │                        │
       │    /oauth-callback   │                        │                        │
       │   ?token=GoogleToken │                        │                        │
       │<─────────────────────┤                        │                        │
       │                      │                        │                        │
       │ 10. Store Google     │                        │                        │
       │     token in          │                        │                        │
       │     localStorage      │                        │                        │
       │                      │                        │                        │
       │ 11. Call /auth/user  │                        │                        │
       │     (with session    │                        │                        │
       │     cookie)          │                        │                        │
       ├─────────────────────>│                        │                        │
       │                      │                        │                        │
       │                      │ 12. Get user from      │                        │
       │                      │     session             │                        │
       │                      │                        │                        │
       │ 13. User data        │                        │                        │
       │<─────────────────────┤                        │                        │
       │                      │                        │                        │
       │ 14. Redirect to      │                        │                        │
       │     /employee or     │                        │                        │
       │     /invalid-access  │                        │                        │
       │                      │                        │                        │
       │                      │                        │                        │
       │ 15. API Request with │                        │                        │
       │     Authorization:   │                        │                        │
       │     Bearer GoogleToken│                        │                        │
       ├─────────────────────>│                        │                        │
       │                      │                        │                        │
       │                      │ 16. GoogleToken        │                        │
       │                      │     ValidationFilter    │                        │
       │                      │     intercepts request │                        │
       │                      │                        │                        │
       │                      │ 17. Validate token     │                        │
       │                      │     with Google API    │                        │
       │                      ├───────────────────────>│                        │
       │                      │                        │                        │
       │                      │ 18. Google validates   │                        │
       │                      │     token, returns     │                        │
       │                      │     user email         │                        │
       │                      │<───────────────────────┤                        │
       │                      │                        │                        │
       │                      │ 19. If valid: Set      │                        │
       │                      │     authentication     │                        │
       │                      │     in SecurityContext │                        │
       │                      │     Allow request      │                        │
       │                      │                        │                        │
       │                      │ 20. If invalid:        │                        │
       │                      │     Return 401        │                        │
       │                      │                        │                        │
       │ 21. API Response     │                        │                        │
       │<─────────────────────┤                        │                        │
       │                      │                        │                        │
```

### Step-by-Step Explanation

1. **User Clicks Login** (`Login.tsx`)
   - User clicks "Sign in with Google" button
   - Frontend redirects to: `http://localhost:8080/oauth2/authorization/google`

2. **Backend Initiates OAuth** (`SecurityConfig.java`)
   - Spring Security intercepts the request
   - Redirects user to Google OAuth consent screen

3. **User Authenticates with Google**
   - User enters Google credentials
   - Google validates credentials
   - User grants permission to the application

4. **Google Redirects Back**
   - Google redirects to: `/login/oauth2/code/google`
   - Includes authorization code in URL

5. **Backend Exchanges Code** (Spring Security automatically)
   - Backend exchanges authorization code for access token
   - Uses access token to fetch user info from Google
   - Gets: email, name, picture

6. **OAuth2SuccessHandler Executes** (`OAuth2SuccessHandler.java`)
   - Receives authenticated OAuth2User
   - Extracts Google Access Token from `OAuth2AuthorizedClientService`
   - Stores user info in HTTP session
   - Stores Google access token in session
   - Sends Google access token to frontend (not custom token)
   - Redirects to frontend with Google token

7. **Frontend Receives Token** (`AuthCallback.tsx`)
   - Extracts token from URL query parameter
   - Stores token in localStorage
   - Calls `/auth/user` endpoint

8. **Backend Returns User Info** (`AuthController.java`)
   - Reads user from HTTP session
   - Returns UserResponse DTO

9. **Frontend Updates State** (`AuthContext.tsx`)
   - Stores user data in context
   - Sets isAuthenticated = true
   - Redirects to appropriate page

10. **Subsequent API Requests** (`GoogleTokenValidationFilter.java`)
    - Frontend sends Google token in `Authorization: Bearer {token}` header
    - Filter intercepts request
    - Validates token with Google's tokeninfo API
    - If valid: Sets authentication, allows request
    - If invalid/expired: Returns 401 Unauthorized

---

## 🎫 Current Token Implementation

### Token Generation (Updated - Now Uses Google Access Token)

**File**: `Backend/project/src/main/java/com/esd/project/Config/OAuth2SuccessHandler.java`

```java
// Extract Google access token from OAuth2AuthorizedClientService
OAuth2AuthorizedClient authorizedClient = 
    authorizedClientService.loadAuthorizedClient(clientRegistrationId, principalName);

if (authorizedClient != null) {
    OAuth2AccessToken accessToken = authorizedClient.getAccessToken();
    googleAccessToken = accessToken.getTokenValue();
}

// Use Google access token directly for validation
String token = googleAccessToken != null ? googleAccessToken : "oauth_" + encodedEmail;
```

**What This Does**:
- **Primary**: Extracts actual Google OAuth2 access token
- **Format**: `ya29.a0AfH6SMBx...` (long string, ~200+ characters)
- **Validated**: Token is validated with Google's API on each request
- **Expiration**: Token expires after 1 hour (3600 seconds)
- **Fallback**: If Google token unavailable, uses custom format `oauth_encoded_email`

### Token Storage

**Frontend**: `frontend/src/pages/AuthCallback.tsx`

```typescript
const token = query.get("token");
if (token) {
  localStorage.setItem("token", token);
}
```

**Storage Location**: Browser's `localStorage`
- Key: `"token"`
- Value: Simple string token
- **Persists until manually removed** (survives browser restarts)

### Token Usage

**File**: `frontend/src/services/api.ts`

```typescript
const getAuthToken = (): string | null => {
  return localStorage.getItem("token");
};

const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  // ...
};
```

**How It's Used**:
- Token is sent in `Authorization` header as `Bearer {token}`
- **Backend validates Google tokens** via `GoogleTokenValidationFilter`
- Token validation happens automatically on each request
- If token is Google format (`ya29.*`): Validated with Google API
- If token is custom format (`oauth_*`): Uses session-based authentication (fallback)

---

## 🍪 Session-Based Authentication

### How Sessions Work

**Backend Session Storage** (`OAuth2SuccessHandler.java`):

```java
// Store user info in session for /auth/user endpoint
request.getSession().setAttribute("oauth2User", oauth2User);
request.getSession().setAttribute("userEmail", email);
request.getSession().setAttribute("userName", name);
request.getSession().setAttribute("userPicture", picture);
```

**What Gets Stored**:
- `oauth2User` - Full OAuth2User object
- `userEmail` - User's email address
- `userName` - User's name
- `userPicture` - User's profile picture URL

**Session Cookie**:
- Spring Security automatically creates a session cookie
- Cookie name: `JSESSIONID`
- Sent automatically with each request (via `credentials: "include"`)

**File**: `frontend/src/services/api.ts`

```typescript
const response = await fetch(`${API_BASE_URL}${endpoint}`, {
  ...options,
  headers,
  credentials: "include", // Include cookies for session-based auth
});
```

### Session Retrieval

**File**: `Backend/project/src/main/java/com/esd/project/Controller/AuthController.java`

```java
@GetMapping("/user")
public UserResponse currentUser(
        @AuthenticationPrincipal OAuth2User principal,
        HttpServletRequest request) {
    
    // Try to get from principal first (from session cookie)
    if (principal != null) {
        return UserMapper.toResponse(principal);
    }
    
    // Fallback to session OAuth2User object
    OAuth2User oauth2User = (OAuth2User) request.getSession().getAttribute("oauth2User");
    if (oauth2User != null) {
        return UserMapper.toResponse(oauth2User);
    }
    
    // Fallback to direct session attributes
    String email = (String) request.getSession().getAttribute("userEmail");
    // ...
}
```

**Priority Order**:
1. `@AuthenticationPrincipal` - From Spring Security context (session cookie)
2. Session attribute `oauth2User` - Direct session object
3. Individual session attributes - `userEmail`, `userName`, `userPicture`

---

## ⏰ Token Expiration

### Current Implementation: Google Token with Expiration

**Important**: The system now uses **Google OAuth2 access tokens** which have **expiration time**.

- **Google Access Token**: `ya29.a0AfH6SMBx...` (validated with Google)
- **Expiration**: 1 hour (3600 seconds) from issue time
- **Validation**: Token is validated on each API request via Google's API
- **Custom Token Fallback**: `oauth_encoded_email` (no expiration, uses session)
- **Backend validates tokens** automatically via `GoogleTokenValidationFilter`

### Session Expiration

**What Actually Expires**: HTTP Session (not the token)

**Default Session Timeout**: 
- Spring Boot default: **30 minutes of inactivity**
- Configurable in `application.properties`

**Session Expiration Triggers**:
1. **Inactivity Timeout** - No requests for 30 minutes
2. **Server Restart** - All sessions lost
3. **Explicit Invalidation** - Logout or session.invalidate()
4. **Browser Close** - Session cookie may be lost (if not persistent)

### How to Configure Session Timeout

**File**: `Backend/project/src/main/resources/application.properties`

```properties
# Session timeout in seconds (default: 1800 = 30 minutes)
server.servlet.session.timeout=1800

# Or use duration format
server.servlet.session.timeout=30m

# For production, you might want longer sessions
server.servlet.session.timeout=2h
```

**Session Cookie Configuration** (in `SecurityConfig.java`):

```java
// You can configure session cookie settings
http.sessionManagement(session -> session
    .maximumSessions(1) // Only one session per user
    .maxSessionsPreventsLogin(false) // Allow new login to invalidate old session
);
```

---

## 🚨 What Happens When Token/Session Expires

### Scenario 1: Google Token Expires (Most Common)

**What Happens**:

1. **User Makes API Request** (`api.ts`)
   ```typescript
   const response = await fetch(`${API_BASE_URL}${endpoint}`, {
     headers: { "Authorization": `Bearer ${googleToken}` },
     credentials: "include", // Sends session cookie
   });
   ```

2. **GoogleTokenValidationFilter Intercepts** (`GoogleTokenValidationFilter.java`)
   - Extracts token from Authorization header
   - Calls Google's tokeninfo API to validate token
   - Google returns: Token expired or invalid

3. **Backend Returns 401** (`GoogleTokenValidationFilter.java`)
   ```java
   if (!tokenInfo.isValid()) {
       response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
       response.getWriter().write("{\"error\":\"Invalid or expired token\"}");
       return;
   }
   ```

4. **Frontend Detects 401** (`api.ts`)
   ```typescript
   if (response.status === 401) {
     localStorage.removeItem("token");
     window.location.href = "/login";
   }
   ```

5. **User Redirected to Login**
   - Token removed from localStorage
   - User must re-authenticate with Google

### Scenario 2: Token Removed from localStorage

**What Happens**:

1. **User Clears Browser Data** or token is manually removed
2. **Frontend Checks Token** (`AuthContext.tsx`)
   ```typescript
   const token = localStorage.getItem("token");
   if (token) {
     // Try to get user
   } else {
     // No token, not authenticated
   }
   ```

3. **If Session Still Valid**:
   - User can still make API calls (session cookie works)
   - But frontend thinks user is not authenticated
   - May cause UI inconsistencies

4. **If Session Expired**:
   - API calls fail with 401
   - User redirected to login

### Scenario 3: Server Restart

**What Happens**:

1. **All Sessions Lost**
   - Server restarts
   - All HTTP sessions cleared from memory
   - Session cookies become invalid

2. **Next API Request**:
   - Session cookie invalid
   - Returns 401 Unauthorized
   - Frontend redirects to login

3. **User Must Re-authenticate**

### Scenario 4: Browser Closed and Reopened

**What Happens**:

1. **Session Cookie**:
   - If cookie is **session cookie** (not persistent): Lost
   - If cookie is **persistent**: May survive (depends on browser)

2. **localStorage Token**:
   - **Survives** browser restart
   - Token still exists

3. **On App Load** (`AuthContext.tsx`):
   ```typescript
   useEffect(() => {
     const token = localStorage.getItem("token");
     if (token) {
       try {
         const userData = await getCurrentUser();
         // If session expired, this will fail with 401
       } catch (error) {
         // Remove token, redirect to login
       }
     }
   }, []);
   ```

4. **If Session Expired**:
   - `getCurrentUser()` returns 401
   - Token removed
   - User redirected to login

---

## 🔍 How to Check Expiration

### Method 1: Check Session Expiration (Backend)

**File**: `Backend/project/src/main/java/com/esd/project/Controller/AuthController.java`

You can add session expiration checking:

```java
@GetMapping("/user")
public UserResponse currentUser(
        @AuthenticationPrincipal OAuth2User principal,
        HttpServletRequest request) {
    
    HttpSession session = request.getSession(false); // Don't create new session
    
    if (session == null) {
        // Session expired or doesn't exist
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session expired");
    }
    
    // Check if session is still valid
    long lastAccessedTime = session.getLastAccessedTime();
    int maxInactiveInterval = session.getMaxInactiveInterval();
    long currentTime = System.currentTimeMillis();
    
    if ((currentTime - lastAccessedTime) > (maxInactiveInterval * 1000)) {
        // Session expired
        session.invalidate();
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session expired");
    }
    
    // Session is valid, return user
    // ...
}
```

### Method 2: Check Token Existence (Frontend)

**File**: `frontend/src/context/AuthContext.tsx`

```typescript
useEffect(() => {
  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const userData = await getCurrentUser();
        // If this succeeds, session is still valid
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        // Session expired or invalid
        console.error("Auth check failed:", error);
        localStorage.removeItem("token");
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  };
  checkAuth();
}, []);
```

### Method 3: Check API Response Status

**File**: `frontend/src/services/api.ts`

```typescript
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  // ...
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 401) {
    // Session expired or unauthorized
    localStorage.removeItem("token");
    window.location.href = "/login";
  }
  // ...
};
```

### Method 4: Add Expiration Endpoint (Recommended)

**Create New Endpoint**: `Backend/project/src/main/java/com/esd/project/Controller/AuthController.java`

```java
@GetMapping("/auth/session-status")
public Map<String, Object> getSessionStatus(HttpServletRequest request) {
    HttpSession session = request.getSession(false);
    Map<String, Object> status = new HashMap<>();
    
    if (session == null) {
        status.put("valid", false);
        status.put("message", "No active session");
        return status;
    }
    
    long lastAccessedTime = session.getLastAccessedTime();
    int maxInactiveInterval = session.getMaxInactiveInterval();
    long currentTime = System.currentTimeMillis();
    long timeUntilExpiry = (maxInactiveInterval * 1000) - (currentTime - lastAccessedTime);
    
    status.put("valid", true);
    status.put("expiresIn", timeUntilExpiry / 1000); // seconds
    status.put("maxInactiveInterval", maxInactiveInterval);
    status.put("lastAccessedTime", lastAccessedTime);
    
    return status;
}
```

**Frontend Usage**:

```typescript
export const checkSessionStatus = async () => {
  return apiCall("/auth/session-status", { method: "GET" });
};

// Use in component
useEffect(() => {
  const checkSession = async () => {
    try {
      const status = await checkSessionStatus();
      if (!status.valid) {
        // Session expired
        logout();
      } else {
        console.log(`Session expires in ${status.expiresIn} seconds`);
      }
    } catch (error) {
      // Session expired
      logout();
    }
  };
  
  // Check every 5 minutes
  const interval = setInterval(checkSession, 5 * 60 * 1000);
  return () => clearInterval(interval);
}, []);
```

---

## 📁 Files Involved in Authentication

### Backend Files

#### 1. `Backend/project/src/main/java/com/esd/project/Config/OAuth2SuccessHandler.java`

**Purpose**: Handles successful OAuth authentication

**What It Does**:
- Receives OAuth2User after Google authentication
- **Extracts Google access token** from OAuth2AuthorizedClientService
- Stores user info in HTTP session
- Stores Google access token in session
- Sends Google access token to frontend (for validation)

**Key Code**:
```java
// Extract Google access token
OAuth2AuthorizedClient authorizedClient = 
    authorizedClientService.loadAuthorizedClient(clientRegistrationId, principalName);
OAuth2AccessToken accessToken = authorizedClient.getAccessToken();
String googleAccessToken = accessToken.getTokenValue();

// Store in session
request.getSession().setAttribute("oauth2User", oauth2User);
request.getSession().setAttribute("googleAccessToken", googleAccessToken);

// Send Google token to frontend
String token = googleAccessToken != null ? googleAccessToken : "oauth_" + encodedEmail;
String redirectUrl = "http://localhost:5173/oauth-callback?token=" + URLEncoder.encode(token, StandardCharsets.UTF_8);
```

**Expiration Related**:
- Creates HTTP session (expires after inactivity)
- Google token expires after 1 hour
- Token is validated on each request

---

#### 2. `Backend/project/src/main/java/com/esd/project/Config/SecurityConfig.java`

**Purpose**: Configures Spring Security and OAuth2

**What It Does**:
- Configures OAuth2 login
- Sets up CORS
- Protects endpoints
- Sets OAuth2SuccessHandler
- **Adds GoogleTokenValidationFilter** to validate tokens

**Key Code**:
```java
.addFilterBefore(googleTokenValidationFilter, UsernamePasswordAuthenticationFilter.class)
.oauth2Login(oauth -> oauth
    .successHandler(oAuth2SuccessHandler)
    .failureUrl("http://localhost:5173/login?error=true")
)
```

**Expiration Related**:
- Session management configuration
- Token validation filter runs before authentication
- Can configure session timeout here

---

#### 3. `Backend/project/src/main/java/com/esd/project/Controller/AuthController.java`

**Purpose**: Provides authentication endpoints

**What It Does**:
- `/auth/user` - Returns current user from session
- Checks session for user data
- Returns UserResponse DTO

**Key Code**:
```java
@GetMapping("/user")
public UserResponse currentUser(
        @AuthenticationPrincipal OAuth2User principal,
        HttpServletRequest request) {
    // Gets user from session
}
```

**Expiration Related**:
- Returns 401 if session expired (handled by Spring Security)
- Can check session validity here

---

#### 4. `Backend/project/src/main/java/com/esd/project/Service/GoogleTokenValidationService.java` ⭐ **NEW**

**Purpose**: Validates Google OAuth2 access tokens

**What It Does**:
- Calls Google's tokeninfo API to validate tokens
- Checks token expiration
- Verifies client ID
- Returns validation result with user email

**Key Code**:
```java
public TokenInfo validateToken(String accessToken) {
    String url = "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=" + accessToken;
    // Validates with Google API
    // Checks expiration, client ID, returns user email
}
```

**Expiration Related**:
- Validates token expiration with Google
- Returns expiration status
- Used by GoogleTokenValidationFilter

---

#### 5. `Backend/project/src/main/java/com/esd/project/Config/GoogleTokenValidationFilter.java` ⭐ **NEW**

**Purpose**: Intercepts requests and validates Google tokens

**What It Does**:
- Filters all API requests (except OAuth2 endpoints)
- Extracts token from Authorization header
- Validates Google tokens via GoogleTokenValidationService
- Sets authentication if valid
- Returns 401 if invalid/expired

**Key Code**:
```java
if (token.startsWith("ya29.")) {
    TokenInfo tokenInfo = tokenValidationService.validateToken(token);
    if (tokenInfo.isValid()) {
        // Set authentication
    } else {
        // Return 401
    }
}
```

**Expiration Related**:
- Detects expired tokens via Google validation
- Returns 401 for expired tokens
- Runs before authentication filters

---

#### 6. `Backend/project/src/main/resources/application.properties`

**Purpose**: Application configuration

**What It Does**:
- OAuth2 client credentials
- Database configuration
- **Session timeout configuration**

**Key Code**:
```properties
# OAuth2 Configuration
spring.security.oauth2.client.registration.google.client-id=...
spring.security.oauth2.client.registration.google.client-secret=...

# Session timeout (can be added)
server.servlet.session.timeout=1800
```

**Expiration Related**:
- Configure session timeout here
- OAuth2 token expiration (handled by Google, validated by our service)

---

### Frontend Files

#### 1. `frontend/src/pages/Login.tsx`

**Purpose**: Login page

**What It Does**:
- Displays login UI
- Redirects to OAuth endpoint
- Checks if user already authenticated

**Key Code**:
```typescript
const handleGoogleLogin = () => {
  window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
};
```

**Expiration Related**:
- Entry point for authentication
- Redirects if already authenticated

---

#### 2. `frontend/src/pages/AuthCallback.tsx`

**Purpose**: Handles OAuth callback

**What It Does**:
- Receives token from URL
- Stores token in localStorage
- Calls `/auth/user` to get user info
- Redirects to appropriate page

**Key Code**:
```typescript
const token = query.get("token");
if (token) {
  localStorage.setItem("token", token);
}
const userData = await getCurrentUser();
```

**Expiration Related**:
- Stores token (no expiration check)
- If `/auth/user` fails, token is removed

---

#### 3. `frontend/src/context/AuthContext.tsx`

**Purpose**: Global authentication state

**What It Does**:
- Manages authentication state
- Checks token on app load
- Provides login/logout functions

**Key Code**:
```typescript
useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    const userData = await getCurrentUser();
    // If fails, session expired
  }
}, []);

const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};
```

**Expiration Related**:
- Checks authentication on app load
- Removes token if session expired
- Logout function clears token

---

#### 4. `frontend/src/services/api.ts`

**Purpose**: API service layer

**What It Does**:
- Makes HTTP requests
- Adds Authorization header
- Handles 401 errors (session expired)

**Key Code**:
```typescript
const token = getAuthToken();
if (token) {
  headers["Authorization"] = `Bearer ${token}`;
}

if (response.status === 401) {
  localStorage.removeItem("token");
  window.location.href = "/login";
}
```

**Expiration Related**:
- Detects 401 (session expired)
- Removes token and redirects to login
- **This is the main expiration detection mechanism**

---

#### 5. `frontend/src/components/ProtectedRoute.tsx`

**Purpose**: Route protection

**What It Does**:
- Protects routes that require authentication
- Redirects to login if not authenticated

**Key Code**:
```typescript
if (!isAuthenticated) {
  return <Navigate to="/login" />;
}
```

**Expiration Related**:
- Uses `isAuthenticated` from AuthContext
- If session expired, `isAuthenticated` becomes false

---

## ⚙️ Session Configuration

### Default Session Settings

**Spring Boot Defaults**:
- **Session Timeout**: 30 minutes of inactivity
- **Session Storage**: In-memory (lost on server restart)
- **Cookie Name**: `JSESSIONID`
- **Cookie Type**: Session cookie (not persistent)

### Configure Session Timeout

**Option 1: application.properties**

```properties
# Session timeout in seconds
server.servlet.session.timeout=1800

# Or use duration
server.servlet.session.timeout=30m
server.servlet.session.timeout=2h
```

**Option 2: SecurityConfig.java**

```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .sessionManagement(session -> session
            .maximumSessions(1) // Only one session per user
            .maxSessionsPreventsLogin(false) // New login invalidates old
            .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
        )
        // ... other config
    return http.build();
}
```

### Configure Persistent Sessions

**For Production**: Use Redis or database for session storage

**Add Dependency** (`pom.xml`):
```xml
<dependency>
    <groupId>org.springframework.session</groupId>
    <artifactId>spring-session-data-redis</artifactId>
</dependency>
```

**Configure Redis** (`application.properties`):
```properties
spring.session.store-type=redis
spring.redis.host=localhost
spring.redis.port=6379
```

---

## 🚀 Implementing JWT Tokens (Future Enhancement)

### Why JWT?

**Current Issues**:
- Token is just a string (not secure)
- No expiration time
- Backend doesn't validate token
- Relies on session (lost on server restart)

**JWT Benefits**:
- Self-contained (no session needed)
- Stateless (works across server restarts)
- Can include expiration time
- Can include user claims
- Cryptographically signed

### Implementation Steps

#### Step 1: Add JWT Dependencies

**File**: `Backend/project/pom.xml`

```xml
<!-- Already present in your pom.xml -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>
```

#### Step 2: Create JWT Service

**File**: `Backend/project/src/main/java/com/esd/project/Service/JwtService.java`

```java
package com.esd.project.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {
    
    @Value("${jwt.secret:your-secret-key-must-be-at-least-256-bits-long-for-HS256}")
    private String secret;
    
    @Value("${jwt.expiration:3600000}") // 1 hour in milliseconds
    private Long expiration;
    
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
    
    public String generateToken(String email, String name) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", email);
        claims.put("name", name);
        
        return Jwts.builder()
                .claims(claims)
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }
    
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }
    
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
    
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
    
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    
    public Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
    
    public Boolean validateToken(String token, String email) {
        final String tokenEmail = extractEmail(token);
        return (tokenEmail.equals(email) && !isTokenExpired(token));
    }
}
```

#### Step 3: Update OAuth2SuccessHandler

**File**: `Backend/project/src/main/java/com/esd/project/Config/OAuth2SuccessHandler.java`

```java
private final JwtService jwtService;

public OAuth2SuccessHandler(JwtService jwtService) {
    this.jwtService = jwtService;
}

@Override
public void onAuthenticationSuccess(...) {
    OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
    String email = oauth2User.getAttribute("email");
    String name = oauth2User.getAttribute("name");
    
    // Generate JWT token with expiration
    String token = jwtService.generateToken(email, name);
    
    // Still store in session for backward compatibility
    request.getSession().setAttribute("oauth2User", oauth2User);
    
    // Redirect with JWT token
    String redirectUrl = "http://localhost:5173/oauth-callback?token=" + token;
    getRedirectStrategy().sendRedirect(request, response, redirectUrl);
}
```

#### Step 4: Create JWT Filter

**File**: `Backend/project/src/main/java/com/esd/project/Config/JwtAuthenticationFilter.java`

```java
package com.esd.project.Config;

import com.esd.project.Service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtService jwtService;
    
    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            
            try {
                if (!jwtService.isTokenExpired(token)) {
                    String email = jwtService.extractEmail(token);
                    
                    // Create authentication
                    UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(
                            email, null, new ArrayList<>()
                        );
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } else {
                    // Token expired
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("{\"error\":\"Token expired\"}");
                    return;
                }
            } catch (Exception e) {
                // Invalid token
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"error\":\"Invalid token\"}");
                return;
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
```

#### Step 5: Update SecurityConfig

**File**: `Backend/project/src/main/java/com/esd/project/Config/SecurityConfig.java`

```java
private final JwtAuthenticationFilter jwtAuthenticationFilter;

public SecurityConfig(OAuth2SuccessHandler oAuth2SuccessHandler, 
                     JwtAuthenticationFilter jwtAuthenticationFilter) {
    this.oAuth2SuccessHandler = oAuth2SuccessHandler;
    this.jwtAuthenticationFilter = jwtAuthenticationFilter;
}

@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable())
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
        // ... rest of config
    return http.build();
}
```

#### Step 6: Add JWT Configuration

**File**: `Backend/project/src/main/resources/application.properties`

```properties
# JWT Configuration
jwt.secret=your-secret-key-must-be-at-least-256-bits-long-for-HS256-algorithm
jwt.expiration=3600000
```

#### Step 7: Frontend - Check Token Expiration

**File**: `frontend/src/services/api.ts`

```typescript
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch {
    return true;
  }
};

const getAuthToken = (): string | null => {
  const token = localStorage.getItem("token");
  if (token && isTokenExpired(token)) {
    localStorage.removeItem("token");
    return null;
  }
  return token;
};
```

---

## 🔧 Troubleshooting Authentication Issues

### Issue 1: "Session Expired" After 30 Minutes

**Cause**: Default session timeout (30 minutes)

**Solution**:
1. Increase session timeout in `application.properties`
2. Implement JWT tokens (no session needed)
3. Add session refresh mechanism

---

### Issue 2: Token Still in localStorage But API Returns 401

**Cause**: Google token expired (after 1 hour) or invalid

**Solution**:
- This is expected behavior - Google tokens expire after 1 hour
- Frontend already handles this in `api.ts` (removes token on 401)
- User must re-authenticate with Google to get a new token
- Token validation happens automatically via GoogleTokenValidationFilter

---

### Issue 3: User Logged Out After Server Restart

**Cause**: Sessions stored in memory (lost on restart)

**Solution**:
1. Use Redis for session storage
2. Implement JWT tokens (stateless)
3. Add session persistence

---

### Issue 4: Multiple Tabs - One Logs Out, Others Still Work

**Cause**: Each tab has separate localStorage, but shares session cookie

**Solution**:
- Add localStorage event listener to sync logout across tabs
- Or use sessionStorage instead of localStorage

---

### Issue 5: Google Token Expires After 1 Hour

**Cause**: Google OAuth2 access tokens expire after 1 hour (3600 seconds)

**Solution**:
- This is expected behavior - Google tokens have 1-hour expiration
- User must re-authenticate when token expires
- Future enhancement: Implement refresh token flow for automatic renewal
- Current workaround: Session-based auth still works as fallback

---

## 📝 Summary

### Current Authentication System (Updated)

1. **OAuth2 Flow**: Google OAuth2 for authentication
2. **Token**: Google OAuth2 access token (expires after 1 hour)
3. **Token Validation**: Automatic validation with Google's API on each request
4. **Session**: HTTP session (30 min timeout) - used as fallback
5. **Storage**: Google token in localStorage, session in cookie
6. **Expiration Detection**: 401 response from API when token invalid/expired

### Key Points

- **Google token expires** - after 1 hour (3600 seconds)
- **Token is validated** - on each API request via GoogleTokenValidationFilter
- **Session expires** - after 30 minutes of inactivity (fallback)
- **Expiration detected** - via 401 response in `api.ts`
- **Files involved** - OAuth2SuccessHandler, GoogleTokenValidationFilter, GoogleTokenValidationService, AuthController, api.ts, AuthContext
- **Backward compatible** - Custom tokens (`oauth_*`) still work via session auth

### Recommendations

1. **For Production**: Implement JWT tokens with expiration
2. **Session Timeout**: Configure appropriate timeout for your use case
3. **Expiration Checking**: Add session status endpoint
4. **User Experience**: Show expiration countdown to users

---

**Last Updated**: 2024
**Version**: 1.0.0

