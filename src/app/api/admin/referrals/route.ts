import { NextRequest } from "next/server";
import { getDB, ok, err } from "@/lib/api-helpers";
import { getAllReferrals, createReferral } from "@/lib/db-referrals";
import { z } from "zod";

const schema = z.object({
  referrer_client_id: z.number().int().positive(),
  referred_name:       z.string().min(1),
  referred_email:      z.string().email().optional().nullable(),
  referred_phone:      z.string().optional().nullable(),
  commission_amount:   z.number().min(0),
  status:              z.enum(["pending", "paid", "cancelled"]).default("pending"),
  referral_date:       z.string().optional(),
  paid_date:           z.string().optional().nullable(),
  notes:               z.string().optional().nullable(),
});

export async function GET() {
  try {
    return ok(await getAllReferrals(getDB()));
  } catch { return err("Failed", 500); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Invalid input", 400);
    const result = await createReferral(getDB(), parsed.data);
    return ok({ message: "Referral created", id: result.id }, 201);
  } catch (error) {
    console.error("Referral creation failed:", error);
    return err("Failed to create referral", 500);
  }
}
