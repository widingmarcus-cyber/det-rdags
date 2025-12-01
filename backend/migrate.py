"""
Database migration script - adds new columns for usage limits and activity logs
Run this once to update the database schema.
"""
import sqlite3
import os

DATABASE_PATH = os.getenv("DATABASE_URL", "sqlite:///./bobot.db").replace("sqlite:///", "")

def migrate():
    print(f"Migrating database: {DATABASE_PATH}")

    # Check if database file exists
    if not os.path.exists(DATABASE_PATH):
        print("Database file does not exist. It will be created when the application starts.")
        print("No migration needed for fresh database.")
        return

    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    # Check if company_settings table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='company_settings'")
    if not cursor.fetchone():
        print("company_settings table does not exist. Database will be created when the application starts.")
        print("No migration needed for fresh database.")
        conn.close()
        return

    # Get existing columns in company_settings
    cursor.execute("PRAGMA table_info(company_settings)")
    existing_columns = {row[1] for row in cursor.fetchall()}

    # Add max_knowledge_items if it doesn't exist
    if "max_knowledge_items" not in existing_columns:
        print("Adding max_knowledge_items column...")
        cursor.execute("ALTER TABLE company_settings ADD COLUMN max_knowledge_items INTEGER DEFAULT 0")
    else:
        print("max_knowledge_items column already exists, skipping...")

    # Check if company_activity_log table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='company_activity_log'")
    if not cursor.fetchone():
        print("Creating company_activity_log table...")
        cursor.execute("""
            CREATE TABLE company_activity_log (
                id INTEGER PRIMARY KEY,
                company_id VARCHAR NOT NULL,
                action_type VARCHAR NOT NULL,
                description TEXT,
                details TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (company_id) REFERENCES companies(id)
            )
        """)
        cursor.execute("CREATE INDEX ix_company_activity_log_id ON company_activity_log (id)")

    # Check if admin_audit_log table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='admin_audit_log'")
    if not cursor.fetchone():
        print("Creating admin_audit_log table...")
        cursor.execute("""
            CREATE TABLE admin_audit_log (
                id INTEGER PRIMARY KEY,
                admin_username VARCHAR NOT NULL,
                action_type VARCHAR NOT NULL,
                target_company_id VARCHAR,
                description TEXT,
                details TEXT,
                ip_address VARCHAR,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("CREATE INDEX ix_admin_audit_log_id ON admin_audit_log (id)")

    # Check if global_settings table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='global_settings'")
    if not cursor.fetchone():
        print("Creating global_settings table...")
        cursor.execute("""
            CREATE TABLE global_settings (
                id INTEGER PRIMARY KEY,
                key VARCHAR UNIQUE NOT NULL,
                value TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_by VARCHAR
            )
        """)
        cursor.execute("CREATE INDEX ix_global_settings_id ON global_settings (id)")

    conn.commit()
    conn.close()

    print("Migration complete!")

if __name__ == "__main__":
    migrate()
