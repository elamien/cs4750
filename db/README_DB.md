# Database Setup (HooJams)

## Local Development Environment

This project uses **MySQL** for both development and production environments.

The database schema is defined in `core_db_structure.sql`.

### MySQL Login Path Configuration

For secure and convenient database access, we use MySQL login paths. The project expects a login path named `local` to be configured:

```sh
# View current login paths
mysql_config_editor print --all

# Expected output should look like:
[local]
user = "root"  # or your preferred MySQL user
password = *****
host = "localhost"

# Connect using the login path
mysql --login-path=local
```

> 🔄 Coming Soon: Detailed instructions for setting up your own `local` login path configuration!

### Why MySQL?

- **Industry Standard:** Widely used in production environments
- **Rich Feature Set:** Full support for complex queries, transactions, and concurrent access
- **Scalability:** Can handle growing data needs
- **Compatibility:** Well-supported by ORMs and development tools

The `core_db_structure.sql` is written with MySQL-specific syntax to take advantage of its features while maintaining general SQL compatibility where possible.

## Future Migration to Server-Based Database

It is planned to migrate to a more robust, server-based SQL database (e.g., PostgreSQL, MySQL) for staging, production, and potentially more complex development scenarios that require features not well-supported by SQLite or need concurrent access beyond typical local dev.

The `core_db_structure.sql` is written with general SQL syntax that should be largely portable, with minor adjustments expected for specific database systems (e.g., `AUTO_INCREMENT` behavior, `ENUM` type handling). 