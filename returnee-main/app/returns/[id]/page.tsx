"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ReturnQr } from "@/components/return-qr";
import { StatusBadge } from "@/components/status-badge";
import type { PublicReturnRecord } from "@/lib/types";

type MeResponse = {
  user: { role: "resident" | "courier" | "admin" } | null;
};

function getExplorerUrl(hash: string) {
  return `https://test.bithomp.com/explorer/${hash}`;
}

export default function ReturnDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const [item, setItem] = useState<PublicReturnRecord | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [role, setRole] = useState<"resident" | "courier" | "admin" | null>(null);

  const canOpenCourierConsole = role === "courier" || role === "admin";

  async function load() {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/returns/${id}`);
      const payload = (await response.json()) as PublicReturnRecord | { error: string };
      if (!response.ok) {
        throw new Error("error" in payload ? payload.error : "Failed to load return");
      }
      if (!("id" in payload)) {
        throw new Error("Failed to load return");
      }
      setItem(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load return");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    async function loadMe() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const payload = (await response.json()) as MeResponse;
        setRole(payload.user?.role ?? null);
      } catch {
        setRole(null);
      }
    }
    void loadMe();
  }, []);

  async function markInBin() {
    setIsUpdating(true);
    setError("");
    try {
      const response = await fetch(`/api/returns/${id}/dropoff`, { method: "POST" });
      const payload = (await response.json()) as PublicReturnRecord | { error: string };
      if (!response.ok) {
        throw new Error("error" in payload ? payload.error : "Failed to mark in bin");
      }
      if (!("id" in payload)) {
        throw new Error("Failed to mark in bin");
      }
      setItem(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark in bin");
    } finally {
      setIsUpdating(false);
    }
  }

  async function deleteReturn() {
    if (
      !window.confirm(
        "Delete this return permanently? This cannot be undone. On-chain escrows are not cancelled automatically.",
      )
    ) {
      return;
    }
    setIsDeleting(true);
    setError("");
    try {
      const response = await fetch(`/api/returns/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Failed to delete return");
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete return");
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <section className="page-shell page-enter">
        <p className="muted empty-state">Loading return details...</p>
      </section>
    );
  }

  if (!item) {
    return (
      <section className="page-shell page-enter">
        <div className="panel">
          <p className="alert alert-error">{error || "Return not found"}</p>
          <Link className="btn btn-secondary" href="/dashboard">
            Back to dashboard
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-shell page-stack page-enter">
      <div className="panel panel-hero">
        <div className="section-head">
          <div>
            <p className="eyebrow">Return detail</p>
            <h1 className="workspace-title">Return {item.id.slice(0, 8)}</h1>
          </div>
          <StatusBadge status={item.status} />
        </div>
        <p className="workspace-copy muted">
          Track the package handoff from refund hold through lobby dropoff, courier pickup, and merchant verification.
        </p>
      </div>

      {error && <p className="alert alert-error">{error}</p>}

      <div className="detail-grid">
        <section className="panel">
          <p className="section-label">Package record</p>
          <dl className="details-grid">
            <div>
              <dt>Resident</dt>
              <dd>{item.residentName}</dd>
            </div>
            <div>
              <dt>Merchant</dt>
              <dd>{item.merchant}</dd>
            </div>
            <div>
              <dt>Apartment Address</dt>
              <dd>{item.apartmentAddress}</dd>
            </div>
            <div>
              <dt>Return QR Code</dt>
              <dd>
                <ReturnQr code={item.returnQrCode} compact />
              </dd>
            </div>
            <div>
              <dt>Refund Amount</dt>
              <dd>${item.amountXrp.toFixed(2)}</dd>
            </div>
            <div>
              <dt>Reference ID</dt>
              <dd>{item.destinationTag}</dd>
            </div>
          </dl>
        </section>

        <section className="panel">
          <p className="section-label">Settlement progress</p>
          <dl className="details-grid">
            <div>
              <dt>Hold Confirmation</dt>
              <dd>
                {item.escrow.createTxHash}
                <a
                  className="text-link detail-link"
                  href={getExplorerUrl(item.escrow.createTxHash)}
                  rel="noreferrer"
                  target="_blank"
                >
                  View on XRPL Testnet
                </a>
              </dd>
            </div>
            <div>
              <dt>Refund Confirmation</dt>
              <dd>
                {item.escrow.finishTxHash
                  ?? (item.status === "PICKED_UP"
                    ? "Pending merchant QR confirmation"
                    : "Pending courier pickup verification")}
                {item.escrow.finishTxHash && (
                  <a
                    className="text-link detail-link"
                    href={getExplorerUrl(item.escrow.finishTxHash)}
                    rel="noreferrer"
                    target="_blank"
                  >
                    View on XRPL Testnet
                  </a>
                )}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="panel">
        <div className="section-head">
          <div>
            <p className="section-label">Next action</p>
            <h2 className="section-title">Advance the record only after the physical handoff.</h2>
          </div>
        </div>
        <p className="muted panel-copy">
          Residents confirm the lobby dropoff first. Courier pickup moves the return into merchant verification.
        </p>
        {item.status === "ESCROW_LOCKED" && (
          <button
            className="btn btn-primary"
            disabled={isUpdating}
            onClick={() => void markInBin()}
          >
            {isUpdating ? "Updating..." : "Package Dropped in Bin"}
          </button>
        )}
        {item.status === "PICKED_UP" && (
          <div className="alert alert-success">
            Package is with the courier. Merchant confirmation using the return QR code will release the refund.
          </div>
        )}
      </section>

      <section className="panel">
        <div className="section-head">
          <div>
            <p className="section-label">Actions</p>
            <h2 className="section-title">Navigate or manage this return.</h2>
          </div>
        </div>
        <div className="actions">
          <button
            className="btn btn-secondary btn-danger"
            disabled={isDeleting || isUpdating}
            onClick={() => void deleteReturn()}
            type="button"
          >
            {isDeleting ? "Deleting..." : "Delete return"}
          </button>
          <Link className="btn btn-secondary" href="/dashboard">
            Back to dashboard
          </Link>
          {canOpenCourierConsole && (
            <Link className="btn btn-secondary" href="/courier">
              Open courier console
            </Link>
          )}
        </div>
      </section>
    </section>
  );
}
