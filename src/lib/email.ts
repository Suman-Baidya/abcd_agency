// Resend Email Dispatcher adhering to the Black & White Premium Design System
import { siteConfig } from "./siteConfig";

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
}

const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_APP_URL || siteConfig.url || "https://abcddigitalhub.com";
};

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.SMTP_FROM || `ABCD Digital Hub <hello@${siteConfig.domain}>`;

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
 * Common HTML email wrapper maintaining the Black & White Premium design standard.
 */
function emailTemplateWrapper({
  title,
  preheader = "",
  badge = "",
  contentHtml,
}: {
  title: string;
  preheader?: string;
  badge?: string;
  contentHtml: string;
}) {
  const baseUrl = getBaseUrl();
  const year = new Date().getFullYear();
  const logoUrl = `${baseUrl}/images/abcd_square_logo.png`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 40px 16px; background-color: #F7F7F7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0A0A0A; -webkit-font-smoothing: antialiased;">
  <!-- Optional Preheader text for inbox preview -->
  ${preheader ? `<div style="display: none; max-height: 0px; overflow: hidden;">${preheader}</div>` : ""}

  <div style="max-width: 580px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E5E5E5; border-radius: 8px; overflow: hidden; padding: 36px 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
    <!-- Brand Header -->
    <div style="border-bottom: 1px solid #E5E5E5; padding-bottom: 20px; margin-bottom: 28px; display: flex; align-items: center; justify-content: space-between;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="vertical-align: middle;">
            <a href="${baseUrl}" style="text-decoration: none; display: inline-flex; align-items: center;">
              <img src="${logoUrl}" width="32" height="32" alt="ABCD Digital Hub" style="display: inline-block; vertical-align: middle; border-radius: 6px; border: 1px solid #E5E5E5; margin-right: 10px;" />
              <span style="font-size: 16px; font-weight: 800; letter-spacing: -0.4px; color: #0A0A0A; text-transform: uppercase; vertical-align: middle;">ABCD DIGITAL HUB</span>
            </a>
          </td>
          ${badge ? `
          <td style="text-align: right; vertical-align: middle;">
            <span style="font-size: 10px; font-family: monospace; color: #737373; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #E5E5E5; padding: 3px 8px; border-radius: 4px; background-color: #FAFAFA;">${badge}</span>
          </td>` : ""}
        </tr>
      </table>
    </div>

    <!-- Main Content -->
    ${contentHtml}
  </div>

  <!-- Global Footer -->
  <div style="text-align: center; margin-top: 24px;">
    <p style="font-size: 11px; color: #A3A3A3; margin: 0 0 6px 0;">
      &copy; ${year} ABCD Digital Hub &bull; Suman Baidya &bull; All rights reserved.
    </p>
    <p style="font-size: 10px; color: #B5B5B5; margin: 0;">
      <a href="${baseUrl}" style="color: #737373; text-decoration: none;">abcddigitalhub.com</a> &bull;
      <a href="mailto:hello@${siteConfig.domain}" style="color: #737373; text-decoration: none;">hello@${siteConfig.domain}</a>
    </p>
  </div>
</body>
</html>
  `.trim();
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
  const subject = "Reset Your ABCD Digital Hub Password";
  const contentHtml = `
    <h1 style="font-size: 22px; font-weight: 700; letter-spacing: -0.4px; color: #0A0A0A; margin: 0 0 14px 0;">Password Reset Request</h1>
    <p style="font-size: 14px; line-height: 1.6; color: #525252; margin: 0 0 20px 0;">
      Hello <strong>${userName}</strong>, we received a request to reset the password for your ABCD Digital Hub account. Click the button below to choose a new secure password.
    </p>

    <!-- Action Button -->
    <div style="margin: 32px 0;">
      <a href="${resetUrl}" style="display: inline-block; background-color: #0A0A0A; color: #FFFFFF; font-size: 13px; font-weight: 600; text-decoration: none; padding: 13px 28px; border-radius: 6px; letter-spacing: 0.2px;">
        Reset My Password &rarr;
      </a>
    </div>

    <p style="font-size: 12px; line-height: 1.5; color: #737373; margin: 0 0 24px 0;">
      This password reset link is securely signed and will expire in <strong>60 minutes</strong>. If you did not request this, please disregard this notification. Your password will remain unchanged.
    </p>

    <!-- Raw Link Fallback -->
    <div style="border-top: 1px solid #E5E5E5; padding-top: 20px; margin-top: 24px;">
      <p style="font-size: 11px; color: #A3A3A3; line-height: 1.4; margin: 0 0 6px 0;">Or copy and paste this URL into your browser:</p>
      <p style="font-size: 11px; color: #525252; word-break: break-all; margin: 0; font-family: monospace;">${resetUrl}</p>
    </div>
  `;

  const html = emailTemplateWrapper({
    title: subject,
    preheader: "Reset the password for your ABCD Digital Hub account",
    badge: "Security",
    contentHtml,
  });

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
  portalUrl,
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
  const baseUrl = getBaseUrl();
  const targetPortalUrl = portalUrl || `${baseUrl}/portal/documents`;
  const subject = `Executed Agreement Confirmation: ${projectTitle} (${agreementNumber})`;

  const contentHtml = `
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
          <td style="padding: 6px 0; font-weight: 600; color: #0A0A0A;">Suman Baidya (ABCD Digital Hub)</td>
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
      <a href="${targetPortalUrl}" style="display: inline-block; background-color: #0A0A0A; color: #FFFFFF; font-size: 13px; font-weight: 600; text-decoration: none; padding: 13px 28px; border-radius: 6px; letter-spacing: 0.2px;">
        View & Download Agreement PDF &rarr;
      </a>
    </div>

    <p style="font-size: 12px; line-height: 1.5; color: #737373; margin: 0;">
      You can access your active agreements, invoices, milestones, and project deliverables 24/7 in your Client Portal.
    </p>
  `;

  const html = emailTemplateWrapper({
    title: subject,
    preheader: `Executed SOW confirmation for ${projectTitle}`,
    badge: "Executed Agreement",
    contentHtml,
  });

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
  portalUrl,
}: {
  to: string | string[];
  clientName: string;
  projectTitle: string;
  agreementNumber: string;
  updatedAtFormatted: string;
  portalUrl?: string;
}) {
  const baseUrl = getBaseUrl();
  const targetPortalUrl = portalUrl || `${baseUrl}/portal/projects`;
  const subject = `Notice of Amendment: Statement of Work (${agreementNumber}) — ${projectTitle}`;

  const contentHtml = `
    <h1 style="font-size: 20px; font-weight: 700; letter-spacing: -0.4px; color: #0A0A0A; margin: 0 0 10px 0;">Notice of Agreement Amendment</h1>
    <p style="font-size: 14px; line-height: 1.6; color: #525252; margin: 0 0 20px 0;">
      Dear <strong>${clientName}</strong>, the Statement of Work for <strong>${projectTitle}</strong> (Ref: <code>${agreementNumber}</code>) has been updated and amended by ABCD Digital Hub on <strong>${updatedAtFormatted}</strong>.
    </p>

    <div style="background-color: #FAFAFA; border: 1px solid #E5E5E5; border-radius: 6px; padding: 16px 20px; margin-bottom: 24px;">
      <p style="font-size: 13px; color: #262626; margin: 0 0 8px 0; font-weight: 600;">Legal Notice of Variation:</p>
      <p style="font-size: 12px; line-height: 1.6; color: #525252; margin: 0;">
        Pursuant to the Indian Contract Act, 1872, the updated terms, milestones, and project deliverables have been documented in your digital agreement record. Please review the upgraded Statement of Work in your Client Portal.
      </p>
    </div>

    <!-- Portal Action Button -->
    <div style="margin: 28px 0; text-align: left;">
      <a href="${targetPortalUrl}" style="display: inline-block; background-color: #0A0A0A; color: #FFFFFF; font-size: 13px; font-weight: 600; text-decoration: none; padding: 13px 28px; border-radius: 6px; letter-spacing: 0.2px;">
        Review Updated Statement of Work &rarr;
      </a>
    </div>

    <p style="font-size: 12px; line-height: 1.5; color: #737373; margin: 0;">
      If you have questions regarding this addendum, you may reply directly to this notification or reach out through your Client Portal dashboard.
    </p>
  `;

  const html = emailTemplateWrapper({
    title: subject,
    preheader: `Amendment notice for ${projectTitle} (${agreementNumber})`,
    badge: "Contract Addendum",
    contentHtml,
  });

  return sendEmail({ to, subject, html });
}

/**
 * Sends a branded welcome email to newly created or invited clients.
 */
export async function sendClientWelcomeEmail({
  to,
  clientName,
  tempPassword,
  loginUrl,
}: {
  to: string;
  clientName: string;
  tempPassword?: string;
  loginUrl?: string;
}) {
  const baseUrl = getBaseUrl();
  const targetLoginUrl = loginUrl || `${baseUrl}/login`;
  const subject = `Welcome to ABCD Digital Hub — Client Portal Access`;

  const contentHtml = `
    <h1 style="font-size: 20px; font-weight: 700; letter-spacing: -0.4px; color: #0A0A0A; margin: 0 0 10px 0;">Welcome to ABCD Digital Hub</h1>
    <p style="font-size: 14px; line-height: 1.6; color: #525252; margin: 0 0 20px 0;">
      Dear <strong>${clientName}</strong>, your dedicated Client Portal workspace has been provisioned. From here you can track active sprints, execute agreements, inspect deliverables, and collaborate with our engineering team.
    </p>

    ${tempPassword ? `
    <div style="background-color: #FAFAFA; border: 1px solid #E5E5E5; border-radius: 6px; padding: 18px 20px; margin-bottom: 24px;">
      <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #737373; margin: 0 0 8px 0; font-weight: 600;">Your Login Credentials</p>
      <p style="font-size: 13px; color: #0A0A0A; margin: 0 0 4px 0;"><strong>Email:</strong> ${to}</p>
      <p style="font-size: 13px; color: #0A0A0A; margin: 0;"><strong>Temporary Password:</strong> <code style="background-color: #E5E5E5; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${tempPassword}</code></p>
      <p style="font-size: 11px; color: #737373; margin: 8px 0 0 0;">Please change your password immediately after logging in.</p>
    </div>
    ` : ""}

    <!-- Action Button -->
    <div style="margin: 28px 0;">
      <a href="${targetLoginUrl}" style="display: inline-block; background-color: #0A0A0A; color: #FFFFFF; font-size: 13px; font-weight: 600; text-decoration: none; padding: 13px 28px; border-radius: 6px; letter-spacing: 0.2px;">
        Access Your Client Portal &rarr;
      </a>
    </div>

    <p style="font-size: 12px; line-height: 1.5; color: #737373; margin: 0;">
      If you need any technical assistance, reply directly to this email or reach our support desk at <a href="mailto:hello@${siteConfig.domain}" style="color: #0A0A0A; font-weight: 600;">hello@${siteConfig.domain}</a>.
    </p>
  `;

  const html = emailTemplateWrapper({
    title: subject,
    preheader: "Your ABCD Digital Hub client portal workspace is ready",
    badge: "Client Onboarding",
    contentHtml,
  });

  return sendEmail({ to, subject, html });
}

/**
 * Sends an automated confirmation email to a client who submitted an inquiry.
 */
export async function sendInquiryAcknowledgementEmail({
  to,
  clientName,
  projectType,
}: {
  to: string;
  clientName: string;
  projectType?: string;
}) {
  const subject = `Inquiry Received: ABCD Digital Hub`;
  const contentHtml = `
    <h1 style="font-size: 20px; font-weight: 700; letter-spacing: -0.4px; color: #0A0A0A; margin: 0 0 10px 0;">Thank You for Reaching Out</h1>
    <p style="font-size: 14px; line-height: 1.6; color: #525252; margin: 0 0 16px 0;">
      Dear <strong>${clientName}</strong>, we have received your project inquiry${projectType ? ` regarding <strong>${projectType}</strong>` : ""}.
    </p>
    <p style="font-size: 14px; line-height: 1.6; color: #525252; margin: 0 0 20px 0;">
      Our engineering and product team reviews every submission thoroughly. You will hear back from us within <strong>24 hours</strong> with scope feasibility and next steps.
    </p>

    <div style="border-left: 3px solid #0A0A0A; padding: 12px 16px; background-color: #F5F5F5; margin: 24px 0;">
      <p style="font-size: 12px; color: #525252; margin: 0;">
        Need to expedite your timeline? You can also message us directly on WhatsApp at <strong>+91 81676 85731</strong>.
      </p>
    </div>

    <p style="font-size: 12px; line-height: 1.5; color: #737373; margin: 0;">
      Warm regards,<br />
      <strong>Suman Baidya & The ABCD Digital Hub Team</strong>
    </p>
  `;

  const html = emailTemplateWrapper({
    title: subject,
    preheader: "We have received your project inquiry at ABCD Digital Hub",
    badge: "Inquiry Received",
    contentHtml,
  });

  return sendEmail({ to, subject, html });
}

/**
 * Sends an urgent notification to the agency admin when a new client inquiry is submitted.
 */
export async function sendInquiryAdminAlertEmail({
  name,
  email,
  phone,
  whatsapp,
  businessType,
  services,
  projectType,
  budget,
  message,
}: {
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  businessType?: string;
  services?: string[];
  projectType?: string;
  budget?: string;
  message?: string;
}) {
  const adminEmail = process.env.DEVELOPER_EMAIL || "hello@abcddigitalhub.com";
  const baseUrl = getBaseUrl();
  const inquiriesDashboardUrl = `${baseUrl}/admin/inquiries`;
  const subject = `New Lead Alert: ${name} (${projectType || "General Inquiry"})`;

  const contentHtml = `
    <h1 style="font-size: 20px; font-weight: 700; letter-spacing: -0.4px; color: #0A0A0A; margin: 0 0 10px 0;">New Project Inquiry Received</h1>
    <p style="font-size: 14px; line-height: 1.6; color: #525252; margin: 0 0 20px 0;">
      A prospective client just submitted an inquiry on <strong>abcddigitalhub.com</strong>.
    </p>

    <div style="background-color: #FAFAFA; border: 1px solid #E5E5E5; border-radius: 6px; padding: 18px 20px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr>
          <td style="padding: 6px 0; color: #737373; width: 35%;">Prospect Name:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #0A0A0A;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #737373;">Email:</td>
          <td style="padding: 6px 0; color: #0A0A0A;"><a href="mailto:${email}" style="color: #0A0A0A; text-decoration: underline;">${email}</a></td>
        </tr>
        ${phone ? `
        <tr>
          <td style="padding: 6px 0; color: #737373;">Phone / Mobile:</td>
          <td style="padding: 6px 0; font-family: monospace; color: #0A0A0A;"><a href="tel:${phone}" style="color: #0A0A0A; text-decoration: none;">${phone}</a></td>
        </tr>` : ""}
        ${whatsapp ? `
        <tr>
          <td style="padding: 6px 0; color: #737373;">WhatsApp:</td>
          <td style="padding: 6px 0; font-family: monospace; color: #0A0A0A;"><a href="https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}" target="_blank" style="color: #0A0A0A; text-decoration: none;">${whatsapp}</a></td>
        </tr>` : ""}
        ${businessType ? `
        <tr>
          <td style="padding: 6px 0; color: #737373;">Business Type:</td>
          <td style="padding: 6px 0; color: #0A0A0A;">${businessType}</td>
        </tr>` : ""}
        ${projectType ? `
        <tr>
          <td style="padding: 6px 0; color: #737373;">Project Type:</td>
          <td style="padding: 6px 0; font-weight: 600; color: #0A0A0A;">${projectType}</td>
        </tr>` : ""}
        ${budget ? `
        <tr>
          <td style="padding: 6px 0; color: #737373;">Estimated Budget:</td>
          <td style="padding: 6px 0; font-weight: 700; color: #0A0A0A;">${budget}</td>
        </tr>` : ""}
        ${services && services.length > 0 ? `
        <tr>
          <td style="padding: 6px 0; color: #737373;">Services Requested:</td>
          <td style="padding: 6px 0; color: #0A0A0A;">${services.join(", ")}</td>
        </tr>` : ""}
      </table>
    </div>

    ${message ? `
    <div style="background-color: #F5F5F5; border-left: 3px solid #0A0A0A; padding: 14px 16px; margin-bottom: 24px;">
      <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #737373; margin: 0 0 6px 0; font-weight: 600;">Client Message</p>
      <p style="font-size: 13px; line-height: 1.6; color: #262626; margin: 0; white-space: pre-wrap;">${message}</p>
    </div>` : ""}

    <!-- Admin CTA -->
    <div style="margin: 28px 0;">
      <a href="${inquiriesDashboardUrl}" style="display: inline-block; background-color: #0A0A0A; color: #FFFFFF; font-size: 13px; font-weight: 600; text-decoration: none; padding: 13px 28px; border-radius: 6px; letter-spacing: 0.2px;">
        Open Inquiries CRM &rarr;
      </a>
    </div>
  `;

  const html = emailTemplateWrapper({
    title: subject,
    preheader: `New lead from ${name} - ${projectType || "General Inquiry"}`,
    badge: "Admin Lead Alert",
    contentHtml,
  });

  return sendEmail({ to: adminEmail, subject, html });
}

/**
 * Sends a black & white branded 6-digit email verification OTP.
 */
export async function sendVerificationOtpEmail({
  to,
  otpCode,
  userName = "Valued Partner",
}: {
  to: string;
  otpCode: string;
  userName?: string;
}) {
  const subject = `Your ABCD Digital Hub Verification Code: ${otpCode}`;
  const contentHtml = `
    <h1 style="font-size: 22px; font-weight: 700; letter-spacing: -0.4px; color: #0A0A0A; margin: 0 0 14px 0;">Verify Your Email Address</h1>
    <p style="font-size: 14px; line-height: 1.6; color: #525252; margin: 0 0 24px 0;">
      Hello <strong>${userName}</strong>, thank you for registering with ABCD Digital Hub. Please enter the following 6-digit verification code to activate your account:
    </p>

    <!-- Large Monospace OTP Box -->
    <div style="background-color: #FAFAFA; border: 1px solid #E5E5E5; border-radius: 8px; padding: 24px 16px; text-align: center; margin: 28px 0;">
      <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0A0A0A; display: inline-block;">
        ${otpCode}
      </span>
      <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #737373; margin: 10px 0 0 0;">
        Valid for 15 minutes
      </p>
    </div>

    <p style="font-size: 12px; line-height: 1.5; color: #737373; margin: 0 0 16px 0;">
      If you did not request this verification code, please disregard this email. Your account remains protected.
    </p>
  `;

  const html = emailTemplateWrapper({
    title: subject,
    preheader: `Your verification code is ${otpCode}`,
    badge: "Verification",
    contentHtml,
  });

  return sendEmail({ to, subject, html });
}
