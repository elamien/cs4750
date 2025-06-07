# HooJams - Band Management System
## Complete Setup (Fresh System)

### 1. Install Prerequisites

**Node.js:**
- Download from https://nodejs.org (LTS version)
- Install and verify: `node --version`

**MySQL:**
- **Mac:** `brew install mysql` then `brew services start mysql`
- **Windows:** Download from https://dev.mysql.com/downloads/mysql/
- Set root password during installation

**Git (if not installed):**
- **Mac:** `xcode-select --install`
- **Windows:** Download from https://git-scm.com

### 2. Get the Code
```bash
# If you have the project folder already, skip this
cd your-project-directory
```

### 3. Install Dependencies
```bash
npm install
cd backend && npm install && cd ..
```

### 4. Setup Database
```bash
# Start MySQL (if not running)
# Mac: brew services start mysql
# Windows: Start MySQL service from Services

# Create database (use --login-path=local if you have it configured)
# Version of command below but for ^ method: mysql --login-path=local -e "CREATE DATABASE hoojams;
# Type your MySQL password when prompted
mysql -u root -p -e "CREATE DATABASE hoojams;"

# Import schema
mysql -u root -p hoojams < core_db_structure.sql
```

### 5. Configure Environment
Create `backend/.env` file:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_mysql_root_password
DB_NAME=hoojams
PORT=3001
```

### 6. Run the App
```bash
npm run dev  # Starts both frontend and backend
```

**Access:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Individual Commands
- Backend only: `npm run dev:backend`
- Frontend only: `npm run dev:frontend`

## Test Users

| Role | Email | Password |
|------|-------|----------|
| **WXTJ Executive** | `wxtjexec@example.com` | `test123` |
| **General User** | `test.user@example.com` | `test123` |
| **Band Leader** | `alex.band@test.com` | `test123` |
| **Band Member** | `jamie.drums@test.com` | `test123` |

**WXTJ Executive Access Key:** `HooJams2024_WXTJ`


