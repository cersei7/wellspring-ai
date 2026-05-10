import { createHash } from 'crypto';

export function anonymize(realName: string, salt: string): string {
  return 'BNF-' + createHash('sha256')
    .update(realName + salt)
    .digest('hex')
    .slice(0, 8)
    .toUpperCase();
}

export type Role = 'volunteer' | 'admin' | 'ai';

export function filterFields<T extends Record<string, any>>(
  obj: T,
  role: Role
): Partial<T> {
  if (role === 'admin') return obj;
  if (role === 'volunteer') {
    const { real_name, contact, address, ...safe } = obj as any;
    return safe;
  }
  const { real_name, contact, address, notes, ...minimal } = obj as any;
  return minimal;
}
