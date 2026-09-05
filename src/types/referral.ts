export type ReferralStatus = "pending" | "paid" | "cancelled";

export interface Referral {
  id: number;
  referrer_client_id: number;
  referred_name: string;
  referred_email: string | null;
  referred_phone: string | null;
  commission_amount: number;
  status: ReferralStatus;
  referral_date: string;
  paid_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReferralWithClient extends Referral {
  referrer_name: string;
  referrer_email: string;
  referrer_company: string | null;
}

export interface CreateReferralPayload {
  referrer_client_id: number;
  referred_name: string;
  referred_email?: string | null;
  referred_phone?: string | null;
  commission_amount: number;
  status?: ReferralStatus;
  referral_date?: string;
  paid_date?: string | null;
  notes?: string | null;
}
