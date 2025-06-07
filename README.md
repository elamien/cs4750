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

# Create database - Choose one method based on your MySQL setup:

# METHOD A: If you have local login path configured (no password prompt)
# Drop and recreate database for fresh/clean development start
mysql --login-path=local -e "DROP DATABASE IF EXISTS hoojams; CREATE DATABASE hoojams;"

# METHOD B: If using root user with password (will prompt for password)
# Drop and recreate database for fresh/clean development start
mysql -u root -p -e "DROP DATABASE IF EXISTS hoojams; CREATE DATABASE hoojams;"

# Import schema (use same method as above)
# With local login path:
mysql --login-path=local hoojams < db/core_db_structure.sql

# With password prompt:
mysql -u root -p hoojams < db/core_db_structure.sql
```

### 5. Configure Environment
Create `backend/.env` file:
```
DB_HOST=localhost
DB_USER=adminuser
DB_PASSWORD=HooJams2024!
DB_NAME=hoojams
PORT=3001
```

### 6. Run the App
```bash
# Make sure you're in the project root directory
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


