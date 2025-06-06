# HooJams - Band & Event Management Platform

Vue 3 + TypeScript frontend with Node.js/Express backend and MySQL database.

## Setup

**Prerequisites:** Node.js 20+ and MySQL 8+

### 1. Database Setup
*Reminder, one possible set up is "mysql --login-path=local", if that doesn't apply to how you have things set up (type in password to access mysql in terminal) then you may safely ignore this note.

Let's Start! To create MySQL user and database, in your terminal, enter:
```cd```
to make sure your at your home directory.

Then enter:
```bash
mysql -u root -p
```
and input the password you typically have when accessing mysql locally.

Next, run these commands into mysql>
```sql
CREATE USER 'adminuser'@'localhost' IDENTIFIED BY 'HooJams2024!';
CREATE DATABASE hoojams;
GRANT ALL PRIVILEGES ON hoojams.* TO 'adminuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Now that you have exited, copy and paste:
```bash
# Initialize database schema and test data
mysql -u adminuser -p'HooJams2024!' -h localhost hoojams < db/core_db_structure.sql
```

### 2. Backend Setup
Make sure your in the proejct folder "cs4750", wherever you did git clone, you can get to it by running "cd cs4750".

Once/if in project folder, run:
```bash
cd backend
npm install
```

Then in the backend folder, create a .env file and copy and paste this into it:
```
DB_HOST=localhost
DB_USER=adminuser
DB_PASSWORD=HooJams2024!
DB_NAME=hoojams
PORT=3001
```
After that, from the backend folder, (again make sure in cs4750 "cd cs4750" -> "cd backend"). Run this:
```
npm start
```

### 3. Frontend Setup

Now in a new in new terminal, from project root ("cd cs4750" only). Run these two commands. First:
```bash
npm install
```
and the second, run:
```
npm run dev
```
You should be able to see the local host link and press on it (hold (cmd on mac/ctrl on windows) while mouse click).
Localhost should be visible in the browser now! you can go ahead and test the log ins below by signing into them (this was already set up in the db initialization)

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

