export interface Charity {
  id: string;
  name: string;
  blurb: string;
  // Tailwind color name used to accent this charity's UI.
  accent: "emerald" | "blue" | "purple";
}

export interface Donation {
  id: string;
  donor: string;
  charityId: string;
  charityName: string;
  // Pledged amount in whole dollars. No money actually changes hands —
  // a donation is a promise to pay later.
  amount: number;
  timestamp: string;
}

export interface DonationsState {
  donations: Donation[];
}

// Shape returned by GET /api/donations and pushed over SSE.
export interface DonationsPayload {
  donations: Donation[];
  totals: Record<string, number>;
  grandTotal: number;
}
