"use client";
import { Donation } from "@/lib/types";
import { classesForCharity } from "@/lib/colors";

interface Props {
  donations: Donation[];
  grandTotal: number;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function DonationHistory({ donations, grandTotal }: Props) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Donation History
        </h2>
        <span
          title="Updates automatically"
          className="flex items-center gap-1.5 text-xs text-gray-500"
        >
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Live
        </span>
      </div>

      <div className="mb-4 rounded-lg bg-gray-800/60 border border-gray-700 px-4 py-3">
        <div className="text-xs text-gray-400 uppercase tracking-wider">
          Total pledged
        </div>
        <div className="text-2xl font-bold text-green-400">
          ${grandTotal.toLocaleString()}
        </div>
        <div className="text-xs text-gray-500 mt-0.5">
          {donations.length} {donations.length === 1 ? "donation" : "donations"}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto -mr-2 pr-2 min-h-0">
        {donations.length === 0 ? (
          <div className="text-gray-600 text-sm py-8 text-center">
            No donations yet. Be the first!
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {donations.map((d) => (
              <li
                key={d.id}
                className="rounded-lg bg-gray-800/40 border border-gray-800 px-3 py-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-white truncate">
                    {d.donor}
                  </span>
                  <span className="font-bold text-green-400 shrink-0">
                    ${d.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <span className="flex items-center gap-1.5 text-xs text-gray-400 truncate">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        classesForCharity(d.charityId).dot
                      }`}
                    />
                    {d.charityName}
                  </span>
                  <span className="text-xs text-gray-600 shrink-0">
                    {timeAgo(d.timestamp)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
