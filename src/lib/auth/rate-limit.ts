import { NextRequest } from 'next/server';

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxAttempts: number; // Maximum attempts per window
  blockDurationMs: number; // How long to block after exceeding limit
}

// Default rate limiting configurations
const RATE_LIMIT_CONFIGS = {
  // Login attempts: 5 attempts per 15 minutes
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 5,
    blockDurationMs: 15 * 60 * 1000, // 15 minutes
  },
  // Password reset: 3 attempts per hour
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxAttempts: 3,
    blockDurationMs: 60 * 60 * 1000, // 1 hour
  },
  // API requests: 100 requests per minute
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxAttempts: 100,
    blockDurationMs: 5 * 60 * 1000, // 5 minutes
  },
  // Registration: 3 attempts per hour
  registration: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxAttempts: 3,
    blockDurationMs: 60 * 60 * 1000, // 1 hour
  },
} as const;

// In-memory store for rate limiting (in production, use Redis or similar)
const rateLimitStore = new Map<string, {
  attempts: number;
  firstAttempt: number;
  blockedUntil?: number;
}>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (data.blockedUntil && data.blockedUntil < now) {
      rateLimitStore.delete(key);
    } else if (!data.blockedUntil && (now - data.firstAttempt) > 60 * 60 * 1000) {
      // Clean up entries older than 1 hour
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

/**
 * Generate a rate limit key based on IP and action type
 */
function generateRateLimitKey(ip: string, action: keyof typeof RATE_LIMIT_CONFIGS): string {
  return `${action}:${ip}`;
}

/**
 * Get client IP address from request
 */
function getClientIP(request: NextRequest): string {
  // Check for forwarded IP first (from proxy/load balancer)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  // Check for real IP header
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  // Fallback to connection IP (may not be available in all environments)
  return request.ip || 'unknown';
}

/**
 * Check if a request should be rate limited
 */
export function checkRateLimit(
  request: NextRequest,
  action: keyof typeof RATE_LIMIT_CONFIGS
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
} {
  const ip = getClientIP(request);
  const key = generateRateLimitKey(ip, action);
  const config = RATE_LIMIT_CONFIGS[action];
  const now = Date.now();
  
  let data = rateLimitStore.get(key);
  
  // Initialize or reset if window has passed
  if (!data || (now - data.firstAttempt) > config.windowMs) {
    data = {
      attempts: 0,
      firstAttempt: now,
    };
  }
  
  // Check if currently blocked
  if (data.blockedUntil && now < data.blockedUntil) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: data.blockedUntil,
      retryAfter: Math.ceil((data.blockedUntil - now) / 1000),
    };
  }
  
  // Check if limit exceeded
  if (data.attempts >= config.maxAttempts) {
    // Block the IP
    data.blockedUntil = now + config.blockDurationMs;
    rateLimitStore.set(key, data);
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: data.blockedUntil,
      retryAfter: Math.ceil(config.blockDurationMs / 1000),
    };
  }
  
  // Increment attempt count
  data.attempts++;
  rateLimitStore.set(key, data);
  
  const remaining = Math.max(0, config.maxAttempts - data.attempts);
  const resetTime = data.firstAttempt + config.windowMs;
  
  return {
    allowed: true,
    remaining,
    resetTime,
  };
}

/**
 * Middleware function for rate limiting API routes
 */
export function withRateLimit(
  action: keyof typeof RATE_LIMIT_CONFIGS,
  handler: (request: NextRequest) => Promise<Response>
) {
  return async (request: NextRequest): Promise<Response> => {
    const rateLimitResult = checkRateLimit(request, action);
    
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: `Too many ${action} attempts. Please try again later.`,
          retryAfter: rateLimitResult.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': RATE_LIMIT_CONFIGS[action].maxAttempts.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
            ...(rateLimitResult.retryAfter && {
              'Retry-After': rateLimitResult.retryAfter.toString(),
            }),
          },
        }
      );
    }
    
    // Add rate limit headers to successful responses
    const response = await handler(request);
    
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT_CONFIGS[action].maxAttempts.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());
    
    return response;
  };
}

/**
 * Reset rate limit for a specific IP and action (for testing or admin purposes)
 */
export function resetRateLimit(ip: string, action: keyof typeof RATE_LIMIT_CONFIGS): void {
  const key = generateRateLimitKey(ip, action);
  rateLimitStore.delete(key);
}

/**
 * Get rate limit status for monitoring
 */
export function getRateLimitStatus(ip: string, action: keyof typeof RATE_LIMIT_CONFIGS) {
  const key = generateRateLimitKey(ip, action);
  const data = rateLimitStore.get(key);
  const config = RATE_LIMIT_CONFIGS[action];
  
  if (!data) {
    return {
      attempts: 0,
      remaining: config.maxAttempts,
      blocked: false,
      resetTime: null,
    };
  }
  
  const now = Date.now();
  const isBlocked = data.blockedUntil ? now < data.blockedUntil : false;
  const remaining = isBlocked ? 0 : Math.max(0, config.maxAttempts - data.attempts);
  
  return {
    attempts: data.attempts,
    remaining,
    blocked: isBlocked,
    resetTime: data.blockedUntil || (data.firstAttempt + config.windowMs),
  };
}

/**
 * Rate limit decorator for API routes
 */
export function rateLimit(action: keyof typeof RATE_LIMIT_CONFIGS) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (request: NextRequest, ...args: any[]) {
      const rateLimitResult = checkRateLimit(request, action);
      
      if (!rateLimitResult.allowed) {
        return new Response(
          JSON.stringify({
            error: 'Rate limit exceeded',
            message: `Too many ${action} attempts. Please try again later.`,
            retryAfter: rateLimitResult.retryAfter,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': RATE_LIMIT_CONFIGS[action].maxAttempts.toString(),
              'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
              'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
              ...(rateLimitResult.retryAfter && {
                'Retry-After': rateLimitResult.retryAfter.toString(),
              }),
            },
          }
        );
      }
      
      const response = await originalMethod.call(this, request, ...args);
      
      // Add rate limit headers
      if (response instanceof Response) {
        response.headers.set('X-RateLimit-Limit', RATE_LIMIT_CONFIGS[action].maxAttempts.toString());
        response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
        response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());
      }
      
      return response;
    };
    
    return descriptor;
  };
}
