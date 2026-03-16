type NudgeTone = "supportive" | "direct" | "analytical" | "challenging";
type NudgeType = "reminder" | "encouragement" | "accountability";

export function generateNudgeMessage({
  type,
  tone,
  hour,
  keystoneAction,
}: {
  type: NudgeType;
  tone: NudgeTone;
  hour: number;
  keystoneAction: string;
}) {
  const partOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  if (type === "encouragement") {
    return {
      label: "Encouragement",
      message:
        tone === "challenging"
          ? `Small follow-through this ${partOfDay} still counts. Keep ${keystoneAction.toLowerCase()} moving.`
          : `A steady ${partOfDay} is enough. Keep ${keystoneAction.toLowerCase()} in sight.`
    };
  }

  if (type === "accountability") {
    return {
      label: "Accountability",
      message:
        tone === "direct"
          ? `Check the plan. Did ${keystoneAction.toLowerCase()} happen yet?`
          : `Quick check-in: if ${keystoneAction.toLowerCase()} still matters today, protect ten minutes for it now.`
    };
  }

  return {
    label: "Reminder",
    message: `Gentle reminder for the ${partOfDay}: ${keystoneAction}.`
  };
}

export function buildSampleNudges(tone: NudgeTone, keystoneActions: string[]) {
  return [
    generateNudgeMessage({ type: "reminder", tone, hour: 8, keystoneAction: keystoneActions[0] ?? "your first keystone action" }),
    generateNudgeMessage({ type: "encouragement", tone, hour: 13, keystoneAction: keystoneActions[1] ?? "protecting your energy" }),
    generateNudgeMessage({ type: "accountability", tone, hour: 18, keystoneAction: keystoneActions[2] ?? "closing the day well" })
  ];
}
