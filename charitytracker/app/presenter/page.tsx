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
  const leader = topDonors[0];
  const runnersUp = topDonors.slice(1);

  const maxTotal = Math.max(1, ...CHARITIES.map((c) => totals[c.id] || 0));

  return (
    <div className="min-h-screen flex flex-col">
      <TabNav />
      {/* Header with running total */}
      <header className="border-b border-gray-800 px-8 py-6 flex items-center justify-between gap-4">
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
          <div className="text-5xl font-extrabold text-green-400 tabular-nums break-all">
            {money(grandTotal)}
          </div>
          <div className="text-sm text-gray-500">
            {donations.length} {donations.length === 1 ? "donation" : "donations"}
          </div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-8">
        {/* Top donors (featured) + charity totals */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <section className="rounded-2xl border border-gray-800 bg-gray-900 p-8">
            <div className="text-xs uppercase tracking-widest text-gray-500 mb-4">
              🏆 Top donors
            </div>
            {!leader ? (
              <div className="text-gray-600 text-2xl py-8">
                Waiting for the first donation…
              </div>
            ) : (
              <>
                {/* Leader */}
                <div className="mb-6">
                  <div className="text-5xl font-extrabold break-words">
                    {leader.donor}
                  </div>
                  <div className="text-6xl font-extrabold text-green-400 tabular-nums break-all mt-1">
                    {money(leader.total)}
                  </div>
                </div>

                {/* Runners-up */}
                {runnersUp.length > 0 && (
                  <ol className="flex flex-col gap-3 border-t border-gray-800 pt-5">
                    {runnersUp.map((d, i) => (
                      <li
                        key={d.donor}
                        className="flex items-center justify-between gap-4 text-2xl"
                      >
                        <span className="flex items-center gap-3 min-w-0">
                          <span className="w-7 text-center font-bold text-gray-500">
                            {i + 2}
                          </span>
                          <span className="font-semibold truncate">{d.donor}</span>
                        </span>
                        <span className="font-bold text-green-400 tabular-nums shrink-0">
                          {money(d.total)}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </>
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
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <span className="flex items-center gap-2 font-semibold min-w-0">
                        <span className={`w-3 h-3 rounded-full shrink-0 ${color?.dot}`} />
                        <span className="truncate">{c.name}</span>
                      </span>
                      <span
                        className={`text-xl font-bold tabular-nums shrink-0 ${color?.text}`}
                      >
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

        {/* Most recent + full history */}
        <div className="flex flex-col gap-6 min-h-0">
          <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
            <div className="text-xs uppercase tracking-widest text-gray-500 mb-3">
              Most recent donation
            </div>
            {mostRecent ? (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-2xl font-bold truncate">
                    {mostRecent.donor}
                  </div>
                  <div
                    className={`flex items-center gap-2 text-sm ${
                      classesForCharity(mostRecent.charityId).text
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        classesForCharity(mostRecent.charityId).dot
                      }`}
                    />
                    <span className="truncate">{mostRecent.charityName}</span>
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-green-400 tabular-nums shrink-0">
                  {money(mostRecent.amount)}
                </div>
              </div>
            ) : (
              <div className="text-gray-600">Waiting for the first donation…</div>
            )}
          </section>

          <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6 flex-1 flex flex-col min-h-0">
            <div className="text-xs uppercase tracking-widest text-gray-500 mb-4">
              Donation history
            </div>
            <div className="flex-1 overflow-y-auto -mr-2 pr-2 min-h-0 max-h-[50vh]">
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
