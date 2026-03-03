import { Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerRequest } from '@nestjs/throttler';

/**
 * Keys by configId (route param) — for Stremio catalog/manifest endpoints.
 * Falls back to IP when configId is absent (e.g. the landing manifest).
 * Only enforces the 'stremio' throttler; all others are passed through.
 */
@Injectable()
export class StremioThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.params?.configId ?? req.ip ?? 'unknown';
  }

  protected async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    if (requestProps.throttler.name !== 'stremio') return true;
    return super.handleRequest(requestProps);
  }
}

/**
 * Keys by IP — for unauthenticated auth endpoints (login, register).
 * Only enforces the 'auth' throttler; all others are passed through.
 */
@Injectable()
export class AuthThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.ip ?? 'unknown';
  }

  protected async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    if (requestProps.throttler.name !== 'auth') return true;
    return super.handleRequest(requestProps);
  }
}

/**
 * Keys by authenticated user ID, falls back to IP for public routes.
 * JWT guard must run before this guard for user ID keying to work.
 * Only enforces the 'api' throttler; all others are passed through.
 */
@Injectable()
export class ApiThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.user?.sub ?? req.ip ?? 'unknown';
  }

  protected async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    if (requestProps.throttler.name !== 'api') return true;
    return super.handleRequest(requestProps);
  }
}
