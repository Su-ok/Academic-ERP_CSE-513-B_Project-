# Setup and Installation Guide

## 📋 Prerequisites

### Required Software
- **Java 17+** (for Spring Boot backend)
- **Node.js 18+** (for React frontend)
- **MySQL 8.0+** (database)
- **Maven 3.6+** (or use Maven wrapper)
- **Git** (version control)

### Development Tools (Optional)
- **IDE**: IntelliJ IDEA, Eclipse, or VS Code
- **Postman** or **cURL** (for API testing)
- **MySQL Workbench** (database management)

---

## 🗄️ Database Setup

### 1. Install MySQL
Download and install MySQL from: https://dev.mysql.com/downloads/

### 2. Create Database
```sql
CREATE DATABASE ESDPROJECT;
```

### 3. Configure Database Connection
Edit `Backend/project/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ESDPROJECT
spring.datasource.username=root
spring.datasource.password=your_password
```

### 4. Database Schema
The application will automatically create tables on first run using:
```properties
spring.jpa.hibernate.ddl-auto=update
```

**Tables Created**:
- `bills`
- `student`
- `student_bills`
- `domain`
- `department`
- `employee`

---

## 🔧 Backend Setup

### 1. Navigate to Backend Directory
```bash
cd Backend/project
```

### 2. Configure Application Properties
Edit `src/main/resources/application.properties`:

```properties
# Application
spring.application.name=project

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/ESDPROJECT
spring.datasource.username=root
spring.datasource.password=admin
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# OAuth2 Google Configuration
spring.security.oauth2.client.registration.google.client-id=YOUR_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_CLIENT_SECRET
spring.security.oauth2.client.registration.google.scope=email,profile

# OAuth2 Provider URLs
spring.security.oauth2.client.provider.google.authorization-uri=https://accounts.google.com/o/oauth2/v2/auth
spring.security.oauth2.client.provider.google.token-uri=https://oauth2.googleapis.com/token
spring.security.oauth2.client.provider.google.user-info-uri=https://www.googleapis.com/oauth2/v3/userinfo
spring.security.oauth2.client.provider.google.user-name-attribute=sub
```

### 3. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI:
   ```
   http://localhost:8080/login/oauth2/code/google
   ```
6. Copy Client ID and Client Secret to `application.properties`

### 4. Build and Run
```bash
# Using Maven wrapper (Windows)
mvnw.cmd spring-boot:run

# Using Maven wrapper (Linux/Mac)
./mvnw spring-boot:run

# Using installed Maven
mvn spring-boot:run
```

**Backend runs on**: `http://localhost:8080`

---

## 🎨 Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment (Optional)
Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:8080
```

**Note**: Default is `http://localhost:8080` (configured in `src/services/api.ts`)

### 4. Start Development Server
```bash
npm run dev
```

**Frontend runs on**: `http://localhost:5173`

---

## ✅ Verification Steps

### 1. Backend Verification
```bash
# Check if backend is running
curl http://localhost:8080/auth/user

# Should return 401 (unauthorized) or user info if authenticated
```

### 2. Frontend Verification
1. Open browser: `http://localhost:5173`
2. Should see login page
3. Click "Sign in with Google"
4. Should redirect to Google login

### 3. Database Verification
```sql
-- Connect to MySQL
mysql -u root -p

-- Use database
USE ESDPROJECT;

-- Check tables
SHOW TABLES;

-- Should see: bills, student, student_bills, etc.
```

---

## 🐛 Troubleshooting

### Backend Issues

#### Port 8080 Already in Use
```bash
# Windows: Find process using port 8080
netstat -ano | findstr :8080

# Kill process
taskkill /PID <process_id> /F

# Linux/Mac: Find process
lsof -i :8080

# Kill process
kill -9 <PID>
```

#### Database Connection Failed
- Check MySQL is running
- Verify credentials in `application.properties`
- Check database exists: `SHOW DATABASES;`

#### OAuth Not Working
- Verify Google OAuth credentials
- Check redirect URI matches exactly
- Ensure Google+ API is enabled

### Frontend Issues

#### Port 5173 Already in Use
```bash
# Kill Node processes
# Windows
taskkill /F /IM node.exe

# Linux/Mac
pkill node
```

#### CORS Errors
- Ensure backend CORS is configured
- Check backend is running on port 8080
- Verify frontend URL in CORS config

#### API Calls Failing
- Check backend is running
- Verify API_BASE_URL in `api.ts`
- Check browser console for errors
- Verify token in localStorage

---

## 🚀 Production Deployment

### Backend Production

1. **Build JAR**
```bash
mvn clean package
```

2. **Run JAR**
```bash
java -jar target/project-0.0.1-SNAPSHOT.jar
```

3. **Environment Variables**
```bash
export SPRING_DATASOURCE_URL=jdbc:mysql://prod-db:3306/ESDPROJECT
export SPRING_DATASOURCE_USERNAME=prod_user
export SPRING_DATASOURCE_PASSWORD=prod_password
```

### Frontend Production

1. **Build**
```bash
npm run build
```

2. **Output**
- Files in `dist/` folder
- Deploy to web server (Nginx, Apache, etc.)

3. **Environment Variables**
```bash
# Set in build process
VITE_API_BASE_URL=https://api.yourdomain.com
```

---

## 📦 Project Structure

```
ESD Project/
├── Backend/
│   └── project/
│       ├── src/
│       │   └── main/
│       │       ├── java/
│       │       │   └── com/esd/project/
│       │       │       ├── Controller/
│       │       │       ├── Service/
│       │       │       ├── Repository/
│       │       │       ├── Entity/
│       │       │       ├── DTO/
│       │       │       ├── Mapper/
│       │       │       └── Exception/
│       │       └── resources/
│       │           └── application.properties
│       └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   ├── services/
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.js
│
└── docs/
    ├── 01_SYSTEM_OVERVIEW.md
    ├── 02_FRONTEND_ARCHITECTURE.md
    ├── 03_BACKEND_ARCHITECTURE.md
    ├── 04_DATA_FLOW.md
    ├── 05_API_REFERENCE.md
    └── 06_SETUP_GUIDE.md
```

---

## 🔐 Security Checklist

- [ ] Change default database password
- [ ] Use strong OAuth client secret
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Set secure session cookies
- [ ] Use environment variables for secrets
- [ ] Enable database SSL
- [ ] Regular security updates

---

## 📚 Next Steps

1. **Read Documentation**:
   - Start with `01_SYSTEM_OVERVIEW.md`
   - Review `04_DATA_FLOW.md` for understanding
   - Check `05_API_REFERENCE.md` for API details

2. **Test Application**:
   - Login with Google
   - Create a bill
   - View bills
   - Assign bill to student

3. **Customize**:
   - Modify UI in frontend
   - Add business logic in backend
   - Extend database schema

---

## 🆘 Getting Help

### Common Issues
1. Check error messages in console
2. Verify all services are running
3. Check network connectivity
4. Review logs for errors

### Documentation
- All documentation in `docs/` folder
- API reference: `docs/05_API_REFERENCE.md`
- Architecture: `docs/02_FRONTEND_ARCHITECTURE.md` and `docs/03_BACKEND_ARCHITECTURE.md`

---

**Last Updated**: 2024
**Version**: 1.0.0

