import React from "react";
import { Label } from "@primer/react";

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
