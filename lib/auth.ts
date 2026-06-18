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

// Verifikasi requester adalah user/operator/guest yang valid.
// Kalau operator, boleh akses resource siapa saja.
// Kalau bukan operator, targetEmail HARUS sama dengan requesterEmail (self-only).
export async function requireUserOrOperator(requesterEmail: unknown, targetEmail: unknown): Promise<AuthResult> {
  const reqEmail = typeof requesterEmail === 'string' ? requesterEmail.toLowerCase().trim() : '';
  if (!reqEmail) {
    return { ok: false, status: 401, error: 'Unauthorized: requester identity is required' };
  }
  const tEmail = typeof targetEmail === 'string' ? targetEmail.toLowerCase().trim() : '';
  if (!tEmail) {
    return { ok: false, status: 400, error: 'Target email is required' };
  }
  const role = await getRoleByEmail(reqEmail);
  if (!role) {
    return { ok: false, status: 401, error: 'Unauthorized: requester not found' };
  }
  if (role !== 'operator' && reqEmail !== tEmail) {
    return { ok: false, status: 403, error: 'Forbidden: you can only access your own profile' };
  }
  return { ok: true };
}
