import type { ReturnStatus } from "@/lib/types";

const labelByStatus: Record<ReturnStatus, string> = {
  CREATED: "Created",
  ESCROW_LOCKED: "Refund Hold Active",
  IN_BIN: "In Bin",
  PICKED_UP: "With Courier",
  REFUND_RELEASED: "Refund Released",
};

export function StatusBadge({ status }: { status: ReturnStatus }) {
  return (
    <span className={`badge badge-${status.toLowerCase()}`}>
      <span className="badge-dot" aria-hidden="true" />
      {labelByStatus[status] ?? status}
    </span>
  );
}
