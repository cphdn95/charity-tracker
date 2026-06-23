"use client";
import { CHARITIES } from "@/lib/charities";
import { classesForCharity } from "@/lib/colors";
import TabNav from "@/components/TabNav";
import { useDonations } from "@/lib/useDonations";
import { Donation } from "@/lib/types";

function money(n: number) {
  return `$${n.toLocaleString()}`;
}

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Presenter() {
  const { data } = useDonations(2000);
  const { donations, totals, grandTotal } = data;

  const mostRecent: Donation | undefined = donations[0];

  // Top donors: sum each person's pledges, ranked by their combined total.
  const donorTotals = new Map<string, number>();
  for (const d of donations) {
    donorTotals.set(d.donor, (donorTotals.get(d.donor) || 0) + d.amount);
  }
  const topDonors = [...donorTotals.entries()]
    .map(([donor, total]) => ({ donor, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const maxTotal = Math.max(1, ...CHARITIES.map((c) => totals[c.id] || 0));

  return (
    <div className="min-h-screen flex flex-col">
      <TabNav />
      {/* Header with running total */}
      <header className="border-b border-gray-800 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-lg text-gray-300">
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            Live donations
          </span>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-widest text-gray-500">
            Total pledged
          </div>
          <div className="text-5xl font-extrabold text-green-400 tabular-nums">
            {money(grandTotal)}
          </div>
          <div className="text-sm text-gray-500">
            {donations.length} {donations.length === 1 ? "donation" : "donations"}
          </div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-8">
        {/* Most recent + charity totals */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <section className="rounded-2xl border border-gray-800 bg-gray-900 p-8">
            <div className="text-xs uppercase tracking-widest text-gray-500 mb-4">
              Most recent donation
            </div>
            {mostRecent ? (
              <div className="flex items-end justify-between gap-6">
                <div>
                  <div className="text-5xl font-extrabold mb-2">
                    {mostRecent.donor}
                  </div>
                  <div
                    className={`flex items-center gap-2 text-xl ${
                      classesForCharity(mostRecent.charityId).text
                    }`}
                  >
                    <span
                      className={`w-3 h-3 rounded-full ${
                        classesForCharity(mostRecent.charityId).dot
                      }`}
                    />
                    {mostRecent.charityName}
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    {timeAgo(mostRecent.timestamp)}
                  </div>
                </div>
                <div className="text-7xl font-extrabold text-green-400 tabular-nums">
                  {money(mostRecent.amount)}
                </div>
              </div>
            ) : (
              <div className="text-gray-600 text-2xl py-8">
                Waiting for the first donation…
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-gray-800 bg-gray-900 p-8">
            <div className="text-xs uppercase tracking-widest text-gray-500 mb-5">
              By charity
            </div>
            <div className="flex flex-col gap-5">
              {CHARITIES.map((c) => {
                const total = totals[c.id] || 0;
                const pct = Math.round((total / maxTotal) * 100);
                const color = classesForCharity(c.id);
                return (
                  <div key={c.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="flex items-center gap-2 font-semibold">
                        <span className={`w-3 h-3 rounded-full ${color?.dot}`} />
                        {c.name}
                      </span>
                      <span className={`text-xl font-bold tabular-nums ${color?.text}`}>
                        {money(total)}
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-gray-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color?.bar} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Top donors + full history */}
        <div className="flex flex-col gap-6 min-h-0">
          <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <div className="text-xs uppercase tracking-widest text-gray-500 mb-4">
              🏆 Top donors
            </div>
            {topDonors.length === 0 ? (
              <div className="text-gray-600">No donations yet.</div>
            ) : (
              <ol className="flex flex-col gap-3">
                {topDonors.map((d, i) => (
                  <li key={d.donor} className="flex items-center gap-3">
                    <span className="w-6 text-center text-lg font-bold text-gray-500">
                      {i + 1}
                    </span>
                    <span className="flex-1 min-w-0 font-semibold truncate">
                      {d.donor}
                    </span>
                    <span className="font-bold text-green-400 tabular-nums">
                      {money(d.total)}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6 flex-1 flex flex-col min-h-0">
            <div className="text-xs uppercase tracking-widest text-gray-500 mb-4">
              Donation history
            </div>
            <div className="flex-1 overflow-y-auto -mr-2 pr-2 min-h-0">
              {donations.length === 0 ? (
                <div className="text-gray-600">No donations yet.</div>
              ) : (
                <ul className="flex flex-col gap-2">
                  {donations.map((d) => (
                    <li
                      key={d.id}
                      className="flex items-center justify-between gap-3 border-b border-gray-800/60 pb-2"
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            classesForCharity(d.charityId).dot
                          }`}
                        />
                        <span className="truncate">
                          <span className="font-medium">{d.donor}</span>{" "}
                          <span className="text-gray-500 text-sm">
                            · {d.charityName}
                          </span>
                        </span>
                      </span>
                      <span className="font-bold text-green-400 tabular-nums shrink-0">
                        {money(d.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
