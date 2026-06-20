"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CHARITIES } from "@/lib/charities";
import { useDonations } from "@/lib/useDonations";
import { Donation } from "@/lib/types";

function money(n: number) {
  return `$${n.toLocaleString()}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString();
}

export default function Admin() {
  const { data, refresh } = useDonations(4000);
  const { donations, grandTotal } = data;

  // --- Passcode gate ---------------------------------------------------------
  const [authCode, setAuthCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [checking, setChecking] = useState(true);
  const [codeInput, setCodeInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  const verify = useCallback(async (code: string, fromForm: boolean) => {
    setChecking(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const body = await res.json();
      setConfigured(Boolean(body.configured));
      if (body.ok) {
        setAuthCode(code);
        setUnlocked(true);
        try {
          localStorage.setItem("adminCode", code);
        } catch {}
      } else {
        setUnlocked(false);
        if (fromForm) setAuthError("Incorrect passcode.");
      }
    } catch {
      if (fromForm) setAuthError("Network error — please try again.");
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    let saved = "";
    try {
      saved = localStorage.getItem("adminCode") || "";
    } catch {}
    verify(saved, false);
  }, [verify]);

  function lock() {
    try {
      localStorage.removeItem("adminCode");
    } catch {}
    setAuthCode("");
    setUnlocked(false);
    setCodeInput("");
  }

  // --- Editing ---------------------------------------------------------------
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDonor, setEditDonor] = useState("");
  const [editCharity, setEditCharity] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit(d: Donation) {
    setError(null);
    setEditingId(d.id);
    setEditDonor(d.donor);
    setEditCharity(d.charityId);
    setEditAmount(String(d.amount));
  }

  function cancelEdit() {
    setEditingId(null);
    setError(null);
  }

  async function saveEdit(id: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/donations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-code": authCode },
        body: JSON.stringify({
          id,
          donor: editDonor,
          charityId: editCharity,
          amount: Number(editAmount),
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error || "Failed to save.");
        return;
      }
      setEditingId(null);
      await refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteOne(d: Donation) {
    if (!confirm(`Delete ${d.donor}'s ${money(d.amount)} pledge to ${d.charityName}?`))
      return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/donations?id=${encodeURIComponent(d.id)}`, {
        method: "DELETE",
        headers: { "x-admin-code": authCode },
      });
      if (!res.ok) {
        const body = await res.json();
        setError(body.error || "Failed to delete.");
        return;
      }
      await refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function clearAll() {
    if (
      !confirm(
        `Permanently delete ALL ${donations.length} donations? This cannot be undone.`
      )
    )
      return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/donations?all=true", {
        method: "DELETE",
        headers: { "x-admin-code": authCode },
      });
      if (!res.ok) {
        const body = await res.json();
        setError(body.error || "Failed to clear.");
        return;
      }
      await refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  // --- Locked screen ---------------------------------------------------------
  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-gray-800 bg-gray-900 p-6">
          <h1 className="text-xl font-bold flex items-center gap-2 mb-1">
            <span>🔒</span> Developer View
          </h1>
          <p className="text-sm text-gray-400 mb-5">
            Enter the passcode to manage donations.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              verify(codeInput, true);
            }}
          >
            <input
              type="password"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="Passcode"
              autoFocus
              className="w-full rounded-lg bg-gray-950 border border-gray-700 px-3 py-2.5 mb-3 outline-none focus:border-gray-500"
            />
            {authError && (
              <div className="text-sm text-red-400 mb-3">{authError}</div>
            )}
            {!configured && (
              <div className="text-xs text-yellow-300/90 mb-3">
                No passcode is set yet. Add an{" "}
                <code className="bg-gray-800 px-1 rounded">ADMIN_CODE</code>{" "}
                environment variable in Vercel to enable protection.
              </div>
            )}
            <button
              type="submit"
              disabled={checking}
              className="w-full rounded-lg py-2.5 font-semibold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-60"
            >
              {checking ? "Checking…" : "Unlock"}
            </button>
          </form>
          <Link
            href="/"
            className="block text-center text-xs text-gray-600 hover:text-gray-400 mt-4"
          >
            ← Back to donation page
          </Link>
        </div>
      </div>
    );
  }

  // --- Unlocked admin --------------------------------------------------------
  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-800 bg-gray-900/60 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span>🛠️</span> Developer View
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {donations.length} donations · {money(grandTotal)} pledged
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white transition-colors"
            >
              Donation page
            </Link>
            <Link
              href="/presenter"
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white transition-colors"
            >
              Presenter
            </Link>
            <button
              onClick={clearAll}
              disabled={busy || donations.length === 0}
              className="text-xs px-3 py-1.5 rounded-lg border border-red-900 bg-red-950/50 text-red-300 hover:bg-red-900/50 transition-colors disabled:opacity-40"
            >
              Clear all
            </button>
            <button
              onClick={lock}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white transition-colors"
            >
              Lock
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {!configured && (
          <div className="mb-4 rounded-lg border border-yellow-900/60 bg-yellow-950/30 px-4 py-2.5 text-xs text-yellow-300/90">
            ⚠️ No passcode is set, so this page is currently open to anyone. Add an{" "}
            <code className="bg-gray-800 px-1 rounded">ADMIN_CODE</code>{" "}
            environment variable in Vercel to lock it.
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-900 bg-red-950/40 px-4 py-2.5 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-900 text-gray-400 text-left">
                <th className="px-4 py-3 font-medium">Donor</th>
                <th className="px-4 py-3 font-medium">Charity</th>
                <th className="px-4 py-3 font-medium text-right">Amount</th>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {donations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-600">
                    No donations yet.
                  </td>
                </tr>
              ) : (
                donations.map((d) => {
                  const isEditing = editingId === d.id;
                  return (
                    <tr
                      key={d.id}
                      className="border-t border-gray-800 bg-gray-950/40 align-middle"
                    >
                      {isEditing ? (
                        <>
                          <td className="px-4 py-2">
                            <input
                              value={editDonor}
                              onChange={(e) => setEditDonor(e.target.value)}
                              className="w-full rounded bg-gray-900 border border-gray-700 px-2 py-1.5 outline-none focus:border-gray-500"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <select
                              value={editCharity}
                              onChange={(e) => setEditCharity(e.target.value)}
                              className="w-full rounded bg-gray-900 border border-gray-700 px-2 py-1.5 outline-none focus:border-gray-500"
                            >
                              {CHARITIES.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            <input
                              value={editAmount}
                              onChange={(e) =>
                                setEditAmount(e.target.value.replace(/[^0-9.]/g, ""))
                              }
                              inputMode="decimal"
                              className="w-24 rounded bg-gray-900 border border-gray-700 px-2 py-1.5 text-right outline-none focus:border-gray-500 ml-auto block"
                            />
                          </td>
                          <td className="px-4 py-2 text-gray-500 text-xs">
                            {formatDate(d.timestamp)}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => saveEdit(d.id)}
                                disabled={busy}
                                className="text-xs px-2.5 py-1.5 rounded bg-green-600 hover:bg-green-500 text-white disabled:opacity-50"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                disabled={busy}
                                className="text-xs px-2.5 py-1.5 rounded border border-gray-700 text-gray-300 hover:border-gray-500"
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 font-medium">{d.donor}</td>
                          <td className="px-4 py-3 text-gray-300">{d.charityName}</td>
                          <td className="px-4 py-3 text-right font-bold text-green-400 tabular-nums">
                            {money(d.amount)}
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">
                            {formatDate(d.timestamp)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => startEdit(d)}
                                disabled={busy}
                                className="text-xs px-2.5 py-1.5 rounded border border-gray-700 text-gray-300 hover:border-gray-500 disabled:opacity-50"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteOne(d)}
                                disabled={busy}
                                className="text-xs px-2.5 py-1.5 rounded border border-red-900 bg-red-950/40 text-red-300 hover:bg-red-900/50 disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
