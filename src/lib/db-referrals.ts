import type { TursoDb as D1Database } from "./turso";
import type { Referral, ReferralWithClient, CreateReferralPayload } from "@/types/referral";

export async function getAllReferrals(db: D1Database): Promise<ReferralWithClient[]> {
  const { results } = await db.prepare(`
    SELECT r.*, c.name as referrer_name, c.email as referrer_email, c.company as referrer_company
    FROM referrals r JOIN clients c ON r.referrer_client_id = c.id
    ORDER BY r.created_at DESC
  `).all<ReferralWithClient>();
  return results ?? [];
}

export async function getReferralById(db: D1Database, id: number): Promise<ReferralWithClient | null> {
  return db.prepare(`
    SELECT r.*, c.name as referrer_name, c.email as referrer_email, c.company as referrer_company
    FROM referrals r JOIN clients c ON r.referrer_client_id = c.id
    WHERE r.id=?
  `).bind(id).first<ReferralWithClient>();
}

export async function createReferral(db: D1Database, data: CreateReferralPayload) {
  const result = await db.prepare(`
    INSERT INTO referrals
      (referrer_client_id,referred_name,referred_email,referred_phone,commission_amount,status,referral_date,paid_date,notes)
    VALUES (?,?,?,?,?,?,?,?,?)
  `).bind(
    data.referrer_client_id, data.referred_name,
    data.referred_email ?? null, data.referred_phone ?? null,
    data.commission_amount, data.status ?? "pending",
    data.referral_date ?? new Date().toISOString().split("T")[0],
    data.paid_date ?? null, data.notes ?? null,
  ).run();

  const id = Number((result as unknown as { meta: { lastInsertRowid: number } }).meta.lastInsertRowid);
  return { id };
}

export async function updateReferral(db: D1Database, id: number, data: Partial<CreateReferralPayload & { status: Referral["status"] }>) {
  const allowed = ["referrer_client_id", "referred_name", "referred_email", "referred_phone", "commission_amount", "status", "referral_date", "paid_date", "notes"];
  const keys = Object.keys(data).filter(k => allowed.includes(k));
  if (!keys.length) return;
  const fields = keys.map(k => `${k}=?`).join(",");
  const values = keys.map(k => (data as Record<string, unknown>)[k]);
  return db.prepare(`UPDATE referrals SET ${fields},updated_at=datetime('now') WHERE id=?`).bind(...values, id).run();
}

export async function deleteReferral(db: D1Database, id: number) {
  return db.prepare("DELETE FROM referrals WHERE id=?").bind(id).run();
}
