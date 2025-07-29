import React from "react";
import "./label-badge.css";
import type { Label } from "../../../generated/prisma";
import { IssueLabelToken, LabelGroup } from "@primer/react";

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

export function LabelBadgeGroup({ labels }: { labels: Label[] }) {
  return (
    <LabelGroup className="label-badge-group" as="span">
      {labels.map((label) => (
        <LabelBadge key={label.id} label={label} />
      ))}
    </LabelGroup>
  );
}
