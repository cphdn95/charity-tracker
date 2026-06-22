import { NextRequest, NextResponse } from "next/server";
import { Donation, DonationsPayload } from "@/lib/types";
import { CHARITIES, getCharity } from "@/lib/charities";
import { getDonations, saveDonations, hasDatabase } from "@/lib/store";
import { checkAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

function buildPayload(donations: Donation[]): DonationsPayload {
  // Newest first for the history sidebar.
  const sorted = [...donations].sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp)
  );

  const totals = Object.fromEntries(
    CHARITIES.map((c) => [c.id, 0])
  ) as Record<string, number>;
  for (const d of donations) {
    if (d.charityId in totals) totals[d.charityId] += d.amount;
  }

  const grandTotal = donations.reduce((sum, d) => sum + d.amount, 0);

  return { donations: sorted, totals, grandTotal };
}

function cleanAmount(value: unknown): number | null {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  // Round to cents and cap at a sane maximum.
  return Math.min(Math.round(n * 100) / 100, 1_000_000);
}

export async function GET() {
  try {
    return NextResponse.json(buildPayload(await getDonations()));
  } catch {
    return NextResponse.json(
      { error: "Failed to read donations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const donor = String(body.donor ?? "").trim();
    const charity = getCharity(String(body.charityId ?? ""));
    const amount = cleanAmount(body.amount);

    if (!charity) {
      return NextResponse.json({ error: "Unknown charity" }, { status: 400 });
    }
    if (!donor) {
      return NextResponse.json(
        { error: "Please enter your name" },
        { status: 400 }
      );
    }
    if (amount === null) {
      return NextResponse.json(
        { error: "Please enter a positive amount" },
        { status: 400 }
      );
    }
    if (!hasDatabase() && process.env.VERCEL) {
      return NextResponse.json(
        {
          error:
            "No database connected. Add an Upstash Redis database to this project in Vercel → Storage, then redeploy.",
        },
        { status: 500 }
      );
    }

    const donations = await getDonations();
    const donation: Donation = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      donor: donor.slice(0, 60),
      charityId: charity.id,
      charityName: charity.name,
      amount,
      timestamp: new Date().toISOString(),
    };

    donations.push(donation);
    await saveDonations(donations);

    return NextResponse.json({ success: true, donation });
  } catch {
    return NextResponse.json(
      { error: "Failed to record donation" },
      { status: 500 }
    );
  }
}

// Edit an existing donation (developer view). Body: { id, donor?, charityId?, amount? }
export async function PATCH(request: NextRequest) {
  try {
    if (!checkAdmin(request)) {
      return NextResponse.json(
        { error: "Incorrect or missing passcode" },
        { status: 401 }
      );
    }
    const body = await request.json();
    const id = String(body.id ?? "");
    if (!id) {
      return NextResponse.json({ error: "Missing donation id" }, { status: 400 });
    }

    const donations = await getDonations();
    const idx = donations.findIndex((d) => d.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }

    const current = donations[idx];
    const updated: Donation = { ...current };

    if (body.donor !== undefined) {
      const donor = String(body.donor).trim();
      if (!donor) {
        return NextResponse.json({ error: "Name can't be empty" }, { status: 400 });
      }
      updated.donor = donor.slice(0, 60);
    }

    if (body.charityId !== undefined) {
      const charity = getCharity(String(body.charityId));
      if (!charity) {
        return NextResponse.json({ error: "Unknown charity" }, { status: 400 });
      }
      updated.charityId = charity.id;
      updated.charityName = charity.name;
    }

    if (body.amount !== undefined) {
      const amount = cleanAmount(body.amount);
      if (amount === null) {
        return NextResponse.json(
          { error: "Please enter a positive amount" },
          { status: 400 }
        );
      }
      updated.amount = amount;
    }

    donations[idx] = updated;
    await saveDonations(donations);

    return NextResponse.json({ success: true, donation: updated });
  } catch {
    return NextResponse.json(
      { error: "Failed to edit donation" },
      { status: 500 }
    );
  }
}

// Delete one donation (?id=...) or clear them all (?all=true). Developer view.
export async function DELETE(request: NextRequest) {
  try {
    if (!checkAdmin(request)) {
      return NextResponse.json(
        { error: "Incorrect or missing passcode" },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(request.url);

    if (searchParams.get("all") === "true") {
      await saveDonations([]);
      return NextResponse.json({ success: true, cleared: true });
    }

    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Provide ?id= to delete one, or ?all=true to clear" },
        { status: 400 }
      );
    }

    const donations = await getDonations();
    const next = donations.filter((d) => d.id !== id);
    if (next.length === donations.length) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }

    await saveDonations(next);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete donation" },
      { status: 500 }
    );
  }
}
