import { IssueLabelToken, LabelGroup } from "@primer/react";
import React from "react";

import type { Label } from "../../../generated/prisma";
import { useFilterContext } from "../../hooks/use-filter";
import "./label-badge.css";

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
  const { appendFilter } = useFilterContext();

  return (
    <LabelGroup className="label-badge-group" as="span">
      {labels.map((label) => (
        <a
          key={label.id}
          onClick={() => appendFilter(`labels:"${label.name}"`)}
        >
          <LabelBadge label={label} />
        </a>
      ))}
    </LabelGroup>
  );
}
