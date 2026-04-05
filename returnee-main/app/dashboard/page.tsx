"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { StatusBadge } from "@/components/status-badge";
import type { PublicReturnRecord } from "@/lib/types";

type ReturnListPayload = { items: PublicReturnRecord[] };

function getExplorerUrl(hash: string) {
  return `https://test.bithomp.com/explorer/${hash}`;
}

function getConfirmationHash(item: PublicReturnRecord) {
  if (item.status === "REFUND_RELEASED" && item.escrow.finishTxHash) {
    return item.escrow.finishTxHash;
  }

  return item.escrow.createTxHash;
}

export default function DashboardPage() {
  const [items, setItems] = useState<PublicReturnRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    residentName: "",
    apartmentAddress: "",
    merchant: "",
    returnQrCode: "",
    amountXrp: "",
  });

  async function loadReturns() {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/returns");
      const payload = (await response.json()) as ReturnListPayload;
      if (!response.ok) {
        throw new Error("Failed to load returns");
      }
      setItems(payload.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load returns");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadReturns();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          residentName: form.residentName,
          apartmentAddress: form.apartmentAddress,
          merchant: form.merchant,
          returnQrCode: form.returnQrCode,
          amountXrp: Number(form.amountXrp),
        }),
      });
      const payload = (await response.json()) as PublicReturnRecord | { error: string };
      if (!response.ok) {
        throw new Error("error" in payload ? payload.error : "Failed to create return");
      }
      setForm({
        residentName: "",
        apartmentAddress: "",
        merchant: "",
        returnQrCode: "",
        amountXrp: "",
      });
      await loadReturns();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create return");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteReturn(returnId: string) {
    if (
      !window.confirm(
        "Delete this return permanently? This cannot be undone. On-chain escrows are not cancelled automatically.",
      )
    ) {
      return;
    }
    setDeletingId(returnId);
    setError("");
    try {
      const response = await fetch(`/api/returns/${returnId}`, { method: "DELETE" });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Failed to delete return");
      }
      await loadReturns();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete return");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="page-shell page-stack page-enter">
      <section className="panel panel-hero">
        <div className="workspace-intro">
          <div>
            <p className="eyebrow">Resident workspace</p>
            <h1 className="workspace-title">Create. Track. Finish.</h1>
          </div>
          <p className="workspace-copy muted">Everything in one place.</p>
        </div>
        <div className="trust-columns workspace-metrics">
          <div>
            <p className="metric-value">Simple</p>
            <p className="metric-label">Fast setup</p>
          </div>
          <div>
            <p className="metric-value">Seamless</p>
            <p className="metric-label">No wallet setup</p>
          </div>
          <div>
            <p className="metric-value">Verified</p>
            <p className="metric-label">Release after merchant scan</p>
          </div>
        </div>
      </section>

      <div className="workspace-grid">
        <section className="panel">
          <div className="section-head">
            <div>
              <p className="section-label">New return</p>
              <h2 className="section-title">Create request</h2>
            </div>
          </div>
          <div className="alert alert-success">
            Returnee service fee: $5 for up to 5 packages.
          </div>
          <form className="form-grid editorial-form" onSubmit={onSubmit}>
            <label>
              Resident Name
              <input
                required
                value={form.residentName}
                onChange={(event) => setForm({ ...form, residentName: event.target.value })}
              />
            </label>
            <label>
              Apartment Address
              <input
                required
                value={form.apartmentAddress}
                onChange={(event) => setForm({ ...form, apartmentAddress: event.target.value })}
              />
            </label>
            <label>
              Merchant
              <input
                required
                value={form.merchant}
                onChange={(event) => setForm({ ...form, merchant: event.target.value })}
              />
            </label>
            <label>
              Return QR Code
              <input
                required
                value={form.returnQrCode}
                onChange={(event) => setForm({ ...form, returnQrCode: event.target.value })}
              />
            </label>
            <label>
              Refund Amount
              <input
                min={1}
                required
                type="number"
                value={form.amountXrp}
                onChange={(event) => setForm({ ...form, amountXrp: event.target.value })}
              />
            </label>
            <button className="btn btn-primary" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Creating..." : "Create Return"}
            </button>
          </form>
        </section>

        <section className="panel">
          <div className="section-head">
            <div>
              <p className="section-label">Active returns</p>
              <h2 className="section-title">Returns</h2>
            </div>
            <button className="btn btn-secondary" onClick={() => void loadReturns()} type="button">
              Refresh
            </button>
          </div>
          {error && <p className="alert alert-error">{error}</p>}
          {isLoading ? (
            <p className="muted empty-state">Loading returns...</p>
          ) : items.length === 0 ? (
            <p className="muted empty-state">No returns yet.</p>
          ) : (
            <div className="table-shell">
              <table className="table data-table">
                <thead>
                  <tr>
                    <th>Reference ID</th>
                    <th>Resident</th>
                    <th>Return QR</th>
                    <th>Status</th>
                    <th>Confirmation ID</th>
                    <th></th>
                    <th>Explorer</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      {(() => {
                        const confirmationHash = getConfirmationHash(item);

                        return (
                          <>
                            <td data-label="Reference ID">{item.destinationTag}</td>
                            <td data-label="Resident">{item.residentName}</td>
                            <td data-label="Return QR">{item.returnQrCode}</td>
                            <td data-label="Status">
                              <StatusBadge status={item.status} />
                            </td>
                            <td data-label="Confirmation ID">{confirmationHash.slice(0, 12)}...</td>
                            <td data-label="Action">
                              <Link className="btn btn-secondary btn-small" href={`/returns/${item.id}`}>
                                View
                              </Link>
                            </td>
                            <td className="table-link-cell" data-label="Explorer">
                              <a
                                className="text-link"
                                href={getExplorerUrl(confirmationHash)}
                                rel="noreferrer"
                                target="_blank"
                              >
                                View on XRPL Testnet
                              </a>
                            </td>
                            <td data-label="Remove">
                              <button
                                className="btn btn-secondary btn-small btn-danger"
                                disabled={deletingId === item.id}
                                onClick={() => void deleteReturn(item.id)}
                                type="button"
                              >
                                {deletingId === item.id ? "…" : "Delete"}
                              </button>
                            </td>
                          </>
                        );
                      })()}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
