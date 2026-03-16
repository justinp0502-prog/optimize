import { format } from "date-fns";

type Tone = "SUPPORTIVE" | "DIRECT" | "ANALYTICAL" | "CHALLENGING";

type DailyPlanInput = {
  name: string;
  wakeTime: string;
  sleepTime: string;
  responsibilities: string;
  priorities: string;
  goals: string[];
  habitsToBuild: string[];
  habitsToReduce: string[];
  tone: Tone;
};

type RemainingDayContext = {
  currentHour?: number;
};

export type KeystoneActionItem = {
  id: string;
  label: string;
  detail?: string;
  completed: boolean;
  targetType: "goal" | "habit";
  targetLabel: string;
  targetDirection?: "BUILD" | "REDUCE";
};

const toneLines: Record<Tone, string[]> = {
  SUPPORTIVE: [
    "A calm day still counts when it moves the right things forward.",
    "A little structure now will make tonight feel lighter.",
    "Keep the day simple enough to actually trust yourself in it."
  ],
  DIRECT: [
    "Protect the important block before the day gets negotiated away.",
    "Make the next few hours count and let the rest be clean support.",
    "A useful day is built by deciding what not to chase."
  ],
  ANALYTICAL: [
    "Today works best if energy goes to the highest-leverage actions first.",
    "Front-load clarity, reduce friction, and let the routine do the rest.",
    "The cleanest day is usually the one with fewer context switches."
  ],
  CHALLENGING: [
    "Do the thing that would make tonight feel honest.",
    "You do not need a perfect day, only one that proves momentum.",
    "Build evidence that you can follow through even when it feels ordinary."
  ]
};

export function generateDailyLine(input: DailyPlanInput) {
  const lines = toneLines[input.tone];
  const dayIndex = new Date().getDate() % lines.length;
  return lines[dayIndex];
}

function cleanPhrase(value: string) {
  return value.trim().replace(/\.$/, "");
}

function stripLeadVerb(goal: string) {
  return cleanPhrase(goal)
    .replace(/^(ship|stabilize|rebuild|build|launch|finish|improve|create|organize|reduce|fix|write|plan)\s+/i, "")
    .trim();
}

function generateGoalAction(goal: string, index: number) {
  const normalized = cleanPhrase(goal);
  const lowered = normalized.toLowerCase();
  const subject = stripLeadVerb(goal);

  if (/(ship|launch|publish|release)/i.test(lowered)) {
    return `Finish one shippable piece of ${subject} before the day ends`;
  }

  if (/(design|portfolio|product|website|app|redesign|ui|ux)/i.test(lowered)) {
    return `Complete one focused work block on ${subject} with a clear deliverable`;
  }

  if (/(energy|health|sleep|fitness|body|wellness)/i.test(lowered)) {
    return `Protect energy with one deliberate reset: food, movement, or rest done on time`;
  }

  if (/(confidence|self-trust|discipline|consistency|momentum)/i.test(lowered)) {
    return `Keep one promise to yourself today that strengthens ${subject}`;
  }

  if (/(write|draft|newsletter|essay|content)/i.test(lowered)) {
    return `Draft one meaningful section for ${subject} before switching context`;
  }

  if (/(money|budget|finance|debt|save)/i.test(lowered)) {
    return `Make one concrete money move for ${subject} today`;
  }

  if (/(home|apartment|room|clean|organize)/i.test(lowered)) {
    return `Improve ${subject} with one visible reset you can feel tonight`;
  }

  const fallbackTemplates = [
    `Move ${subject} forward with one concrete next step`,
    `Protect one focused block for ${subject}`,
    `Close one meaningful loop connected to ${subject}`
  ];

  return fallbackTemplates[index % fallbackTemplates.length];
}

function getDayPhase(currentHour: number) {
  if (currentHour < 11) {
    return "morning";
  }

  if (currentHour < 17) {
    return "afternoon";
  }

  return "evening";
}

function generateGoalActionForPhase(goal: string, currentHour: number, index: number) {
  const phase = getDayPhase(currentHour);
  const baseAction = generateGoalAction(goal, index);
  const subject = stripLeadVerb(goal);
  const lowered = cleanPhrase(goal).toLowerCase();

  if (phase === "morning") {
    if (/(ship|launch|publish|release|design|portfolio|product|website|app|redesign|ui|ux)/i.test(lowered)) {
      return `Start the day with one focused block on ${subject} before messages take over`;
    }

    return baseAction;
  }

  if (phase === "afternoon") {
    if (/(energy|health|sleep|fitness|body|wellness)/i.test(lowered)) {
      return `Recover the middle of the day with one stabilizing move for ${subject}`;
    }

    return `Move ${subject} forward with one realistic next step before the day closes`;
  }

  if (/(confidence|self-trust|discipline|consistency|momentum)/i.test(lowered)) {
    return `End the day by finishing one small promise that rebuilds ${subject}`;
  }

  return `Close one meaningful loop tonight that supports ${subject} tomorrow`;
}

function generateBuildHabitAction(habit: string, currentHour: number) {
  const normalized = cleanPhrase(habit);
  const lowered = normalized.toLowerCase();
  const phase = getDayPhase(currentHour);

  if (/(sunlight|outside|walk)/i.test(lowered) && phase === "morning") {
    return `Get outside early enough to make ${normalized.toLowerCase()} real`;
  }

  if (/(protein|breakfast|meal|eat)/i.test(lowered)) {
    return phase === "evening"
      ? `Set up tomorrow's first meal so ${normalized.toLowerCase()} is easier in the morning`
      : `Make the next meal intentional so ${normalized.toLowerCase()} actually happens`;
  }

  if (/(reset|tidy|journal|plan|prepare)/i.test(lowered)) {
    return phase === "morning"
      ? `Protect ten minutes later today for ${normalized.toLowerCase()}`
      : `Give yourself ten clean minutes tonight for ${normalized.toLowerCase()}`;
  }

  if (phase === "afternoon") {
    return `Fit ${normalized.toLowerCase()} into the next low-friction window today`;
  }

  if (phase === "evening") {
    return `Set up one condition tonight that makes ${normalized.toLowerCase()} easier tomorrow`;
  }

  return `Make space for ${normalized.toLowerCase()} at the easiest point in the day`;
}

function generateReduceHabitAction(habit: string, currentHour: number) {
  const normalized = cleanPhrase(habit);
  const lowered = normalized.toLowerCase();
  const phase = getDayPhase(currentHour);

  if (/(scroll|phone|social|screen)/i.test(lowered)) {
    return phase === "morning"
      ? `Create one boundary now so ${normalized.toLowerCase()} does not steal the day later`
      : `Create one clear boundary that reduces ${normalized.toLowerCase()} tonight`;
  }

  if (/(snack|sugar|junk|late night)/i.test(lowered)) {
    return phase === "evening"
      ? `Remove tonight's trigger so ${normalized.toLowerCase()} stays off the table`
      : `Remove the trigger that usually leads to ${normalized.toLowerCase()}`;
  }

  if (phase === "afternoon") {
    return `Interrupt ${normalized.toLowerCase()} once before the late-day drift grows`;
  }

  return `Interrupt ${normalized.toLowerCase()} once before it picks up momentum`;
}

function buildGoalKeystone(goal: string, currentHour: number, index: number) {
  const lowered = cleanPhrase(goal).toLowerCase();
  const subject = stripLeadVerb(goal);
  const phase = getDayPhase(currentHour);

  if (/(child|daughter|son|family|home)/i.test(lowered)) {
    return {
      label: phase === "evening" ? "Set up tomorrow's family environment" : "Do one family-supporting reset",
      detail:
        phase === "evening"
          ? `Pick one concrete reset for ${subject}: tidy one play area, prep tomorrow's bag, or set out one activity. Keep it to 10-15 minutes.`
          : `Choose one visible action for ${subject}: clean one surface, prep one item, or finish one small task that reduces stress later.`,
    };
  }

  if (/(ship|launch|publish|release|design|portfolio|product|website|app|redesign|ui|ux)/i.test(lowered)) {
    return {
      label: phase === "morning" ? "Finish one focused work block" : "Move the main project one step forward",
      detail: `Open ${subject}, choose one task you can finish in 25-45 minutes, and stop after that deliverable is done.`,
    };
  }

  if (/(energy|health|sleep|fitness|body|wellness)/i.test(lowered)) {
    return {
      label: "Protect your energy on purpose",
      detail: "Choose one reset right now: eat something solid, take a 10-minute walk, drink water, or stop for a short rest.",
    };
  }

  if (/(confidence|self-trust|discipline|consistency|momentum)/i.test(lowered)) {
    return {
      label: "Keep one small promise to yourself",
      detail: `Pick one specific action tied to ${subject} and finish it fully before switching to something else.`,
    };
  }

  if (/(write|draft|newsletter|essay|content)/i.test(lowered)) {
    return {
      label: "Write one usable section",
      detail: `Open ${subject} and draft one paragraph, section, or outline chunk in one sitting. Do not aim for perfect.`,
    };
  }

  return {
    label: generateGoalActionForPhase(goal, currentHour, index),
    detail: `Choose one next step for ${subject} that can be completed in under 30 minutes, then do only that step.`,
  };
}

function buildBuildHabitKeystone(habit: string, currentHour: number) {
  const lowered = cleanPhrase(habit).toLowerCase();
  const normalized = cleanPhrase(habit);
  const phase = getDayPhase(currentHour);

  if (/(sunlight|outside|walk)/i.test(lowered)) {
    return {
      label: phase === "morning" ? "Get outside briefly" : "Create a walk window",
      detail:
        phase === "morning"
          ? `Step outside for 5-10 minutes with no phone if possible. The goal is simply to make ${normalized.toLowerCase()} happen.`
          : `Put a short walk on the calendar or go for 10 minutes after your next transition.`,
    };
  }

  if (/(protein|breakfast|meal|eat)/i.test(lowered)) {
    return {
      label: phase === "evening" ? "Prep the next meal" : "Make the next meal intentional",
      detail:
        phase === "evening"
          ? `Set out one easy protein option for tomorrow morning or prep one ingredient tonight.`
          : `Before you eat again, decide what the meal will be and make sure it includes protein.`,
    };
  }

  if (/(reset|tidy|journal|plan|prepare)/i.test(lowered)) {
    return {
      label: "Do a 10-minute reset",
      detail: `Set a timer for 10 minutes and use it only for ${normalized.toLowerCase()}. Stop when the timer ends.`,
    };
  }

  return {
    label: generateBuildHabitAction(habit, currentHour),
    detail: `Pick the easiest moment today to make ${normalized.toLowerCase()} real, even if it is only for 5-10 minutes.`,
  };
}

function buildReduceHabitKeystone(habit: string, currentHour: number) {
  const lowered = cleanPhrase(habit).toLowerCase();
  const normalized = cleanPhrase(habit);
  const phase = getDayPhase(currentHour);

  if (/(scroll|phone|social|screen)/i.test(lowered)) {
    return {
      label: "Create one phone boundary",
      detail:
        phase === "morning"
          ? `Put the phone in another room or turn on Focus mode for your next work block.`
          : `Charge the phone away from the bed or set a Do Not Disturb cutoff for tonight.`,
    };
  }

  if (/(snack|sugar|junk|late night)/i.test(lowered)) {
    return {
      label: "Remove one trigger",
      detail: `Move the trigger food out of reach, throw it away, or replace it with one easier option before tonight.`,
    };
  }

  return {
    label: generateReduceHabitAction(habit, currentHour),
    detail: `Decide what usually starts ${normalized.toLowerCase()}, then block that first trigger once today.`,
  };
}

function getBlockStatus(currentHour: number, startHour: number, endHour: number) {
  if (currentHour >= endHour) {
    return "passed";
  }

  if (currentHour >= startHour) {
    return "active";
  }

  return "upcoming";
}

export function generateDailyPlan(input: DailyPlanInput, context: RemainingDayContext = {}) {
  const currentHour = context.currentHour ?? new Date().getHours();
  const goalIndex = input.goals.length ? new Date().getDate() % input.goals.length : 0;
  const buildHabitIndex = input.habitsToBuild.length ? new Date().getDate() % input.habitsToBuild.length : 0;
  const reduceHabitIndex = input.habitsToReduce.length ? new Date().getDate() % input.habitsToReduce.length : 0;
  const goalA = input.goals[goalIndex] ?? "Move one meaningful priority";
  const goalB = input.goals[(goalIndex + 1) % Math.max(input.goals.length, 1)] ?? "Protect your energy";
  const buildHabit = input.habitsToBuild[buildHabitIndex] ?? "maintain a steady routine";
  const reduceHabit = input.habitsToReduce[reduceHabitIndex] ?? "unhelpful drift";

  const keystoneActions: KeystoneActionItem[] = [
    {
      id: "advance-goal",
      ...buildGoalKeystone(goalA, currentHour, 0),
      completed: false,
      targetType: "goal",
      targetLabel: goalA,
    },
    {
      id: "protect-habit",
      ...buildBuildHabitKeystone(buildHabit, currentHour),
      completed: false,
      targetType: "habit",
      targetLabel: buildHabit,
      targetDirection: "BUILD",
    },
    {
      id: "reduce-friction",
      ...buildReduceHabitKeystone(reduceHabit, currentHour),
      completed: false,
      targetType: "habit",
      targetLabel: reduceHabit,
      targetDirection: "REDUCE",
    }
  ];

  const morningFocus = currentHour < 11 ? "Anchor the morning before inputs expand." : "Reset the morning story and salvage the best next hour.";
  const middayFocus = "Use lunch and a short walk to avoid the flat middle of the day.";
  const afternoonFocus = `Shape the afternoon around ${goalB.toLowerCase()} and close the open loops.`;
  const eveningFocus = "End the day with less friction than you started it with.";
  const morningStatus = getBlockStatus(currentHour, 5, 11);
  const middayStatus = getBlockStatus(currentHour, 11, 14);
  const afternoonStatus = getBlockStatus(currentHour, 14, 18);
  const eveningStatus = getBlockStatus(currentHour, 18, 24);

  return {
    topLine: generateDailyLine(input),
    generatedAt: format(new Date(), "PPP p"),
    keystoneActions,
    blocks: [
      {
        period: "MORNING",
        title: morningStatus === "passed" ? "Morning recap" : "Morning",
        summary:
          morningStatus === "passed"
            ? `The morning window has mostly passed. Keep what worked, drop what did not, and carry only the useful part forward.`
            : `${morningFocus} Wake at ${input.wakeTime}, get light, eat something solid, and enter the first work block clearly.`,
        startTime: input.wakeTime,
        endTime: "11:30"
      },
      {
        period: "MIDDAY",
        title: middayStatus === "active" ? "Midday now" : "Midday",
        summary:
          middayStatus === "passed"
            ? `Midday is behind you. Keep the rest of the day simple and avoid trying to compensate with chaos.`
            : middayStatus === "active"
              ? `${middayFocus} You are in the middle of the day now, so keep responsibilities visible: ${input.responsibilities}`
              : `${middayFocus} Keep responsibilities visible: ${input.responsibilities}`,
        startTime: "11:30",
        endTime: "14:00"
      },
      {
        period: "AFTERNOON",
        title: afternoonStatus === "active" ? "Afternoon focus" : "Afternoon",
        summary:
          afternoonStatus === "passed"
            ? `The afternoon window is mostly gone. Close loops gently and make the evening easier instead of forcing more output.`
            : afternoonStatus === "active"
              ? `${afternoonFocus} This is the main remaining work window. Priorities in view: ${input.priorities}`
              : `${afternoonFocus} Priorities in view: ${input.priorities}`,
        startTime: "14:00",
        endTime: "18:00"
      },
      {
        period: "EVENING",
        title: eveningStatus === "active" ? "Evening landing" : "Evening",
        summary:
          eveningStatus === "active"
            ? `${eveningFocus} Focus on recovery, food, and preparing tomorrow before sleep at ${input.sleepTime}.`
            : `${eveningFocus} Eat, decompress, and set up tomorrow before sleep at ${input.sleepTime}.`,
        startTime: "18:00",
        endTime: input.sleepTime
      }
    ]
  };
}
