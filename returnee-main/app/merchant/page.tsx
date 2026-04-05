"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { ReturnQr } from "@/components/return-qr";
import { StatusBadge } from "@/components/status-badge";
import type { PublicReturnRecord } from "@/lib/types";

function getExplorerUrl(hash: string) {
  return `https://test.bithomp.com/explorer/${hash}`;
}

export default function MerchantPage() {
  const [code, setCode] = useState("");
  const [item, setItem] = useState<PublicReturnRecord | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryCode = params.get("code") ?? "";
    setCode(queryCode);

    if (queryCode) {
      void lookupReturn(queryCode);
    }
  }, []);

  async function lookupReturn(returnQrCode: string) {
    setIsLookingUp(true);
    setError("");
    setItem(null);

    try {
      const response = await fetch("/api/merchant/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returnQrCode,
        }),
      });
      const payload = (await response.json()) as PublicReturnRecord | { error: string };
      if (!response.ok) {
        throw new Error("error" in payload ? payload.error : "Failed to find return");
      }
      if (!("id" in payload)) {
        throw new Error("Failed to find return");
      }
      setItem(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to find return");
    } finally {
      setIsLookingUp(false);
    }
  }

  async function onLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void lookupReturn(code);
  }

  async function confirmReceipt() {
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/merchant/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnQrCode: code }),
      });
      const payload = (await response.json()) as PublicReturnRecord | { error: string };
      if (!response.ok) {
        throw new Error("error" in payload ? payload.error : "Failed to confirm merchant scan");
      }
      if (!("id" in payload)) {
        throw new Error("Failed to confirm merchant scan");
      }
      setItem(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to confirm merchant scan");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="page-shell page-stack page-enter">
      <div className="panel panel-hero">
        <div className="workspace-intro">
          <div>
            <p className="eyebrow">Merchant scan</p>
            <h1 className="workspace-title">Scan. Verify. Release.</h1>
          </div>
          <p className="workspace-copy muted">Scan the return QR code and verify receipt before releasing the refund.</p>
        </div>
      </div>

      <section className="panel">
        <div className="section-head">
          <div>
            <p className="section-label">Merchant handoff</p>
            <h2 className="section-title">Verify package receipt</h2>
          </div>
        </div>
        <form className="form-grid editorial-form" onSubmit={onLookup}>
          <label>
            Return QR Code
            <input
              required
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
          </label>
          <button className="btn btn-secondary" disabled={isLookingUp} type="submit">
            {isLookingUp ? "Finding..." : "Find Return"}
          </button>
        </form>
        {error && <p className="alert alert-error">{error}</p>}
        {item && (
          <div className="detail-grid merchant-detail-grid">
            <section className="panel panel-quiet">
              <p className="section-label">Return record</p>
              <div className="merchant-qr-wrap">
                <ReturnQr code={item.returnQrCode} label="Scanned return QR" />
              </div>
              <dl className="details-grid">
                <div>
                  <dt>Return</dt>
                  <dd>{item.id.slice(0, 8)}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>
                    <StatusBadge status={item.status} />
                  </dd>
                </div>
                <div>
                  <dt>Resident</dt>
                  <dd>{item.residentName}</dd>
                </div>
                <div>
                  <dt>Apartment</dt>
                  <dd>{item.apartmentAddress}</dd>
                </div>
                <div>
                  <dt>Merchant</dt>
                  <dd>{item.merchant}</dd>
                </div>
                <div>
                  <dt>Reference ID</dt>
                  <dd>{item.destinationTag}</dd>
                </div>
              </dl>
            </section>

            <section className="panel panel-quiet">
              <p className="section-label">Release</p>
              <h2 className="section-title">Merchant approval</h2>
              <p className="muted panel-copy">
                Release only after the scanned QR matches the merchant return record.
              </p>
              {item.status === "REFUND_RELEASED" ? (
                <div className="alert alert-success">
                  Refund already released.{" "}
                  {item.escrow.finishTxHash && (
                    <a
                      className="text-link"
                      href={getExplorerUrl(item.escrow.finishTxHash)}
                      rel="noreferrer"
                      target="_blank"
                    >
                      View on XRPL Testnet
                    </a>
                  )}
                </div>
              ) : (
                <button className="btn btn-primary" disabled={isSubmitting} onClick={() => void confirmReceipt()} type="button">
                  {isSubmitting ? "Processing..." : "Merchant Scan + Refund Release"}
                </button>
              )}
            </section>
          </div>
        )}
      </section>

      <div className="actions">
        <Link className="btn btn-secondary" href="/">
          Back to home
        </Link>
      </div>
    </section>
  );
}
