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

## 🎭 Test Users & Registration

### Existing Test Users
| Role | Email | Password | Name | Permissions |
|------|-------|----------|------|-------------|
| **WXTJ Executive** | `wxtjexec@example.com` | `wxtjexec` | wxtj exec | Full admin privileges |
| **General User** | `test.user@example.com` | `test123` | Test User | Join or create one band |
| **Band Leader** | `alex.band@test.com` | `test123` | Alex Rockstar | Create/manage bands, handle requests |
| **Band Member** | `jamie.drums@test.com` | `test123` | Jamie Beats | View band events, mark availability |

### Creating New Users
- **General Users**: Simply register with name, email, and password
- **WXTJ Executives**: Check "I am a WXTJ Executive" and enter access key

#### WXTJ Executive Access Key
```
HooJams2024_WXTJ
```
*This key should be shared only with legitimate WXTJ staff members*

### Quick Role Switching (3-5 seconds)
1. Click your **profile avatar** (top right)
2. Click **"Sign Out"**
3. Click **"Sign In"**
4. Enter credentials from table above
5. **Done!** - Instant role switch

### Test Band Setup
- **Electric Vibes** (Alternative rock band)
  - **Leader**: Alex Rockstar
  - **Member**: Jamie Beats
  - Available for event bookings and testing band functionality

*These 4 users + 1 band are automatically created when initializing the database*

