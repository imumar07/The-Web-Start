import { NextRequest } from "next/server";
import { getDB, ok, err } from "@/lib/api-helpers";
import { getReferralById, updateReferral, deleteReferral } from "@/lib/db-referrals";
import { z } from "zod";

const updateSchema = z.object({
  referrer_client_id: z.number().int().positive().optional(),
  referred_name:       z.string().min(1).optional(),
  referred_email:      z.string().email().optional().nullable(),
  referred_phone:      z.string().optional().nullable(),
  commission_amount:   z.number().min(0).optional(),
  status:              z.enum(["pending", "paid", "cancelled"]).optional(),
  referral_date:       z.string().optional(),
  paid_date:           z.string().optional().nullable(),
  notes:               z.string().optional().nullable(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const referral = await getReferralById(getDB(), Number(id));
    if (!referral) return err("Not found", 404);
    return ok(referral);
  } catch { return err("Failed", 500); }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return err(parsed.error.issues[0]?.message ?? "Invalid input", 400);
    await updateReferral(getDB(), Number(id), parsed.data);
    return ok({ message: "Updated" });
  } catch { return err("Failed", 500); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteReferral(getDB(), Number(id));
    return ok({ message: "Deleted" });
  } catch { return err("Failed", 500); }
}
