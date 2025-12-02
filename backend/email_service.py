"""
Bobot Email Service
Async email sending with SMTP support
"""

import os
import asyncio
from datetime import datetime
from typing import Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import aiosmtplib

# =============================================================================
# Configuration
# =============================================================================

def get_email_config():
    """Get email configuration from environment"""
    return {
        "enabled": os.getenv("EMAIL_ENABLED", "false").lower() == "true",
        "smtp_host": os.getenv("SMTP_HOST", "smtp.gmail.com"),
        "smtp_port": int(os.getenv("SMTP_PORT", "587")),
        "smtp_user": os.getenv("SMTP_USER", ""),
        "smtp_password": os.getenv("SMTP_PASSWORD", ""),
        "smtp_tls": os.getenv("SMTP_TLS", "true").lower() == "true",
        "from_email": os.getenv("EMAIL_FROM", "noreply@bobot.se"),
        "from_name": os.getenv("EMAIL_FROM_NAME", "Bobot"),
    }


# =============================================================================
# Email Templates
# =============================================================================

EMAIL_TEMPLATES = {
    "usage_warning_80": {
        "subject": "Bobot: 80% av din månadsgräns har använts",
        "body": """
Hej {company_name}!

Du har nu använt {usage_percent}% av din månadsgräns för konversationer.

Nuvarande användning: {current_usage} av {max_usage} konversationer

När gränsen nås kommer chattwidgeten att visa ett meddelande till besökare
om att de ska kontakta er direkt istället.

Vill du höja gränsen? Kontakta oss på support@bobot.se

Med vänliga hälsningar,
Bobot-teamet
        """,
    },
    "usage_warning_90": {
        "subject": "Bobot: 90% av din månadsgräns har använts",
        "body": """
Hej {company_name}!

Du har nu använt {usage_percent}% av din månadsgräns för konversationer.

Nuvarande användning: {current_usage} av {max_usage} konversationer

Du närmar dig gränsen! Överväg att uppgradera din plan för att undvika
avbrott i tjänsten.

Med vänliga hälsningar,
Bobot-teamet
        """,
    },
    "usage_limit_reached": {
        "subject": "Bobot: Din månadsgräns har uppnåtts",
        "body": """
Hej {company_name}!

Du har nu nått din månadsgräns på {max_usage} konversationer.

Chattwidgeten visar nu ett meddelande till besökare om att de ska
kontakta er direkt istället.

För att återaktivera chatten kan du:
1. Vänta till nästa månad (gränsen återställs automatiskt)
2. Uppgradera din plan för högre gräns

Kontakta oss på support@bobot.se om du har frågor.

Med vänliga hälsningar,
Bobot-teamet
        """,
    },
    "new_unanswered_question": {
        "subject": "Bobot: Ny obesvarad fråga",
        "body": """
Hej {company_name}!

En besökare ställde en fråga som chatboten inte kunde besvara:

Fråga: "{question}"

Överväg att lägga till ett svar i kunskapsbasen för liknande frågor.

Konversations-ID: {conversation_id}

Med vänliga hälsningar,
Bobot-teamet
        """,
    },
    "weekly_summary": {
        "subject": "Bobot: Veckosammanfattning",
        "body": """
Hej {company_name}!

Här är din veckosammanfattning för Bobot:

Konversationer denna vecka: {conversations_week}
Meddelanden: {messages_week}
Besvarade frågor: {answered_percent}%
Genomsnittlig svarstid: {avg_response_time}ms

Populäraste kategorier:
{top_categories}

Obesvarade frågor: {unanswered_count}

Logga in på admin-panelen för mer detaljerad statistik.

Med vänliga hälsningar,
Bobot-teamet
        """,
    },
    "password_reset": {
        "subject": "Bobot: Återställ ditt lösenord",
        "body": """
Hej!

Du har begärt att återställa ditt lösenord för Bobot.

Klicka på länken nedan för att skapa ett nytt lösenord:
{reset_link}

Länken är giltig i 1 timme.

Om du inte begärde detta kan du ignorera detta meddelande.

Med vänliga hälsningar,
Bobot-teamet
        """,
    },
    "welcome": {
        "subject": "Välkommen till Bobot!",
        "body": """
Hej {company_name}!

Välkommen till Bobot - din AI-chattassistent för fastighetsbolag!

Kom igång med dessa steg:
1. Logga in på admin-panelen: {admin_url}
2. Lägg till frågor och svar i kunskapsbasen
3. Anpassa chattwidgetens utseende
4. Bädda in widgeten på din hemsida

Behöver du hjälp? Kolla in dokumentationen eller kontakta oss på support@bobot.se

Dina inloggningsuppgifter:
Företags-ID: {company_id}
Lösenord: (det du angav vid registrering)

Med vänliga hälsningar,
Bobot-teamet
        """,
    },
}


# =============================================================================
# Email Sending
# =============================================================================

async def send_email(
    to_email: str,
    subject: str,
    body: str,
    html_body: Optional[str] = None
) -> tuple:
    """
    Send an email via SMTP.
    Returns (success: bool, error_message: str or None)
    """
    config = get_email_config()

    if not config["enabled"]:
        print(f"[Email] Disabled - would send to {to_email}: {subject}")
        return True, None  # Pretend success when disabled

    if not config["smtp_user"] or not config["smtp_password"]:
        return False, "SMTP credentials not configured"

    try:
        # Create message
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{config['from_name']} <{config['from_email']}>"
        msg["To"] = to_email

        # Add plain text part
        msg.attach(MIMEText(body, "plain", "utf-8"))

        # Add HTML part if provided
        if html_body:
            msg.attach(MIMEText(html_body, "html", "utf-8"))

        # Send via SMTP
        await aiosmtplib.send(
            msg,
            hostname=config["smtp_host"],
            port=config["smtp_port"],
            username=config["smtp_user"],
            password=config["smtp_password"],
            start_tls=config["smtp_tls"],
        )

        print(f"[Email] Sent to {to_email}: {subject}")
        return True, None

    except Exception as e:
        error_msg = str(e)
        print(f"[Email] Error sending to {to_email}: {error_msg}")
        return False, error_msg


async def send_template_email(
    to_email: str,
    template_name: str,
    variables: dict
) -> tuple:
    """
    Send an email using a predefined template.
    Returns (success: bool, error_message: str or None)
    """
    if template_name not in EMAIL_TEMPLATES:
        return False, f"Unknown template: {template_name}"

    template = EMAIL_TEMPLATES[template_name]
    subject = template["subject"]
    body = template["body"].format(**variables)

    return await send_email(to_email, subject, body)


# =============================================================================
# Queue Processing
# =============================================================================

async def process_email_queue(db_session):
    """
    Process pending emails from the queue.
    Called by background task.
    """
    from database import EmailNotificationQueue

    # Get pending emails
    pending = db_session.query(EmailNotificationQueue).filter(
        EmailNotificationQueue.status == "pending",
        EmailNotificationQueue.scheduled_for <= datetime.utcnow()
    ).limit(10).all()

    for notification in pending:
        try:
            success, error = await send_email(
                to_email=notification.recipient_email,
                subject=notification.subject,
                body=notification.body
            )

            if success:
                notification.status = "sent"
                notification.sent_at = datetime.utcnow()
            else:
                notification.status = "failed"
                notification.error_message = error

        except Exception as e:
            notification.status = "failed"
            notification.error_message = str(e)

        db_session.commit()

    return len(pending)


def queue_email(
    db_session,
    recipient_email: str,
    subject: str,
    body: str,
    notification_type: str,
    company_id: Optional[str] = None,
    notification_key: Optional[str] = None
) -> bool:
    """
    Add an email to the queue.
    Returns True if queued successfully.
    """
    from database import EmailNotificationQueue

    # Check for duplicate
    if notification_key:
        existing = db_session.query(EmailNotificationQueue).filter(
            EmailNotificationQueue.notification_key == notification_key
        ).first()
        if existing:
            return False  # Already queued

    notification = EmailNotificationQueue(
        company_id=company_id,
        notification_type=notification_type,
        recipient_email=recipient_email,
        subject=subject,
        body=body,
        notification_key=notification_key
    )

    db_session.add(notification)
    db_session.commit()
    return True


def queue_template_email(
    db_session,
    recipient_email: str,
    template_name: str,
    variables: dict,
    company_id: Optional[str] = None,
    notification_key: Optional[str] = None
) -> bool:
    """
    Queue an email using a template.
    """
    if template_name not in EMAIL_TEMPLATES:
        return False

    template = EMAIL_TEMPLATES[template_name]
    subject = template["subject"]
    body = template["body"].format(**variables)

    return queue_email(
        db_session=db_session,
        recipient_email=recipient_email,
        subject=subject,
        body=body,
        notification_type=template_name,
        company_id=company_id,
        notification_key=notification_key
    )


# =============================================================================
# Usage Notifications
# =============================================================================

def check_and_queue_usage_notification(
    db_session,
    company_id: str,
    company_name: str,
    notification_email: str,
    current_usage: int,
    max_usage: int
):
    """
    Check usage thresholds and queue appropriate notifications.
    """
    if max_usage == 0 or not notification_email:
        return

    from datetime import date
    month_key = date.today().strftime("%Y_%m")
    usage_percent = (current_usage / max_usage) * 100

    # 80% warning
    if 80 <= usage_percent < 90:
        queue_template_email(
            db_session=db_session,
            recipient_email=notification_email,
            template_name="usage_warning_80",
            variables={
                "company_name": company_name,
                "usage_percent": int(usage_percent),
                "current_usage": current_usage,
                "max_usage": max_usage,
            },
            company_id=company_id,
            notification_key=f"usage_80_{company_id}_{month_key}"
        )

    # 90% warning
    elif 90 <= usage_percent < 100:
        queue_template_email(
            db_session=db_session,
            recipient_email=notification_email,
            template_name="usage_warning_90",
            variables={
                "company_name": company_name,
                "usage_percent": int(usage_percent),
                "current_usage": current_usage,
                "max_usage": max_usage,
            },
            company_id=company_id,
            notification_key=f"usage_90_{company_id}_{month_key}"
        )

    # Limit reached
    elif usage_percent >= 100:
        queue_template_email(
            db_session=db_session,
            recipient_email=notification_email,
            template_name="usage_limit_reached",
            variables={
                "company_name": company_name,
                "max_usage": max_usage,
            },
            company_id=company_id,
            notification_key=f"usage_100_{company_id}_{month_key}"
        )
