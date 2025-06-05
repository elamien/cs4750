# HooJams - Band & Event Management Platform

A Vue 3 + TypeScript frontend with Node.js/Express backend and MySQL database for managing bands, events, and fill-in requests.

## 🚀 Quick Start

### Prerequisites
- Node.js 20.0.0+ (includes npm 10.0.0+)
- MySQL with configured login path named `local`

### Environment Setup
Create a `.env` file in the `backend/` directory:
```env
DB_HOST=localhost
DB_USER=adminuser
DB_PASSWORD=HooJams2024!
DB_NAME=hoojams
PORT=3001
```

### Installation & Development
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Create backend environment file
cp .env.example .env
# OR create .env manually with:
# DB_HOST=localhost
# DB_USER=adminuser
# DB_PASSWORD=HooJams2024!
# DB_NAME=hoojams
# PORT=3001

# Start backend server (port 3001)
npm start

# Start frontend dev server (port 5173)
cd ..
npm run dev
```


## 🗄️ Database Setup

### MySQL Configuration
The project uses MySQL with login paths for secure access:

```bash
# Check configured login paths
mysql_config_editor print --all

# Expected: [local] path with your MySQL credentials

# Connect to database
mysql --login-path=local

# Import schema and test data
mysql --login-path=local < db/core_db_structure.sql
mysql --login-path=local < db/database_commands.sql
```

### Database Schema
- **16 tables** including users, bands, events, roles, favorites
- **Role-based permissions** via `user_roles` table
- **Test data** includes 8 users, 3 bands, 6 events
- See `db/TEST_DATA_SUMMARY.md` for complete test data details

## 🛠️ Development

### Frontend (Vue 3 + TypeScript)
```bash
cd cs4570
npm run dev
```

### Backend (Node.js + Express)
```bash
cd backend
npm start            # Start server on port 3001
```

## 🎭 Test Users

| Role | Email | Password | Name | Permissions |
|------|-------|----------|------|-------------|
| **Band Leader** | `bandleader@test.com` | `test123` | Sarah Leader | Create/manage bands, handle requests |
| **Band Member** | `bandmember@test.com` | `test123` | Mike Member | View band events, mark availability |
| **General User** | `general@test.com` | `test123` | Gary General | Join or create one band |
| **WXTJ Executive** | `wxtj.exec@virginia.edu` | `test123` | Wesley Executive | Full admin privileges |

### Quick Role Switching (3-5 seconds)
1. Click your **profile avatar** (top right)
2. Click **"Sign Out"**
3. Click **"Sign In"**
4. Enter new **email + `test123`**
5. **Done!** - Instant role switch

*These are the only 4 users in the database for clean testing*

