"use client";
import { useState } from "react";
import { CHARITIES } from "@/lib/charities";
import { ACCENT_CLASSES } from "@/lib/colors";
import { useDonations } from "@/lib/useDonations";
import DonationHistory from "@/components/DonationHistory";
import TabNav from "@/components/TabNav";

const QUICK_AMOUNTS = [10, 25, 50, 100];

export default function Home() {
  const { data, refresh } = useDonations();

  const [charityId, setCharityId] = useState<string>(CHARITIES[0].id);
  const [donor, setDonor] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justGave, setJustGave] = useState(false);

  const selected = CHARITIES.find((c) => c.id === charityId) ?? CHARITIES[0];
  const accent = ACCENT_CLASSES[selected.accent];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const amt = Number(amount);
    if (!donor.trim()) return setError("Please enter your name.");
    if (!Number.isFinite(amt) || amt <= 0)
      return setError("Please enter an amount greater than $0.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donor: donor.trim(), charityId, amount: amt }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error || "Something went wrong.");
        return;
      }
      setAmount("");
      setJustGave(true);
      setTimeout(() => setJustGave(false), 2500);
      refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen">
      <TabNav />
      <div className="border-b border-gray-800 bg-gray-900/40">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <p className="text-sm text-gray-400 max-w-xl">
            Promise a donation to a charity — no money is charged now, you&apos;re
            pledging to pay later. Share this link and pledges show up here live.
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Choose a charity
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {CHARITIES.map((c) => {
              const a = ACCENT_CLASSES[c.accent];
              const isSel = c.id === charityId;
              return (
                <div
                  key={c.id}
                  className={`flex flex-col rounded-xl border p-4 transition-colors ${
                    isSel ? a.selected : `border-gray-800 bg-gray-900 ${a.ring}`
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setCharityId(c.id)}
                    className="text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${a.dot}`} />
                      <span className="font-semibold">{c.name}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">{c.blurb}</p>
                  </button>
                  {c.url && (
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-2 inline-block text-xs ${a.text} hover:underline`}
                    >
                      Visit website ↗
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setCharityId(c.id)}
                    className="text-left mt-auto pt-3"
                  >
                    <div className={`text-lg font-bold ${a.text}`}>
                      ${(data.totals[c.id] || 0).toLocaleString()}
                    </div>
                    <div className="text-[11px] text-gray-500 uppercase tracking-wider">
                      pledged
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-gray-800 bg-gray-900 p-5"
          >
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Make a pledge to{" "}
              <span className={accent.text}>{selected.name}</span>
            </h2>

            <label className="block text-sm text-gray-300 mb-1.5">Your name</label>
            <input
              value={donor}
              onChange={(e) => setDonor(e.target.value)}
              placeholder="e.g. Alex"
              maxLength={60}
              className="w-full rounded-lg bg-gray-950 border border-gray-700 px-3 py-2.5 mb-4 outline-none focus:border-gray-500"
            />

            <label className="block text-sm text-gray-300 mb-1.5">
              Amount (USD)
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {QUICK_AMOUNTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(String(q))}
                  className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                    amount === String(q)
                      ? `${accent.selected} ${accent.text}`
                      : "border-gray-700 text-gray-300 hover:border-gray-500"
                  }`}
                >
                  ${q}
                </button>
              ))}
            </div>
            <div className="relative mb-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                inputMode="decimal"
                placeholder="50"
                className="w-full rounded-lg bg-gray-950 border border-gray-700 pl-7 pr-3 py-2.5 outline-none focus:border-gray-500"
              />
            </div>

            {error && <div className="text-sm text-red-400 mb-3">{error}</div>}
            {justGave && (
              <div className="text-sm text-green-400 mb-3">
                Thanks for your pledge! 💛
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={`w-full rounded-lg py-2.5 font-semibold text-white transition-colors disabled:opacity-60 ${accent.button}`}
            >
              {submitting
                ? "Pledging…"
                : `Pledge${
                    amount ? ` $${Number(amount).toLocaleString()}` : ""
                  } to ${selected.name}`}
            </button>
            <p className="text-[11px] text-gray-500 mt-3 text-center">
              This is a promise to donate — nothing is charged.
            </p>
          </form>
        </section>

        <aside className="lg:sticky lg:top-24 h-fit">
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 lg:h-[calc(100vh-8rem)]">
            <DonationHistory
              donations={data.donations}
              grandTotal={data.grandTotal}
            />
          </div>
        </aside>
      </main>
    </div>
  );
}
