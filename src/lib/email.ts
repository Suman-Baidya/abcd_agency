// Resend Email Dispatcher adhering to the Black & White Premium Design System

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.SMTP_FROM || "ABCD Agency <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn("[Resend] RESEND_API_KEY not configured. Email suppressed:", { to, subject });
    return { success: false, error: "Email service not configured" };
  }

  try {
    const recipients = Array.isArray(to) ? to : [to];
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: recipients,
        subject,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Resend Error]:", data);
      return { success: false, error: data?.message || "Failed to send email" };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("[Resend Exception]:", error);
    return { success: false, error: error?.message || "Network error sending email" };
  }
}

/**
 * Sends a black & white branded password reset email.
 */
export async function sendPasswordResetEmail({
  to,
  resetUrl,
  userName = "Valued Partner",
}: {
  to: string;
  resetUrl: string;
  userName?: string;
}) {
  const subject = "Reset Your ABCD Agency Password";
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 40px 16px; background-color: #F7F7F7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0A0A0A;">
  <div style="max-width: 520px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E5E5E5; border-radius: 8px; overflow: hidden; padding: 36px 32px;">
    <!-- Logo / Header -->
    <div style="border-bottom: 1px solid #E5E5E5; padding-bottom: 24px; margin-bottom: 28px;">
      <span style="font-size: 18px; font-weight: 800; letter-spacing: -0.5px; color: #0A0A0A; text-transform: uppercase;">ABCD Agency</span>
    </div>

    <!-- Title & Body -->
    <h1 style="font-size: 22px; font-weight: 700; letter-spacing: -0.4px; color: #0A0A0A; margin: 0 0 14px 0;">Password Reset Request</h1>
    <p style="font-size: 14px; line-height: 1.6; color: #525252; margin: 0 0 20px 0;">
      Hello ${userName}, we received a request to reset the password for your ABCD Agency account. Click the button below to choose a new password.
    </p>

    <!-- Action Button -->
    <div style="margin: 32px 0;">
      <a href="${resetUrl}" style="display: inline-block; background-color: #0A0A0A; color: #FFFFFF; font-size: 13px; font-weight: 600; text-decoration: none; padding: 13px 28px; border-radius: 6px; letter-spacing: 0.2px;">
        Reset My Password &rarr;
      </a>
    </div>

    <p style="font-size: 12px; line-height: 1.5; color: #737373; margin: 0 0 24px 0;">
      This password reset link is securely signed and will expire in <strong>60 minutes</strong>. If you did not request this, please disregard this email. Your password will remain unchanged.
    </p>

    <!-- Raw Link Fallback -->
    <div style="border-top: 1px solid #E5E5E5; padding-top: 20px; margin-top: 24px;">
      <p style="font-size: 11px; color: #A3A3A3; line-height: 1.4; margin: 0 0 6px 0;">Or copy and paste this URL into your browser:</p>
      <p style="font-size: 11px; color: #525252; word-break: break-all; margin: 0;">${resetUrl}</p>
    </div>
  </div>

  <div style="text-align: center; margin-top: 24px;">
    <p style="font-size: 11px; color: #A3A3A3; margin: 0;">&copy; ${new Date().getFullYear()} ABCD Agency. All rights reserved.</p>
  </div>
</body>
</html>
  `;

  return sendEmail({ to, subject, html });
}
