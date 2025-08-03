import React from "react";
import "./label-badge.css";
import type { Label } from "../../../generated/prisma";
import { IssueLabelToken, LabelGroup } from "@primer/react";
import { useFilterContext } from "../../hooks/use-filter";

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
  const { filter, setFilter } = useFilterContext();

  return (
    <LabelGroup className="label-badge-group" as="span">
      {labels.map((label) => (
        <a
          key={label.id}
          onClick={() => setFilter(`${filter} labels:"${label.name}"`)}
        >
          <LabelBadge label={label} />
        </a>
      ))}
    </LabelGroup>
  );
}
