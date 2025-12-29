import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production'
);

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
  companyId: string | null;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      console.log('[getAuthUser] No auth-token cookie found');
      return null;
    }

    console.log('[getAuthUser] Token found, length:', token.length);
    
    const { payload } = await jwtVerify(token, secret);
    
    console.log('[getAuthUser] JWT verified successfully:', {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });
    
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string,
      companyId: payload.companyId as string | null,
    };
  } catch (error: any) {
    console.error('[getAuthUser] Error:', error?.message || error);
    return null;
  }
}

export function isAdmin(role: string): boolean {
  return role === 'SUPER_ADMIN';
}

export function isCompanyAdmin(role: string): boolean {
  return role === 'SUPER_ADMIN' || role === 'COMPANY_ADMIN';
}

