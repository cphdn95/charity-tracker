import { NextRequest, NextResponse } from "next/server";
import { adminConfigured } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

// Lets the developer view check a passcode before unlocking. The real
// enforcement is on the edit/delete endpoints; this just drives the UI.
export async function POST(request: NextRequest) {
  const expected = process.env.ADMIN_CODE;
  let code = "";
  try {
    const body = await request.json();
    code = String(body.code ?? "");
  } catch {
    // no body
  }
  const ok = !expected || code === expected;
  return NextResponse.json({ ok, configured: adminConfigured() });
}
