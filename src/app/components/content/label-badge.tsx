import React from "react";
import "./label-badge.css";
import type { Label } from "../../../generated/prisma";

export interface LabelProps {
  label: Label;
}

export function LabelBadge({ label }: LabelProps) {
  return (
    <span
      className="label-badge inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-gray-500/10 ring-inset"
      style={{
        backgroundColor: `#${label.color}`,
        color: isDark(label.color) ? "#fff" : "#000",
      }}
    >
      {label.name}
    </span>
  );
}

function isDark(color: string): boolean {
  const rgb = parseInt(color, 16); // convert rrggbb to decimal
  const r = (rgb >> 16) & 0xff; // extract red
  const g = (rgb >> 8) & 0xff; // extract green
  const b = (rgb >> 0) & 0xff; // extract blue

  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

  return luma < 128;
}
