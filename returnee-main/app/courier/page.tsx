"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ReturnQr } from "@/components/return-qr";
import { StatusBadge } from "@/components/status-badge";
import type { PublicReturnRecord } from "@/lib/types";

type PendingPayload = { items: PublicReturnRecord[] };

type CourierGroup = {
  key: string;
  merchant: string;
  apartmentAddress: string;
  items: PublicReturnRecord[];
};

function groupCourierItems(items: PublicReturnRecord[]): CourierGroup[] {
  const groups = new Map<string, CourierGroup>();

  for (const item of items) {
    const key = `${item.merchant}::${item.apartmentAddress}`;
    const existing = groups.get(key);

    if (existing) {
      existing.items.push(item);
      continue;
    }

    groups.set(key, {
      key,
      merchant: item.merchant,
      apartmentAddress: item.apartmentAddress,
      items: [item],
    });
  }

  return Array.from(groups.values());
}

export default function CourierPage() {
  const [items, setItems] = useState<PublicReturnRecord[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeId, setActiveId] = useState("");

  async function loadQueue() {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/courier/pending");
      const payload = (await response.json()) as PendingPayload;
      if (!response.ok) {
        throw new Error("Failed to load courier queue");
      }
      setItems(payload.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load courier queue");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadQueue();
  }, []);

  const groupedItems = groupCourierItems(items);

  async function confirmPickup(id: string) {
    setActiveId(id);
    setError("");
    try {
      const response = await fetch(`/api/returns/${id}/pickup`, { method: "POST" });
      const payload = (await response.json()) as PublicReturnRecord | { error: string };
      if (!response.ok) {
        throw new Error("error" in payload ? payload.error : "Failed to confirm pickup");
      }
      await loadQueue();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to confirm pickup");
    } finally {
      setActiveId("");
    }
  }

  async function confirmMerchantScan(returnQrCode: string, id: string) {
    setActiveId(id);
    setError("");
    try {
      const response = await fetch("/api/courier/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnQrCode }),
      });
      const payload = (await response.json()) as PublicReturnRecord | { error: string };
      if (!response.ok) {
        throw new Error("error" in payload ? payload.error : "Failed to verify merchant scan");
      }
      await loadQueue();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify merchant scan");
    } finally {
      setActiveId("");
    }
  }

  return (
    <section className="page-shell page-stack page-enter">
      <div className="panel panel-hero">
        <div className="section-head">
          <div>
            <p className="eyebrow">Courier operations</p>
            <h1 className="workspace-title">Pickup. Verify. Release.</h1>
          </div>
          <button className="btn btn-secondary" onClick={() => void loadQueue()} type="button">
            Refresh Queue
          </button>
        </div>
        <p className="workspace-copy muted">The courier operates the app. The merchant scans the QR in person, and the courier confirms that scan here.</p>
      </div>

      <section className="panel">
        <div className="section-head">
          <div>
            <p className="section-label">Courier queue</p>
            <h2 className="section-title">Pickup and merchant verification</h2>
          </div>
        </div>
        {error && <p className="alert alert-error">{error}</p>}

        {isLoading ? (
          <p className="muted empty-state">Loading queue...</p>
        ) : items.length === 0 ? (
          <p className="muted empty-state">No returns currently waiting for courier action.</p>
        ) : (
          <div className="stack">
            {groupedItems.map((group) => (
              <section className="panel panel-quiet" key={group.key}>
                <div className="section-head">
                  <div>
                    <p className="section-label">Destination group</p>
                    <h3 className="section-title">{group.merchant}</h3>
                  </div>
                  <p className="muted">{group.items.length} package{group.items.length === 1 ? "" : "s"}</p>
                </div>
                <p className="muted panel-copy">{group.apartmentAddress}</p>
                <div className="table-shell">
                  <table className="table data-table">
                    <thead>
                      <tr>
                        <th>Return</th>
                        <th>Resident</th>
                        <th>Return QR</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.items.map((item) => (
                        <tr key={item.id}>
                          <td data-label="Return">{item.id.slice(0, 8)}</td>
                          <td data-label="Resident">{item.residentName}</td>
                          <td data-label="Return QR">
                            <ReturnQr code={item.returnQrCode} compact label="Scan code" />
                          </td>
                          <td data-label="Amount">${item.amountXrp.toFixed(2)}</td>
                          <td data-label="Status">
                            <StatusBadge status={item.status} />
                          </td>
                          <td data-label="Action">
                            {item.status === "IN_BIN" ? (
                              <button
                                className="btn btn-primary btn-small"
                                disabled={activeId === item.id}
                                onClick={() => void confirmPickup(item.id)}
                                type="button"
                              >
                                {activeId === item.id ? "Confirming..." : "Confirm Pickup"}
                              </button>
                            ) : (
                              <button
                                className="btn btn-primary btn-small"
                                disabled={activeId === item.id}
                                onClick={() => void confirmMerchantScan(item.returnQrCode, item.id)}
                                type="button"
                              >
                                {activeId === item.id
                                  ? "Processing..."
                                  : "Merchant Scan Verified + Release Refund"}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
          </div>
        )}
      </section>

      <div className="actions">
        <Link className="btn btn-secondary" href="/dashboard">
          Back to dashboard
        </Link>
      </div>
    </section>
  );
}
