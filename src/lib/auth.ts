export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'buyer' | 'seller' | 'admin';
  district: string;
  verified: boolean;
  joinedAt: string;
  bio?: string;
  sellerCategory?: string;
}

const AUTH_KEY = 'needly_auth_user';

export function getUser(): AuthUser | null {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) ?? 'null');
  } catch {
    return null;
  }
}

export function setUser(user: AuthUser): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function clearUser(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function isLoggedIn(): boolean {
  return getUser() !== null;
}

export function genUserId(): string {
  return 'U' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

export const DEMO_ACCOUNTS: Record<string, { password: string; user: AuthUser }> = {
  'buyer@demo.com': {
    password: 'demo123',
    user: { id: 'UDEMO01', name: 'Saman Perera', email: 'buyer@demo.com', phone: '+94771234567', role: 'buyer', district: 'Colombo', verified: true, joinedAt: '2024-01-15' },
  },
  'seller@demo.com': {
    password: 'demo123',
    user: { id: 'UDEMO02', name: 'Tharindu P.', email: 'seller@demo.com', phone: '+94779876543', role: 'seller', district: 'Colombo', verified: true, joinedAt: '2023-06-10', sellerCategory: 'Technology' },
  },
  'admin@demo.com': {
    password: 'demo123',
    user: { id: 'UDEMO00', name: 'Admin User', email: 'admin@demo.com', phone: '+94700000000', role: 'admin', district: 'Colombo', verified: true, joinedAt: '2023-01-01' },
  },
};
