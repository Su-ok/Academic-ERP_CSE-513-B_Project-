# Google Token Validation Implementation Guide

## 📋 Overview

This document explains how Google OAuth2 token validation has been implemented in your backend. The system now validates Google access tokens on each API request, ensuring that only valid, non-expired tokens are accepted.

---

## ✅ What Has Been Implemented

### 1. **GoogleTokenValidationService** 
**Location**: `Backend/project/src/main/java/com/esd/project/Service/GoogleTokenValidationService.java`

**Purpose**: Validates Google OAuth2 access tokens by calling Google's tokeninfo endpoint.

**Key Methods**:
- `validateToken(String accessToken)` - Validates token and returns TokenInfo
- `getUserInfoFromToken(String accessToken)` - Gets user info from token

**How It Works**:
1. Calls Google's tokeninfo endpoint: `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token={token}`
2. Checks if token is valid
3. Verifies token was issued to your application (client ID check)
4. Checks token expiration
5. Returns validation result with user email

---

### 2. **GoogleTokenValidationFilter**
**Location**: `Backend/project/src/main/java/com/esd/project/Config/GoogleTokenValidationFilter.java`

**Purpose**: Intercepts HTTP requests and validates Google tokens from Authorization header.

**How It Works**:
1. Intercepts all requests (except OAuth2 endpoints)
2. Extracts token from `Authorization: Bearer {token}` header
3. Identifies token type:
   - Custom token (`oauth_*`) → Skip Google validation, use session auth
   - Google token (`ya29.*` or long token) → Validate with Google
4. If valid → Sets authentication in SecurityContext
5. If invalid → Returns 401 Unauthorized

**Token Type Detection**:
```java
// Custom token format
if (token.startsWith("oauth_")) {
    // Skip Google validation, use session
}

// Google access token
if (token.startsWith("ya29.") || token.length() > 100) {
    // Validate with Google
}
```

---

### 3. **Updated OAuth2SuccessHandler**
**Location**: `Backend/project/src/main/java/com/esd/project/Config/OAuth2SuccessHandler.java`

**Changes**:
- Now extracts actual Google access token from `OAuth2AuthorizedClientService`
- Stores Google token in session
- Sends Google access token to frontend (instead of custom token)

**How It Gets Google Token**:
```java
OAuth2AuthorizedClient authorizedClient = 
    authorizedClientService.loadAuthorizedClient(clientRegistrationId, principalName);

if (authorizedClient != null) {
    OAuth2AccessToken accessToken = authorizedClient.getAccessToken();
    googleAccessToken = accessToken.getTokenValue();
}
```

---

### 4. **Updated SecurityConfig**
**Location**: `Backend/project/src/main/java/com/esd/project/Config/SecurityConfig.java`

**Changes**:
- Added `GoogleTokenValidationFilter` to the security filter chain
- Filter runs before other authentication filters

```java
.addFilterBefore(googleTokenValidationFilter, UsernamePasswordAuthenticationFilter.class)
```

---

## 🔄 How It Works - Complete Flow

### Authentication Flow

```
1. User clicks "Sign in with Google"
   ↓
2. Redirects to Google OAuth
   ↓
3. User authenticates with Google
   ↓
4. Google redirects back with authorization code
   ↓
5. Spring Security exchanges code for access token
   ↓
6. OAuth2SuccessHandler extracts Google access token
   ↓
7. Stores token in session
   ↓
8. Sends Google access token to frontend
   ↓
9. Frontend stores token in localStorage
   ↓
10. Frontend sends token in Authorization header with each request
    ↓
11. GoogleTokenValidationFilter intercepts request
    ↓
12. Validates token with Google's API
    ↓
13. If valid → Allow request
    If invalid → Return 401
```

---

## 🎯 Token Validation Process

### Step-by-Step Validation

1. **Extract Token from Header**
   ```http
   Authorization: Bearer ya29.a0AfH6SMBx...
   ```

2. **Identify Token Type**
   - Custom token (`oauth_*`) → Use session-based auth
   - Google token → Validate with Google

3. **Call Google Tokeninfo Endpoint**
   ```
   GET https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=ya29.a0AfH6SMBx...
   ```

4. **Google Response** (if valid):
   ```json
   {
     "audience": "1097971379978-...",
     "email": "finance.user@example.com",
     "expires_in": 3599,
     "scope": "openid https://www.googleapis.com/auth/userinfo.email ...",
     "verified_email": true
   }
   ```

5. **Validation Checks**:
   - ✅ Token exists and is valid
   - ✅ Token issued to your client ID
   - ✅ Token not expired (`expires_in > 0`)
   - ✅ User email extracted

6. **Set Authentication**:
   - Create `UsernamePasswordAuthenticationToken`
   - Set in `SecurityContextHolder`
   - Request proceeds with authenticated user

---

## 📝 Token Types

### 1. Google Access Token
**Format**: `ya29.a0AfH6SMBx...` (long string, ~200+ characters)

**Characteristics**:
- Issued by Google
- Has expiration time (usually 1 hour)
- Can be validated with Google's API
- Contains user information

**Validation**: ✅ **Validated with Google**

---

### 2. Custom Token (Legacy)
**Format**: `oauth_finance.user_at_example.com`

**Characteristics**:
- Generated by your backend
- No expiration
- Not validated
- Used for backward compatibility

**Validation**: ❌ **Not validated** (uses session-based auth)

---

## 🔒 Security Features

### 1. Token Validation
- Every Google token is validated with Google's API
- Invalid or expired tokens are rejected
- Returns 401 Unauthorized for invalid tokens

### 2. Client ID Verification
- Verifies token was issued to your application
- Prevents token reuse from other applications

### 3. Expiration Checking
- Checks token expiration time
- Rejects expired tokens automatically

### 4. Fallback to Session Auth
- Custom tokens still work (session-based)
- Allows gradual migration

---

## 🚀 Usage

### Frontend - Sending Token

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

**Note**: The token stored in localStorage is now the actual Google access token (not the custom format).

---

### Backend - Token Validation

**Automatic**: The filter automatically validates tokens on each request.

**Manual Validation** (if needed):
```java
@Autowired
private GoogleTokenValidationService tokenValidationService;

public void someMethod(String token) {
    GoogleTokenValidationService.TokenInfo info = 
        tokenValidationService.validateToken(token);
    
    if (info.isValid()) {
        String email = info.getEmail();
        // Use email
    }
}
```

---

## ⚠️ Important Notes

### 1. Token Expiration
- Google access tokens expire after **1 hour** (3600 seconds)
- When token expires, user must re-authenticate
- Frontend should handle 401 responses and redirect to login

### 2. Token Refresh
- Google tokens can be refreshed using refresh tokens
- Currently, refresh tokens are not implemented
- Users need to re-authenticate when token expires

### 3. Performance
- Each validation makes an HTTP call to Google
- Consider caching validation results (with expiration)
- For production, implement token caching

### 4. Rate Limiting
- Google's tokeninfo endpoint has rate limits
- Too many requests might be throttled
- Consider implementing local token caching

---

## 🔧 Configuration

### No Additional Configuration Needed

The implementation uses existing OAuth2 configuration from `application.properties`:

```properties
spring.security.oauth2.client.registration.google.client-id=...
spring.security.oauth2.client.registration.google.client-secret=...
```

The `client-id` is used to verify tokens were issued to your application.

---

## 🧪 Testing

### Test Token Validation

1. **Get a valid token**:
   - Login with Google
   - Check localStorage for token
   - Token should start with `ya29.`

2. **Test API call with token**:
   ```bash
   curl -H "Authorization: Bearer ya29.a0AfH6SMBx..." \
        http://localhost:8080/bills/show-all-bills
   ```

3. **Test with invalid token**:
   ```bash
   curl -H "Authorization: Bearer invalid_token" \
        http://localhost:8080/bills/show-all-bills
   ```
   Should return: `401 Unauthorized`

4. **Test with expired token**:
   - Wait 1 hour after login
   - Make API call
   - Should return: `401 Unauthorized`

---

## 🐛 Troubleshooting

### Issue 1: Token Validation Always Fails

**Symptoms**: All requests return 401, even with valid tokens

**Possible Causes**:
1. Client ID mismatch
2. Network issue calling Google API
3. Token format incorrect

**Solution**:
- Check `application.properties` has correct `client-id`
- Check network connectivity to Google
- Verify token format (should start with `ya29.`)

---

### Issue 2: Token Works But Validation Fails

**Symptoms**: Token works in browser but fails in API calls

**Possible Causes**:
1. Token not sent in Authorization header
2. Token format incorrect in header

**Solution**:
- Verify frontend sends: `Authorization: Bearer {token}`
- Check token doesn't have extra spaces

---

### Issue 3: Custom Tokens Not Working

**Symptoms**: Requests with `oauth_*` tokens fail

**Possible Causes**:
- Filter might be blocking custom tokens

**Solution**:
- Custom tokens should bypass Google validation
- Check filter logic for `token.startsWith("oauth_")`

---

## 📊 Token Validation Response Examples

### Valid Token Response
```json
{
  "audience": "1097971379978-st4tnvto1pb8kujl7r33vd0qaqvs27jo.apps.googleusercontent.com",
  "email": "finance.user@example.com",
  "expires_in": 3599,
  "scope": "openid https://www.googleapis.com/auth/userinfo.email ...",
  "verified_email": true
}
```

### Invalid Token Response
```json
{
  "error": "invalid_token",
  "error_description": "Invalid Value"
}
```

---

## 🎯 Next Steps (Optional Enhancements)

### 1. Token Caching
- Cache validation results for 5 minutes
- Reduce calls to Google API
- Improve performance

### 2. Token Refresh
- Implement refresh token flow
- Automatically refresh expired tokens
- Better user experience

### 3. Token Blacklisting
- Store revoked tokens
- Reject blacklisted tokens immediately
- Enhanced security

### 4. JWT Implementation
- Replace Google tokens with your own JWT
- Include expiration and user claims
- Validate locally (no Google API calls)

---

## 📚 Related Documentation

- [OAuth Token Expiration Guide](./10_OAUTH_TOKEN_EXPIRATION.md)
- [Security Configuration](./03_BACKEND_ARCHITECTURE.md#security-configuration)
- [API Reference](./05_API_REFERENCE.md)

---

## ✅ Summary

**What's Working**:
- ✅ Google access tokens are extracted after OAuth2 login
- ✅ Tokens are sent to frontend
- ✅ Tokens are validated on each API request
- ✅ Invalid/expired tokens are rejected
- ✅ Custom tokens still work (session-based)

**Benefits**:
- 🔒 Enhanced security (token validation)
- ✅ Prevents token reuse
- ✅ Automatic expiration handling
- ✅ Real-time validation with Google

**Limitations**:
- ⚠️ Token expires after 1 hour
- ⚠️ No automatic refresh (user must re-login)
- ⚠️ Each validation calls Google API (performance)

---

**Last Updated**: 2024
**Version**: 1.0.0

