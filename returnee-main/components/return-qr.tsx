"use client";

import { QRCodeSVG } from "qrcode.react";

export function ReturnQr({
  code,
  label = "Return QR",
  compact = false,
}: {
  code: string;
  label?: string;
  compact?: boolean;
}) {
  return (
    <div className={`qr-card${compact ? " qr-card-compact" : ""}`}>
      <div className="qr-frame">
        <QRCodeSVG
          bgColor="transparent"
          fgColor="#0f172a"
          includeMargin={false}
          level="M"
          size={compact ? 104 : 156}
          value={code}
        />
      </div>
      <div className="qr-copy">
        <p className="qr-label">{label}</p>
        <p className="qr-value">{code}</p>
      </div>
    </div>
  );
}
