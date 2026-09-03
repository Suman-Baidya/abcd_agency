import { headers } from "next/headers";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum allowed hits within the window
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

class SlidingWindowRateLimiter {
  private records: Map<string, number[]> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(config: RateLimitConfig) {
    this.windowMs = config.windowMs;
    this.maxRequests = config.maxRequests;
  }

  private cleanup(key: string, now: number): number[] {
    const cutoff = now - this.windowMs;
    const timestamps = this.records.get(key) || [];
    const valid = timestamps.filter((t) => t > cutoff);
    if (valid.length === 0) {
      this.records.delete(key);
    } else {
      this.records.set(key, valid);
    }
    return valid;
  }

  /**
   * Inspects current rate limit status without recording a new hit.
   */
  check(key: string): RateLimitResult {
    const now = Date.now();
    const valid = this.cleanup(key, now);

    if (valid.length >= this.maxRequests) {
      const oldestValid = valid[0];
      const retryAfterSeconds = Math.max(1, Math.ceil((oldestValid + this.windowMs - now) / 1000));
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds,
      };
    }

    return {
      allowed: true,
      remaining: this.maxRequests - valid.length,
      retryAfterSeconds: 0,
    };
  }

  /**
   * Records an attempt/hit and returns whether it is permitted.
   */
  record(key: string): RateLimitResult {
    const now = Date.now();
    const valid = this.cleanup(key, now);

    if (valid.length >= this.maxRequests) {
      const oldestValid = valid[0];
      const retryAfterSeconds = Math.max(1, Math.ceil((oldestValid + this.windowMs - now) / 1000));
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds,
      };
    }

    valid.push(now);
    this.records.set(key, valid);

    return {
      allowed: true,
      remaining: this.maxRequests - valid.length,
      retryAfterSeconds: 0,
    };
  }

  /**
   * Resets rate limit counts for a given key (e.g. after a successful login).
   */
  reset(key: string): void {
    this.records.delete(key);
  }
}

/**
 * Extracts client IP from incoming Next.js request headers.
 */
export async function getClientIp(): Promise<string> {
  try {
    const headersList = await headers();
    const cfIp = headersList.get("cf-connecting-ip");
    const forwarded = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");

    const rawIp = cfIp || (forwarded ? forwarded.split(",")[0].trim() : realIp) || "127.0.0.1";
    return rawIp;
  } catch {
    return "127.0.0.1";
  }
}

// 1. Login limiter: Max 5 failed attempts per 15 minutes per IP & email
export const loginLimiter = new SlidingWindowRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
});

// 2. Register limiter: Max 3 accounts created per 60 minutes per IP
export const registerLimiter = new SlidingWindowRateLimiter({
  windowMs: 60 * 60 * 1000,
  maxRequests: 3,
});

// 3. OTP verification limiter: Max 5 attempts per 15 minutes per user
export const otpVerifyLimiter = new SlidingWindowRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
});

// 4. OTP resend limiter: Max 2 resends per 5 minutes per user
export const otpResendLimiter = new SlidingWindowRateLimiter({
  windowMs: 5 * 60 * 1000,
  maxRequests: 2,
});

// 5. Contact / Inquiry limiter: Max 4 inquiries per 15 minutes per IP
export const inquiryLimiter = new SlidingWindowRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 4,
});

// 6. Media / Cloudinary upload limiter: Max 10 uploads per 10 minutes per user/IP
export const uploadLimiter = new SlidingWindowRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 10,
});
