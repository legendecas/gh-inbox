import React from "react";
import { Label } from "@primer/react";
import { parseStringListStr } from "../../../common/string-list";

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
  let reasons = parseStringListStr(reasonsStr);

  // Remove "subscribed" if there are multiple reasons
  if (reasons.length > 1 && reasons.includes("subscribed")) {
    reasons = reasons.filter((r) => r !== "subscribed");
  }

  return (
    <div className="reason-label-group">
      {reasons.map((reason) => (
        <ReasonLabel key={reason} reason={reason} />
      ))}
    </div>
  );
}
