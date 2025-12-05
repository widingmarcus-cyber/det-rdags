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

    # Check if subscriptions table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='subscriptions'")
    if not cursor.fetchone():
        print("Creating subscriptions table...")
        cursor.execute("""
            CREATE TABLE subscriptions (
                id INTEGER PRIMARY KEY,
                company_id VARCHAR UNIQUE NOT NULL,
                plan_name VARCHAR DEFAULT 'free',
                plan_price REAL DEFAULT 0,
                billing_cycle VARCHAR DEFAULT 'monthly',
                status VARCHAR DEFAULT 'active',
                trial_ends_at DATETIME,
                current_period_start DATETIME,
                current_period_end DATETIME,
                plan_features TEXT DEFAULT '{}',
                external_customer_id VARCHAR,
                external_subscription_id VARCHAR,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (company_id) REFERENCES companies(id)
            )
        """)

    # Check if invoices table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='invoices'")
    if not cursor.fetchone():
        print("Creating invoices table...")
        cursor.execute("""
            CREATE TABLE invoices (
                id INTEGER PRIMARY KEY,
                company_id VARCHAR NOT NULL,
                invoice_number VARCHAR UNIQUE NOT NULL,
                amount REAL NOT NULL,
                currency VARCHAR DEFAULT 'SEK',
                description TEXT,
                period_start DATE,
                period_end DATE,
                status VARCHAR DEFAULT 'pending',
                due_date DATE,
                paid_at DATETIME,
                payment_method VARCHAR,
                external_invoice_id VARCHAR,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (company_id) REFERENCES companies(id)
            )
        """)

    # Check if company_notes table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='company_notes'")
    if not cursor.fetchone():
        print("Creating company_notes table...")
        cursor.execute("""
            CREATE TABLE company_notes (
                id INTEGER PRIMARY KEY,
                company_id VARCHAR NOT NULL,
                content TEXT NOT NULL,
                created_by VARCHAR NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_pinned INTEGER DEFAULT 0,
                FOREIGN KEY (company_id) REFERENCES companies(id)
            )
        """)

    # Check if widget_performance table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='widget_performance'")
    if not cursor.fetchone():
        print("Creating widget_performance table...")
        cursor.execute("""
            CREATE TABLE widget_performance (
                id INTEGER PRIMARY KEY,
                company_id VARCHAR NOT NULL,
                hour DATETIME NOT NULL,
                total_requests INTEGER DEFAULT 0,
                successful_requests INTEGER DEFAULT 0,
                failed_requests INTEGER DEFAULT 0,
                rate_limited_requests INTEGER DEFAULT 0,
                avg_response_time REAL DEFAULT 0,
                min_response_time INTEGER DEFAULT 0,
                max_response_time INTEGER DEFAULT 0,
                p95_response_time INTEGER DEFAULT 0,
                error_counts TEXT DEFAULT '{}',
                FOREIGN KEY (company_id) REFERENCES companies(id)
            )
        """)

    # Check if email_notification_queue table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='email_notification_queue'")
    if not cursor.fetchone():
        print("Creating email_notification_queue table...")
        cursor.execute("""
            CREATE TABLE email_notification_queue (
                id INTEGER PRIMARY KEY,
                company_id VARCHAR,
                notification_type VARCHAR NOT NULL,
                recipient_email VARCHAR NOT NULL,
                subject VARCHAR NOT NULL,
                body TEXT NOT NULL,
                status VARCHAR DEFAULT 'pending',
                scheduled_for DATETIME DEFAULT CURRENT_TIMESTAMP,
                sent_at DATETIME,
                error_message TEXT,
                notification_key VARCHAR UNIQUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (company_id) REFERENCES companies(id)
            )
        """)

    # Add 2FA columns to super_admins
    cursor.execute("PRAGMA table_info(super_admins)")
    admin_columns = {row[1] for row in cursor.fetchall()}

    if "totp_secret" not in admin_columns:
        print("Adding 2FA columns to super_admins...")
        cursor.execute("ALTER TABLE super_admins ADD COLUMN totp_secret VARCHAR")
        cursor.execute("ALTER TABLE super_admins ADD COLUMN totp_enabled INTEGER DEFAULT 0")
        cursor.execute("ALTER TABLE super_admins ADD COLUMN backup_codes TEXT")
        cursor.execute("ALTER TABLE super_admins ADD COLUMN last_login DATETIME")
        cursor.execute("ALTER TABLE super_admins ADD COLUMN last_login_ip VARCHAR")
        cursor.execute("ALTER TABLE super_admins ADD COLUMN dark_mode INTEGER DEFAULT 0")

    # Add self-hosting columns to companies
    cursor.execute("PRAGMA table_info(companies)")
    company_columns = {row[1] for row in cursor.fetchall()}

    if "is_self_hosted" not in company_columns:
        print("Adding self-hosting columns to companies...")
        cursor.execute("ALTER TABLE companies ADD COLUMN is_self_hosted INTEGER DEFAULT 0")
        cursor.execute("ALTER TABLE companies ADD COLUMN self_host_license_key VARCHAR UNIQUE")
        cursor.execute("ALTER TABLE companies ADD COLUMN self_host_activated_at DATETIME")
        cursor.execute("ALTER TABLE companies ADD COLUMN self_host_license_valid_until DATETIME")
        cursor.execute("ALTER TABLE companies ADD COLUMN self_host_last_validated DATETIME")

    # Check if page_views table exists (for landing page analytics)
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='page_views'")
    if not cursor.fetchone():
        print("Creating page_views table...")
        cursor.execute("""
            CREATE TABLE page_views (
                id INTEGER PRIMARY KEY,
                page_url VARCHAR NOT NULL,
                page_name VARCHAR DEFAULT '',
                visitor_id VARCHAR,
                session_id VARCHAR,
                ip_anonymous VARCHAR,
                user_agent TEXT,
                referrer TEXT,
                device_type VARCHAR DEFAULT 'desktop',
                utm_source VARCHAR,
                utm_medium VARCHAR,
                utm_campaign VARCHAR,
                utm_content VARCHAR,
                utm_term VARCHAR,
                time_on_page_seconds INTEGER DEFAULT 0,
                is_bounce INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cursor.execute("CREATE INDEX ix_page_views_id ON page_views (id)")
        cursor.execute("CREATE INDEX ix_pageview_date ON page_views (created_at)")
        cursor.execute("CREATE INDEX ix_pageview_visitor ON page_views (visitor_id)")

    # Check if daily_page_stats table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='daily_page_stats'")
    if not cursor.fetchone():
        print("Creating daily_page_stats table...")
        cursor.execute("""
            CREATE TABLE daily_page_stats (
                id INTEGER PRIMARY KEY,
                date DATE NOT NULL,
                page_url VARCHAR NOT NULL,
                page_name VARCHAR DEFAULT '',
                total_views INTEGER DEFAULT 0,
                unique_visitors INTEGER DEFAULT 0,
                avg_time_on_page REAL DEFAULT 0,
                bounce_rate REAL DEFAULT 0,
                desktop_views INTEGER DEFAULT 0,
                mobile_views INTEGER DEFAULT 0,
                tablet_views INTEGER DEFAULT 0,
                direct_traffic INTEGER DEFAULT 0,
                organic_traffic INTEGER DEFAULT 0,
                paid_traffic INTEGER DEFAULT 0,
                social_traffic INTEGER DEFAULT 0,
                referral_traffic INTEGER DEFAULT 0,
                top_referrers TEXT DEFAULT '{}',
                hourly_breakdown TEXT DEFAULT '{}'
            )
        """)
        cursor.execute("CREATE INDEX ix_daily_page_stats_id ON daily_page_stats (id)")
        cursor.execute("CREATE INDEX ix_daily_page_stats_date ON daily_page_stats (date)")

    conn.commit()
    conn.close()

    print("Migration complete!")

if __name__ == "__main__":
    migrate()
