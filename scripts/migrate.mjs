// Run: node scripts/migrate.mjs
import { createClient } from "@libsql/client";
import { readFileSync } from "fs";
import { config } from "dotenv";

// Load .env.local (Next.js convention)
config({ path: ".env.local" });

const db = createClient({
  url:       process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const migrations = [
  "migrations/001_init.sql",
  "migrations/002_dashboards.sql",
  "migrations/003_quotations.sql",
  "migrations/004_phonepe.sql",
  "migrations/005_razorpay.sql",
  "migrations/006_password_reset.sql",
  "migrations/007_referrals.sql",
];

async function run() {
  console.log("Running migrations...");
  for (const file of migrations) {
    const sql = readFileSync(file, "utf8");
    await db.executeMultiple(sql);
    console.log(`✓ ${file}`);
  }
  console.log("\nDone! Database is up to date.");
  process.exit(0);
}

run().catch(e => { console.error("Migration failed:", e.message); process.exit(1); });
