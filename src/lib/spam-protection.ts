// Centralized Anti-Bot & Anti-Spam Shield for ABCD Agency

export const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "throwawaymail.com",
  "sharklasers.com",
  "yopmail.com",
  "trashmail.com",
  "getairmail.com",
  "dispostable.com",
  "fakeinbox.com",
  "temp-mail.org",
  "tempmailaddress.com",
  "mohmal.com",
  "burnermail.io",
  "crazymailing.com",
  "inboxkitten.com",
  "nada.ltd",
  "mytemp.email",
]);

/**
 * Checks if the email domain belongs to a known temporary/disposable provider.
 */
export function isDisposableEmail(email: string): boolean {
  if (!email || !email.includes("@")) return false;
  const domain = email.trim().toLowerCase().split("@")[1];
  return Boolean(domain && DISPOSABLE_EMAIL_DOMAINS.has(domain));
}

/**
 * Checks if the honeypot field was filled by an automated bot scraper.
 */
export function isHoneypotTriggered(honeypot?: string | null): boolean {
  return Boolean(honeypot && honeypot.trim().length > 0);
}

/**
 * Checks if a human could have realistically filled out the form in the elapsed time.
 * Real humans take at least 2.5-4 seconds to fill out forms with multiple inputs.
 */
export function isSubmissionTooFast(formLoadedAt?: number | null, minElapsedMs = 1800): boolean {
  if (!formLoadedAt || typeof formLoadedAt !== "number") return false;
  const elapsed = Date.now() - formLoadedAt;
  return elapsed > 0 && elapsed < minElapsedMs;
}

/**
 * Evaluates honeypot, submission time, and email domain to determine if submission is spam.
 */
export function checkSpamShield(params: {
  honeypot?: string | null;
  formLoadedAt?: number | null;
  email?: string | null;
  minElapsedMs?: number;
}): { isSpam: boolean; reason?: string } {
  // 1. Honeypot check
  if (isHoneypotTriggered(params.honeypot)) {
    return { isSpam: true, reason: "Automated submission detected (honeypot triggered)." };
  }

  // 2. Minimum time check (bot speed detection)
  if (isSubmissionTooFast(params.formLoadedAt, params.minElapsedMs)) {
    return { isSpam: true, reason: "Form submitted too quickly. Please take a moment to review before submitting." };
  }

  // 3. Disposable email domain check
  if (params.email && isDisposableEmail(params.email)) {
    return { isSpam: true, reason: "Disposable or temporary email addresses are not permitted." };
  }

  return { isSpam: false };
}
