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

## 📁 Project Structure

```
cs4750/
├── src/                    # Vue 3 + TypeScript frontend
│   ├── views/             # Page components
│   ├── components/        # Reusable components
│   ├── router/            # Vue Router setup
│   └── stores/            # Pinia state management
├── backend/               # Node.js/Express API
│   ├── server.js          # Main server (modular, 41 lines)
│   ├── config/            # Database configuration
│   ├── middleware/        # Error handling middleware
│   └── routes/            # API route modules
└── db/                    # Database files
    ├── core_db_structure.sql  # Database schema (source of truth)
    ├── database_commands.sql  # Test data insertion
    └── *.md               # Database documentation
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
npm run dev          # Development server
npm run build        # Production build
npm run type-check   # TypeScript checking
npm run lint         # ESLint + Oxlint
npm run format       # Prettier formatting
npm run test:unit    # Vitest unit tests
npm run test:e2e     # Playwright E2E tests
```

### Backend (Node.js + Express)
```bash
cd backend
npm start            # Start server on port 3001
```

**Modular Architecture:**
- `routes/events.js` - Event management
- `routes/users.js` - User profiles & favorites
- `routes/bands.js` - Band management
- `routes/fillInRequests.js` - Fill-in requests
- `config/database.js` - MySQL connection pool
- `middleware/errorHandler.js` - Centralized error handling

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

## 🔧 Tech Stack

**Frontend:**
- Vue 3 + TypeScript
- PrimeVue UI components
- Vue Router + Pinia
- Vite build tool

**Backend:**
- Node.js + Express
- MySQL2 database driver
- CORS enabled
- Environment variables

**Development:**
- ESLint + Oxlint linting
- Prettier code formatting
- Vitest unit testing
- Playwright E2E testing

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend development server |
| `npm run build` | Build for production |
| `npm run lint` | Run all linters |
| `npm test:unit` | Run unit tests |
| `npm test:e2e` | Run E2E tests |
| Backend: `npm start` | Start API server |

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | List all events |
| POST | `/api/events` | Create new event |
| GET | `/api/bands` | List all bands |
| POST | `/api/bands` | Create new band |
| GET | `/api/users/:id` | Get user profile |
| GET | `/api/fill-in-requests` | List fill-in requests |

*Full API documentation in `backend/routes/` files*

## 📚 Additional Documentation

- `db/SETUP_NOTES.md` - Detailed database setup
- `db/TEST_DATA_SUMMARY.md` - Complete test data reference

---

**IDE Recommendation:** VSCode + Volar extension (disable Vetur)

For issues or questions, refer to the source files or database schema in `db/core_db_structure.sql`.

