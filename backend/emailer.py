import html
import os
import smtplib
import ssl
from email.message import EmailMessage


def send_email(to_email, subject, text_body, html_body=None):
    # Read settings when sending (not at import time), so .env is always loaded by then
    host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    port = int(os.getenv("SMTP_PORT", "587"))
    user = os.getenv("SMTP_USER")
    password = os.getenv("SMTP_PASSWORD")
    sender_name = os.getenv("SMTP_FROM_NAME", "Lakmé Store")

    if not user or not password:
        print("Email not sent: SMTP_USER or SMTP_PASSWORD is missing in .env")
        return False

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = f"{sender_name} <{user}>"
    message["To"] = to_email
    message.set_content(text_body)  # plain-text version

    if html_body:
        message.add_alternative(html_body, subtype="html")  # styled version

    try:
        with smtplib.SMTP(host, port, timeout=15) as server:
            server.starttls(context=ssl.create_default_context())  # encrypt the connection
            server.login(user, password)
            server.send_message(message)
        return True
    except Exception as error:
        # An email problem must never break checkout or login, so we only log it
        print(f"Email sending failed: {error}")
        return False


def send_order_confirmation(to_email, customer_name, sale_id, items, total_amount, payment_method):
    name = html.escape(customer_name)

    rows_html = ""
    rows_text = ""
    for item in items:
        rows_html += (
            "<tr>"
            f"<td style='padding:8px 0;border-bottom:1px solid #eee'>{html.escape(item['name'])} × {item['quantity']}</td>"
            f"<td style='padding:8px 0;border-bottom:1px solid #eee;text-align:right'>Rs. {item['subtotal']:.2f}</td>"
            "</tr>"
        )
        rows_text += f"- {item['name']} x {item['quantity']}: Rs. {item['subtotal']:.2f}\n"

    subject = f"Payment received – Order #{sale_id}"

    text_body = (
        f"Hi {customer_name},\n\n"
        f"We've received your {payment_method} payment for order #{sale_id}.\n\n"
        f"{rows_text}\n"
        f"Total paid: Rs. {total_amount:.2f}\n\n"
        "We're now preparing your order. Thank you for shopping with Lakmé!\n"
    )

    html_body = f"""
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#111827">
      <h1 style="font-family:Georgia,serif;font-style:italic;letter-spacing:3px">LAKMÉ</h1>
      <h2 style="color:#e11d48">Payment received</h2>
      <p>Hi {name}, we've received your {html.escape(payment_method)} payment for order <b>#{sale_id}</b>.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">{rows_html}</table>
      <p style="text-align:right;font-size:16px"><b>Total paid: Rs. {total_amount:.2f}</b></p>
      <p>We're now preparing your order. Thank you for shopping with Lakmé!</p>
    </div>
    """

    return send_email(to_email, subject, text_body, html_body)


def send_password_reset_email(to_email, customer_name, reset_link):
    name = html.escape(customer_name)
    safe_link = html.escape(reset_link)

    subject = "Reset your Lakmé password"

    text_body = (
        f"Hi {customer_name},\n\n"
        f"Use this link to reset your password (valid for 15 minutes):\n{reset_link}\n\n"
        "If you didn't ask for this, you can ignore this email.\n"
    )

    html_body = f"""
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#111827">
      <h1 style="font-family:Georgia,serif;font-style:italic;letter-spacing:3px">LAKMÉ</h1>
      <p>Hi {name}, click the button below to reset your password. It's valid for 15 minutes.</p>
      <p><a href="{safe_link}" style="background:#111827;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none">Reset password</a></p>
      <p style="font-size:12px;color:#6b7280">If you didn't ask for this, you can ignore this email.</p>
    </div>
    """

    return send_email(to_email, subject, text_body, html_body)

def send_verification_email(to_email, customer_name, code):
    name = html.escape(customer_name)

    subject = "Your Lakmé verification code"

    text_body = (
        f"Hi {customer_name},\n\n"
        f"Your verification code is: {code}\n\n"
        "It expires in 10 minutes. If you didn't create an account, you can ignore this email.\n"
    )

    html_body = f"""
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#111827">
      <h1 style="font-family:Georgia,serif;font-style:italic;letter-spacing:3px">LAKMÉ</h1>
      <p>Hi {name}, use this code to verify your email:</p>
      <p style="font-size:32px;font-weight:bold;letter-spacing:8px;background:#f5f5f4;padding:16px;text-align:center;border-radius:12px">{code}</p>
      <p style="font-size:12px;color:#6b7280">This code expires in 10 minutes. If you didn't create an account, you can ignore this email.</p>
    </div>
    """

    return send_email(to_email, subject, text_body, html_body)