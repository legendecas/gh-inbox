import { Label, LabelGroup } from "@primer/react";
import React from "react";

import { parseStringListStr } from "../../../common/string-list";
import { useFilterContext } from "../../hooks/use-filter";

const kReasonVariant = {
  assign: "accent",
  author: "accent",
  comment: "attention",
  manual: "severe",
  mention: "danger",
  review_requested: "primary",
  team_mention: "primary",
} as const;

export function ReasonLabel({ reason }: { reason: string }) {
  const variant =
    kReasonVariant[reason as keyof typeof kReasonVariant] || "secondary";
  return <Label variant={variant}>{reason}</Label>;
}

export function ReasonLabelGroup({ reasonsStr }: { reasonsStr: string }) {
  const { appendFilter } = useFilterContext();

  let reasons = parseStringListStr(reasonsStr);

  // Remove "subscribed" if there are multiple reasons
  if (reasons.length > 1 && reasons.includes("subscribed")) {
    reasons = reasons.filter((r) => r !== "subscribed");
  }

  return (
    <LabelGroup
      className="reason-label-group text-sm w-[128px]"
      visibleChildCount={1}
      overflowStyle="overlay"
    >
      {reasons.map((reason) => (
        <a
          key={reason}
          onClick={() => appendFilter(`reason:${reason}`)}
          style={{ display: "block", cursor: "pointer" }}
        >
          <ReasonLabel reason={reason} />
        </a>
      ))}
    </LabelGroup>
  );
}
