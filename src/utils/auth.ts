import { getUser } from '@civic/auth/nextjs';

export interface AuthUser {
  email: string;
  [key: string]: any;
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Unauthorized access') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Validates if the current user is an authenticated admin
 * @returns The authenticated user object
 * @throws AuthenticationError if user is not authenticated or not an admin
 */
export async function requireAdminAuth(): Promise<boolean> {
  const user = await getUser();
  
  if (!user) {
    throw new AuthenticationError('User is not authenticated');
  }
  
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    throw new AuthenticationError('Admin email not configured');
  }
  
  if (!user.email || user.email !== adminEmail) {
    throw new AuthenticationError('User is not authorized as admin');
  }
  
  return true;
}

/**
 * Checks if the current user is an authenticated admin (non-throwing version)
 * @returns The authenticated user object or null if not authenticated
 */
export async function checkAdminAuth(): Promise<boolean> {
  try {
    return await requireAdminAuth();
  } catch {
    return false;
  }
}