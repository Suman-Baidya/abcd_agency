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

/**
 * Sends a black & white branded executed agreement confirmation email.
 */
export async function sendSignedAgreementEmail({
  to,
  clientName,
  signatoryName,
  projectTitle,
  agreementNumber,
  totalAmount,
  signedAtFormatted,
  auditHash,
  portalUrl = "https://abcdagency.com/portal/documents",
}: {
  to: string;
  clientName: string;
  signatoryName: string;
  projectTitle: string;
  agreementNumber: string;
  totalAmount: string;
  signedAtFormatted: string;
  auditHash: string;
  portalUrl?: string;
}) {
  const subject = `Executed Agreement Confirmation: ${projectTitle} (${agreementNumber})`;
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 40px 16px; background-color: #F7F7F7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0A0A0A;">
  <div style="max-width: 580px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E5E5E5; border-radius: 8px; overflow: hidden; padding: 36px 32px;">
    <!-- Brand Header -->
    <div style="border-bottom: 1px solid #E5E5E5; padding-bottom: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: 18px; font-weight: 800; letter-spacing: -0.5px; color: #0A0A0A; text-transform: uppercase;">ABCD Agency</span>
      <span style="font-size: 11px; font-family: monospace; color: #737373; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #E5E5E5; padding: 3px 8px; border-radius: 4px;">Digitally Executed</span>
    </div>

    <!-- Title & Statement -->
    <h1 style="font-size: 20px; font-weight: 700; letter-spacing: -0.4px; color: #0A0A0A; margin: 0 0 10px 0;">Statement of Work Executed</h1>
    <p style="font-size: 14px; line-height: 1.6; color: #525252; margin: 0 0 24px 0;">
      Dear <strong>${clientName}</strong>, the Master Services Agreement & Statement of Work for <strong>${projectTitle}</strong> has been legally executed by both parties. A permanent digital execution record has been logged in the client portal.
    </p>

    <!-- Key Agreement Details Table -->
    <div style="background-color: #FAFAFA; border: 1px solid #E5E5E5; border-radius: 6px; padding: 18px 20px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="padding: 6px 0; color: #737373; width: 40%;">Agreement No:</td>
          <td style="padding: 6px 0; font-family: monospace; font-weight: 600; color: #0A0A0A;">${agreementNumber}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #737373;">Contractor:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #0A0A0A;">Suman Baidya (ABCD Agency)</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #737373;">Authorized Signatory:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #0A0A0A;">${signatoryName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #737373;">Total Project Value:</td>
          <td style="padding: 6px 0; font-weight: 700; color: #0A0A0A;">${totalAmount}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #737373;">Execution Timestamp:</td>
          <td style="padding: 6px 0; color: #0A0A0A;">${signedAtFormatted}</td>
        </tr>
      </table>
    </div>

    <!-- Cryptographic Audit Hash -->
    <div style="border-left: 3px solid #0A0A0A; padding: 10px 14px; background-color: #F5F5F5; margin-bottom: 28px;">
      <p style="font-size: 10px; font-family: monospace; text-transform: uppercase; color: #737373; margin: 0 0 4px 0; letter-spacing: 0.5px;">SHA-256 Non-Repudiation Audit Seal</p>
      <p style="font-size: 11px; font-family: monospace; color: #171717; word-break: break-all; margin: 0;">${auditHash}</p>
      <p style="font-size: 10px; color: #737373; margin: 4px 0 0 0;">Compliant under Section 10A of the Indian Information Technology Act, 2000.</p>
    </div>

    <!-- Portal Action Button -->
    <div style="margin: 28px 0; text-align: left;">
      <a href="${portalUrl}" style="display: inline-block; background-color: #0A0A0A; color: #FFFFFF; font-size: 13px; font-weight: 600; text-decoration: none; padding: 13px 28px; border-radius: 6px; letter-spacing: 0.2px;">
        View & Download Agreement PDF &rarr;
      </a>
    </div>

    <p style="font-size: 12px; line-height: 1.5; color: #737373; margin: 0;">
      You can access your active agreements, invoices, milestones, and project deliverables 24/7 in your Client Portal.
    </p>
  </div>

  <div style="text-align: center; margin-top: 24px;">
    <p style="font-size: 11px; color: #A3A3A3; margin: 0;">&copy; ${new Date().getFullYear()} ABCD Agency &bull; Suman Baidya &bull; All rights reserved.</p>
  </div>
</body>
</html>
  `;

  return sendEmail({ to, subject, html });
}

/**
 * Sends a formal Notice of Amendment email to the client when an agreement is updated post-execution.
 */
export async function sendAgreementAmendmentEmail({
  to,
  clientName,
  projectTitle,
  agreementNumber,
  updatedAtFormatted,
  portalUrl = "https://abcdagency.com/portal/projects",
}: {
  to: string | string[];
  clientName: string;
  projectTitle: string;
  agreementNumber: string;
  updatedAtFormatted: string;
  portalUrl?: string;
}) {
  const subject = `Notice of Amendment: Statement of Work (${agreementNumber}) — ${projectTitle}`;
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 40px 16px; background-color: #F7F7F7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0A0A0A;">
  <div style="max-width: 580px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E5E5E5; border-radius: 8px; overflow: hidden; padding: 36px 32px;">
    <!-- Brand Header -->
    <div style="border-bottom: 1px solid #E5E5E5; padding-bottom: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: 18px; font-weight: 800; letter-spacing: -0.5px; color: #0A0A0A; text-transform: uppercase;">ABCD Agency</span>
      <span style="font-size: 11px; font-family: monospace; color: #737373; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #E5E5E5; padding: 3px 8px; border-radius: 4px;">Contract Addendum</span>
    </div>

    <!-- Title & Statement -->
    <h1 style="font-size: 20px; font-weight: 700; letter-spacing: -0.4px; color: #0A0A0A; margin: 0 0 10px 0;">Notice of Agreement Amendment</h1>
    <p style="font-size: 14px; line-height: 1.6; color: #525252; margin: 0 0 20px 0;">
      Dear <strong>${clientName}</strong>, the Statement of Work for <strong>${projectTitle}</strong> (Ref: <code>${agreementNumber}</code>) has been updated and amended by ABCD Agency on <strong>${updatedAtFormatted}</strong>.
    </p>

    <div style="background-color: #FAFAFA; border: 1px solid #E5E5E5; border-radius: 6px; padding: 16px 20px; margin-bottom: 24px;">
      <p style="font-size: 13px; color: #262626; margin: 0 0 8px 0; font-weight: 600;">Legal Notice of Variation:</p>
      <p style="font-size: 12px; line-height: 1.6; color: #525252; margin: 0;">
        Pursuant to the Indian Contract Act, 1872, the updated terms, milestones, and project deliverables have been documented in your digital agreement record. Please review the upgraded Statement of Work in your Client Portal.
      </p>
    </div>

    <!-- Portal Action Button -->
    <div style="margin: 28px 0; text-align: left;">
      <a href="${portalUrl}" style="display: inline-block; background-color: #0A0A0A; color: #FFFFFF; font-size: 13px; font-weight: 600; text-decoration: none; padding: 13px 28px; border-radius: 6px; letter-spacing: 0.2px;">
        Review Updated Statement of Work &rarr;
      </a>
    </div>

    <p style="font-size: 12px; line-height: 1.5; color: #737373; margin: 0;">
      If you have questions regarding this addendum, you may reply directly to this notification or reach out through your Client Portal dashboard.
    </p>
  </div>

  <div style="text-align: center; margin-top: 24px;">
    <p style="font-size: 11px; color: #A3A3A3; margin: 0;">&copy; ${new Date().getFullYear()} ABCD Agency &bull; Suman Baidya &bull; All rights reserved.</p>
  </div>
</body>
</html>
  `;

  return sendEmail({ to, subject, html });
}

