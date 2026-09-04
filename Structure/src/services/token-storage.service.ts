import { Injectable } from '@angular/core';
import { DecodedJwtPayload } from '../models/auth.models';

const KEY_PLATFORM_TOKEN = 'centaiva_platform_control_token';
const KEY_PLATFORM_REFRESH_TOKEN = 'centaiva_platform_refresh_token';
const KEY_WORKWELL_TOKEN = 'centaiva_workwell_finance_token';
const KEY_WORKWELL_REFRESH_TOKEN = 'centaiva_workwell_refresh_token';
const KEY_SELECTED_TENANT_ID = 'centaiva_selected_tenant_id';
const KEY_USER_PROFILE = 'centaiva_user_profile';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {

  // Platform Control Token (Tenantless for Platform Owner)
  setPlatformControlToken(token: string, refreshToken?: string): void {
    if (this.isBrowser()) {
      localStorage.setItem(KEY_PLATFORM_TOKEN, token);
      if (refreshToken) {
        localStorage.setItem(KEY_PLATFORM_REFRESH_TOKEN, refreshToken);
      }
    }
  }

  getPlatformControlToken(): string | null {
    return this.isBrowser() ? localStorage.getItem(KEY_PLATFORM_TOKEN) : null;
  }

  getPlatformRefreshToken(): string | null {
    return this.isBrowser() ? localStorage.getItem(KEY_PLATFORM_REFRESH_TOKEN) : null;
  }

  clearPlatformToken(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(KEY_PLATFORM_TOKEN);
      localStorage.removeItem(KEY_PLATFORM_REFRESH_TOKEN);
      localStorage.removeItem(KEY_USER_PROFILE);
    }
  }

  hasPlatformSession(): boolean {
    const token = this.getPlatformControlToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  // WorkWell Finance Token (Tenant-bound)
  setWorkwellFinanceToken(token: string, refreshToken?: string, tenantId?: string): void {
    if (this.isBrowser()) {
      localStorage.setItem(KEY_WORKWELL_TOKEN, token);
      if (refreshToken) {
        localStorage.setItem(KEY_WORKWELL_REFRESH_TOKEN, refreshToken);
      }
      if (tenantId) {
        localStorage.setItem(KEY_SELECTED_TENANT_ID, tenantId);
      }
    }
  }

  getWorkwellFinanceToken(): string | null {
    return this.isBrowser() ? localStorage.getItem(KEY_WORKWELL_TOKEN) : null;
  }

  getWorkwellRefreshToken(): string | null {
    return this.isBrowser() ? localStorage.getItem(KEY_WORKWELL_REFRESH_TOKEN) : null;
  }

  getSelectedTenantId(): string | null {
    return this.isBrowser() ? localStorage.getItem(KEY_SELECTED_TENANT_ID) : null;
  }

  clearWorkwellToken(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(KEY_WORKWELL_TOKEN);
      localStorage.removeItem(KEY_WORKWELL_REFRESH_TOKEN);
      localStorage.removeItem(KEY_SELECTED_TENANT_ID);
    }
  }

  hasWorkwellSession(): boolean {
    const token = this.getWorkwellFinanceToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  // Clear all contexts
  clearAll(): void {
    this.clearPlatformToken();
    this.clearWorkwellToken();
  }

  // JWT Helper methods
  decodeToken(token: string): DecodedJwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = parts[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload) as DecodedJwtPayload;
    } catch {
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return false;
    const expiryDate = decoded.exp * 1000;
    return Date.now() >= expiryDate;
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}
