"use client";
import { useEffect, useState } from "react";
import { CHARITIES } from "@/lib/charities";
import { ACCENT_CLASSES } from "@/lib/colors";
import { useDonations } from "@/lib/useDonations";
import DonationHistory from "@/components/DonationHistory";
import TabNav from "@/components/TabNav";

const QUICK_AMOUNTS = [50, 100, 200];
const MIN_PLEDGE = 50;

export default function Home() {
  const { data, refresh } = useDonations();

  // Visitors enter their name once, up front; we remember it on their device
  // so every pledge is attributed to them without retyping.
  const [donorName, setDonorName] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");

  const [charityId, setCharityId] = useState<string>(CHARITIES[0].id);
  const [amount, setAmount] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justGave, setJustGave] = useState(false);

  const selected = CHARITIES.find((c) => c.id === charityId) ?? CHARITIES[0];
  const accent = ACCENT_CLASSES[selected.accent];

  useEffect(() => {
    try {
      const saved = localStorage.getItem("donorName");
      if (saved) setDonorName(saved);
    } catch {}
  }, []);

  function confirmName(e: React.FormEvent) {
    e.preventDefault();
    const n = nameInput.trim();
    if (!n) return;
    setDonorName(n);
    try {
      localStorage.setItem("donorName", n);
    } catch {}
  }

  function changeName() {
    setDonorName(null);
    setNameInput("");
    try {
      localStorage.removeItem("donorName");
    } catch {}
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!donorName) return;

    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt < MIN_PLEDGE)
      return setError(`The minimum pledge is $${MIN_PLEDGE}.`);

    setSubmitting(true);
    try {
      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donor: donorName, charityId, amount: amt }),
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

      {!donorName ? (
        // Name gate — shown until the visitor tells us who they are.
        <div className="flex items-center justify-center px-4 py-16">
          <form
            onSubmit={confirmName}
            className="w-full max-w-sm rounded-2xl border border-gray-800 bg-gray-900 p-6"
          >
            <h2 className="text-lg font-bold mb-1">Welcome! 🎉</h2>
              <p className="text-sm text-gray-400 mb-5">
              Enter your first and last name to start pledging.
            </p>
            <label className="block text-sm text-gray-300 mb-1.5">
              Your name (first and last)
            </label>
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. Alex Smith"
              maxLength={60}
              autoFocus
              className="w-full rounded-lg bg-gray-950 border border-gray-700 px-3 py-2.5 mb-3 outline-none focus:border-gray-500"
            />
            <button
              type="submit"
              disabled={!nameInput.trim()}
              className="w-full rounded-lg py-2.5 font-semibold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50"
            >
              Continue
            </button>
          </form>
        </div>
      ) : (
        <>
          <div className="border-b border-gray-800 bg-gray-900/40">
            <div className="max-w-6xl mx-auto px-4 py-3">
              <p className="text-sm text-gray-400 max-w-xl">
                Promise a donation to a charity — no money is charged now,
                you&apos;re pledging to pay later. Share this link and pledges
                show up here live.
              </p>
            </div>
          </div>

          <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
            <section>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Choose a charity
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {CHARITIES.map((c) => {
                  const a = ACCENT_CLASSES[c.accent];
                  const isSel = c.id === charityId;
                  return (
                    <div
                      key={c.id}
                      className={`relative flex flex-col rounded-xl border p-4 transition-colors ${
                        isSel ? a.selected : `border-gray-800 bg-gray-900 ${a.ring}`
                      }`}
                    >
                      {c.url && (
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className={`absolute top-2 right-2 z-10 text-[11px] font-medium ${a.text} hover:underline px-1.5 py-0.5`}
                        >
                          Website ↗
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setCharityId(c.id)}
                        className="text-left"
                      >
                        <div className="flex items-center gap-2 pr-16">
                          <span className={`w-2.5 h-2.5 rounded-full ${a.dot}`} />
                          <span className="font-semibold">{c.name}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1.5">{c.blurb}</p>
                      </button>
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

                <div className="text-sm text-gray-300 mb-4">
                  Pledging as{" "}
                  <span className="font-semibold text-white">{donorName}</span>
                  <button
                    type="button"
                    onClick={changeName}
                    className="ml-2 text-xs text-gray-500 hover:text-gray-300 underline"
                  >
                    change
                  </button>
                </div>

                <label className="block text-sm text-gray-300 mb-1.5">
                  Amount (USD) — minimum $50
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
                    onChange={(e) =>
                      setAmount(e.target.value.replace(/[^0-9.]/g, ""))
                    }
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
              <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 h-[60vh] lg:h-[calc(100vh-8rem)]">
                <DonationHistory
                  donations={data.donations}
                  grandTotal={data.grandTotal}
                />
              </div>
            </aside>
          </main>
        </>
      )}
    </div>
  );
}
