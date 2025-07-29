import React from "react";
import "./label-badge.css";
import type { Label } from "../../../generated/prisma";
import { IssueLabelToken } from "@primer/react";

export interface LabelProps {
  label: Label;
}

export function LabelBadge({ label }: LabelProps) {
  return (
    <IssueLabelToken
      className="label-badge"
      text={label.name}
      fillColor={`#${label.color}`}
      size="medium"
    />
  );
}
