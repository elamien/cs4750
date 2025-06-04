# MySQL Setup Notes

## Current Database Setup

We've set up a local MySQL database for HooJams with the following configuration:

### Database Details
- Database Name: `hoojams`
- Connection Method: Using MySQL login paths (secure credential storage)
- Login Path Name: `local`

### What's Been Done
1. MySQL is installed via Homebrew
2. Created the `hoojams` database
3. Imported schema from `core_db_structure.sql`
4. All tables created successfully:
   - User management: `user`, `roles`, `user_roles`
   - Band management: `band`, `band_leader`, `band_member`
   - Event management: `event`, `event_request`
   - Request handling: `fill_in_request`, `membership_request`
   - User types: `general_user`, `wxtj_exec`
   - Additional features: `user_favorites_bands`, `user_favorites_events`, `band_member_event_availability`, `band_membership_history`

### Connecting to the Database

Currently using MySQL login paths for secure connection:
```bash
# View login path details
mysql_config_editor print --all

# Expected output:
[local]
user = "root"  # or your configured MySQL user
password = *****
host = "localhost"

# Connect to database
mysql --login-path=local hoojams
```

## For Application Connection

To connect your local development environment to this database, you'll need:

1. Database Host: `localhost`
2. Database Name: `hoojams`
3. Database User: Same as configured in your login path
4. Database Password: Same as configured in your login path

### Environment Variables
For the Vue.js application, add these to your `.env` file:
```
DB_HOST=localhost
DB_NAME=hoojams
DB_USER=your_username  # from login path
DB_PASSWORD=your_password  # from login path
```

### Testing the Connection
You can verify the database is working by:
```sql
mysql --login-path=local -e "USE hoojams; SHOW TABLES;"
```

This should display all 16 tables in the database.

### Next Steps for the Team
1. Set up your own local MySQL instance
2. Configure your MySQL login path named `local`
3. Create the `hoojams` database
4. Import the schema from `core_db_structure.sql`
5. Update your `.env` file with your local connection details

Note: The actual database connection in the application code will need to be implemented. The current mock data in components should be replaced with real database queries. 