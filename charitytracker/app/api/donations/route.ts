import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Donation, DonationsState, DonationsPayload } from "@/lib/types";
import { CHARITIES, getCharity } from "@/lib/charities";
import { eventBus } from "@/lib/eventBus";

export const dynamic = "force-dynamic";

const donationsPath = path.join(process.cwd(), "data", "donations.json");

function readDonations(): DonationsState {
  return JSON.parse(fs.readFileSync(donationsPath, "utf-8"));
}

function writeDonations(state: DonationsState) {
  fs.writeFileSync(donationsPath, JSON.stringify(state, null, 2));
}

function buildPayload(state: DonationsState): DonationsPayload {
  // Newest first for the history sidebar.
  const donations = [...state.donations].sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp)
  );

  const totals = Object.fromEntries(
    CHARITIES.map((c) => [c.id, 0])
  ) as Record<string, number>;
  for (const d of state.donations) {
    if (d.charityId in totals) totals[d.charityId] += d.amount;
  }

  const grandTotal = state.donations.reduce((sum, d) => sum + d.amount, 0);

  return { donations, totals, grandTotal };
}

export async function GET() {
  try {
    return NextResponse.json(buildPayload(readDonations()));
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
    const charityId = String(body.charityId ?? "");
    const amount = Number(body.amount);

    const charity = getCharity(charityId);
    if (!charity) {
      return NextResponse.json({ error: "Unknown charity" }, { status: 400 });
    }
    if (!donor) {
      return NextResponse.json(
        { error: "Please enter your name" },
        { status: 400 }
      );
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Please enter a positive amount" },
        { status: 400 }
      );
    }

    const state = readDonations();
    const donation: Donation = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      donor: donor.slice(0, 60),
      charityId: charity.id,
      charityName: charity.name,
      // Cap the pledge at a sane max and round to cents.
      amount: Math.min(Math.round(amount * 100) / 100, 1_000_000),
      timestamp: new Date().toISOString(),
    };

    state.donations.push(donation);
    writeDonations(state);

    // Push the fresh state to every connected device via SSE.
    eventBus.emit("donation_update", buildPayload(state));

    return NextResponse.json({ success: true, donation });
  } catch {
    return NextResponse.json(
      { error: "Failed to record donation" },
      { status: 500 }
    );
  }
}
