import { getRoleByEmail } from '@/lib/db';

export type AuthResult = { ok: true } | { ok: false; status: number; error: string };

// Verifikasi requester adalah operator. Role diambil langsung dari DB,
// bukan dari cookie/role yang dikirim client (cookie bisa dipalsukan).
// `resource` hanya untuk menyusun pesan error yang spesifik.
export async function requireOperator(requesterEmail: unknown, resource: string): Promise<AuthResult> {
  const email = typeof requesterEmail === 'string' ? requesterEmail.toLowerCase().trim() : '';
  if (!email) {
    return { ok: false, status: 401, error: 'Unauthorized: requester identity is required' };
  }
  const role = await getRoleByEmail(email);
  if (role !== 'operator') {
    return { ok: false, status: 403, error: `Forbidden: only operators can manage ${resource}` };
  }
  return { ok: true };
}
