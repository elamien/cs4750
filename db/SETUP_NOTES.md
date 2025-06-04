# MySQL Setup Notes

## Current Database Setup

We've set up a local MySQL database for HooJams with the following configuration:

### Database Details
- Database Name: `hoojams`
- **Username**: `adminuser`
- **Password**: `HooJams2024!`
- Connection Method: Using direct credentials for local development

### What's Been Done
1. MySQL is installed via Homebrew
2. Created the `hoojams` database with user `adminuser`
3. Imported schema from `core_db_structure.sql`
4. All tables created successfully:
   - User management: `user`, `roles`, `user_roles`
   - Band management: `band`, `band_leader`, `band_member`
   - Event management: `event`, `event_request`
   - Request handling: `fill_in_request`, `membership_request`
   - User types: `general_user`, `wxtj_exec`
   - Additional features: `user_favorites_bands`, `user_favorites_events`, `band_member_event_availability`, `band_membership_history`

### Test Data Added
- **8 Users**: Mix of band leaders, members, general users, and executives
- **3 Bands**: "The Local Beats", "Jazz Collective", "Prog Rock Project"
- **3 Events**: Various concert and gig opportunities
- **Band Relationships**: Leaders and members properly assigned to bands
- **Role Assignments**: All users have appropriate roles

### Connecting to the Database

**For Local Development:**
```bash
# Connect to database
mysql -u adminuser -pHooJams2024! hoojams

# Or with separate password prompt (more secure)
mysql -u adminuser -p hoojams
```

## ⚠️ CRITICAL ISSUE: Schema Mismatch

**The backend API endpoints in `backend/server.js` were built assuming a simplified schema, but the actual database uses a complex role-based system.**

### The Problem:
- **Backend expects**: Direct `user_id` in `band_member` table
- **Actual schema**: Uses `user_roles.user_role_id` → `band_member.user_role_id` → `band.band_id`

### Current State:
- Database has proper test data with the complex schema
- Backend API endpoints **will not work** with current database structure
- Frontend calls these APIs, so **most features will fail**

### Solutions:
1. **Option A**: Update backend API to work with role-based schema (recommended)
2. **Option B**: Simplify database schema to match current API
3. **Option C**: Create API translation layer

### For Application Connection

To connect your local development environment to this database:

1. Database Host: `localhost`
2. Database Name: `hoojams`
3. Database User: `adminuser`
4. Database Password: `HooJams2024!`

### Environment Variables
For the Vue.js application, add these to your `.env` file:
```
DB_HOST=localhost
DB_NAME=hoojams
DB_USER=adminuser
DB_PASSWORD=HooJams2024!
```

### Testing the Connection
You can verify the database is working by:
```sql
mysql -u adminuser -pHooJams2024! -e "USE hoojams; SHOW TABLES;"
```

This should display all 16 tables in the database.

### Sample Queries to Check Test Data
```sql
-- Check users and their roles
SELECT u.first_name, u.last_name, r.role_name 
FROM user u 
JOIN user_roles ur ON u.user_id = ur.user_id 
JOIN roles r ON ur.role_id = r.role_id;

-- Check bands and their leaders
SELECT b.name as band_name, u.first_name, u.last_name 
FROM band b 
JOIN band_leader bl ON b.band_id = bl.band_id 
JOIN user_roles ur ON bl.user_role_id = ur.user_role_id 
JOIN user u ON ur.user_id = u.user_id;
```

### Next Steps for the Team
1. **Immediate**: Decide on schema approach (see Critical Issue above)
2. Set up your own local MySQL instance
3. Create the `hoojams` database with `adminuser` credentials
4. Import the schema from `core_db_structure.sql`
5. Update your `.env` file with connection details
6. **Fix backend API** to match chosen schema approach

**Note**: Until the schema mismatch is resolved, the application will appear mostly empty even though the database contains proper test data. 