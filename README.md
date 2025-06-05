# HooJams - Band & Event Management Platform

Vue 3 + TypeScript frontend with Node.js/Express backend and MySQL database.

## Setup

**Prerequisites:** Node.js 20+ and MySQL 8+

### 1. Database Setup
```bash
# Create MySQL user and database
mysql -u root -p
```
```sql
CREATE USER 'adminuser'@'localhost' IDENTIFIED BY 'HooJams2024!';
CREATE DATABASE hoojams;
GRANT ALL PRIVILEGES ON hoojams.* TO 'adminuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```
```bash
# Initialize database schema and test data
mysql -u adminuser -p'HooJams2024!' -h localhost hoojams < db/core_db_structure.sql
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file with:
echo "DB_HOST=localhost
DB_USER=adminuser  
DB_PASSWORD=HooJams2024!
DB_NAME=hoojams
PORT=3001" > .env

npm start
```

### 3. Frontend Setup
```bash
# In new terminal, from project root
npm install
npm run dev
```

**Access:** Frontend at http://localhost:5173, Backend at http://localhost:3001

## Test Users

| Role | Email | Password |
|------|-------|----------|
| **WXTJ Executive** | `wxtjexec@example.com` | `wxtjexec` |
| **General User** | `test.user@example.com` | `test123` |
| **Band Leader** | `alex.band@test.com` | `test123` |
| **Band Member** | `jamie.drums@test.com` | `test123` |

**WXTJ Executive Access Key:** `HooJams2024_WXTJ`

## Troubleshooting

**Database connection issues:**
```bash
# Start MySQL service
brew services start mysql  # macOS
sudo systemctl start mysql # Linux
net start mysql            # Windows

# Reset database
mysql -u root -p -e "DROP DATABASE IF EXISTS hoojams; CREATE DATABASE hoojams;"
mysql -u adminuser -p'HooJams2024!' -h localhost hoojams < db/core_db_structure.sql
```

