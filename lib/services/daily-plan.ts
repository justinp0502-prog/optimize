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
  duration?: string;
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

function durationForMinutes(min: number, max?: number) {
  return max ? `${min}-${max} min` : `${min} min`;
}

function splitSignals(value: string) {
  return value
    .split(/[\n,;]+/)
    .map((item) => cleanPhrase(item))
    .filter(Boolean);
}

function firstMeaningfulSignal(value: string, fallback: string) {
  return splitSignals(value)[0] ?? fallback;
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
      duration: durationForMinutes(10, 15),
    };
  }

  if (/(ship|launch|publish|release|design|portfolio|product|website|app|redesign|ui|ux)/i.test(lowered)) {
    return {
      label: phase === "morning" ? "Finish one focused work block" : "Move the main project one step forward",
      detail: `Open ${subject}, choose one task you can finish in 25-45 minutes, and stop after that deliverable is done.`,
      duration: durationForMinutes(25, 45),
    };
  }

  if (/(energy|health|sleep|fitness|body|wellness)/i.test(lowered)) {
    return {
      label: "Protect your energy on purpose",
      detail: "Choose one reset right now: eat something solid, take a 10-minute walk, drink water, or stop for a short rest.",
      duration: durationForMinutes(10),
    };
  }

  if (/(confidence|self-trust|discipline|consistency|momentum)/i.test(lowered)) {
    return {
      label: "Keep one small promise to yourself",
      detail: `Pick one specific action tied to ${subject} and finish it fully before switching to something else.`,
      duration: durationForMinutes(15, 20),
    };
  }

  if (/(write|draft|newsletter|essay|content)/i.test(lowered)) {
    return {
      label: "Write one usable section",
      detail: `Open ${subject} and draft one paragraph, section, or outline chunk in one sitting. Do not aim for perfect.`,
      duration: durationForMinutes(20, 30),
    };
  }

  return {
    label: generateGoalActionForPhase(goal, currentHour, index),
    detail: `Choose one next step for ${subject} that can be completed in under 30 minutes, then do only that step.`,
    duration: durationForMinutes(15, 30),
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
      duration: durationForMinutes(10),
    };
  }

  if (/(protein|breakfast|meal|eat)/i.test(lowered)) {
    return {
      label: phase === "evening" ? "Prep the next meal" : "Make the next meal intentional",
      detail:
        phase === "evening"
          ? `Set out one easy protein option for tomorrow morning or prep one ingredient tonight.`
          : `Before you eat again, decide what the meal will be and make sure it includes protein.`,
      duration: durationForMinutes(10, 15),
    };
  }

  if (/(reset|tidy|journal|plan|prepare)/i.test(lowered)) {
    return {
      label: "Do a 10-minute reset",
      detail: `Set a timer for 10 minutes and use it only for ${normalized.toLowerCase()}. Stop when the timer ends.`,
      duration: durationForMinutes(10),
    };
  }

  return {
    label: generateBuildHabitAction(habit, currentHour),
    detail: `Pick the easiest moment today to make ${normalized.toLowerCase()} real, even if it is only for 5-10 minutes.`,
    duration: durationForMinutes(5, 10),
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
      duration: durationForMinutes(5),
    };
  }

  if (/(snack|sugar|junk|late night)/i.test(lowered)) {
    return {
      label: "Remove one trigger",
      detail: `Move the trigger food out of reach, throw it away, or replace it with one easier option before tonight.`,
      duration: durationForMinutes(5, 10),
    };
  }

  return {
    label: generateReduceHabitAction(habit, currentHour),
    detail: `Decide what usually starts ${normalized.toLowerCase()}, then block that first trigger once today.`,
    duration: durationForMinutes(5, 10),
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

function joinBlockSummary(overview: string, actions: string[]) {
  return [overview, ...actions.map((action) => `- ${action}`)].join("\n");
}

function buildMorningBlock({
  input,
  goal,
  buildHabit,
  status,
}: {
  input: DailyPlanInput;
  goal: string;
  buildHabit: string;
  status: "passed" | "active" | "upcoming";
}) {
  const responsibility = firstMeaningfulSignal(input.responsibilities, "the first important responsibility");

  if (status === "passed") {
    return joinBlockSummary(
      "The morning window has mostly passed. Keep the day recoverable instead of replaying the miss.",
      [
        "Choose the one morning habit that still matters most and do it in stripped-down form now.",
        `Restart with the clearest next move on ${stripLeadVerb(goal).toLowerCase() || "your main priority"}.`,
        `Make ${responsibility.toLowerCase()} visible so the rest of the day is not reactive.`,
      ]
    );
  }

  return joinBlockSummary(
    "Use the opening block to stabilize energy and start one meaningful thing before the day fragments.",
    [
      `Get light, water, and one real meal or snack in place within 30 minutes of waking at ${input.wakeTime}.`,
      `Make ${cleanPhrase(buildHabit).toLowerCase()} real early in the easiest possible version.`,
      `Start one focused block on ${stripLeadVerb(goal).toLowerCase() || "your main priority"} before checking low-value inputs.`,
    ]
  );
}

function buildMiddayBlock({
  input,
  goal,
  buildHabit,
  reduceHabit,
  status,
}: {
  input: DailyPlanInput;
  goal: string;
  buildHabit: string;
  reduceHabit: string;
  status: "passed" | "active" | "upcoming";
}) {
  const responsibility = firstMeaningfulSignal(input.responsibilities, "your responsibilities");

  if (status === "passed") {
    return joinBlockSummary(
      "Midday is behind you. Use the next transition to steady the day instead of forcing output.",
      [
        "Eat something simple and protein-forward before you ask for more focus.",
        `Pick one unfinished obligation from ${responsibility.toLowerCase()} and reduce it to one clear next step.`,
        `Interrupt ${cleanPhrase(reduceHabit).toLowerCase()} once before the afternoon drift grows.`,
      ]
    );
  }

  return joinBlockSummary(
    "Midday should protect energy, clear mental clutter, and set up a believable afternoon.",
    [
      "Eat before you are depleted and keep the meal boring enough that it is easy to follow through.",
      `Take a 5-10 minute reset after food so ${cleanPhrase(buildHabit).toLowerCase()} has a real chance later.`,
      `Decide what “done enough” looks like for ${stripLeadVerb(goal).toLowerCase() || "the next work block"} before you re-enter work.`,
    ]
  );
}

function buildAfternoonBlock({
  input,
  goal,
  reduceHabit,
  status,
}: {
  input: DailyPlanInput;
  goal: string;
  reduceHabit: string;
  status: "passed" | "active" | "upcoming";
}) {
  const priority = firstMeaningfulSignal(input.priorities, stripLeadVerb(goal) || "your main priority");

  if (status === "passed") {
    return joinBlockSummary(
      "The main work window is mostly gone. Stop expanding the day and close what still matters.",
      [
        `Pick one loose end tied to ${priority.toLowerCase()} and finish or consciously defer it.`,
        "Send the one message or update that prevents tomorrow from starting messy.",
        `Create one boundary against ${cleanPhrase(reduceHabit).toLowerCase()} before the evening slide begins.`,
      ]
    );
  }

  return joinBlockSummary(
    "This block should carry the day’s main output, not extra browsing, planning, or false urgency.",
    [
      `Choose one deliverable for ${stripLeadVerb(goal).toLowerCase() || priority.toLowerCase()} and work until that piece is actually finished.`,
      `Batch the reactive work from ${priority.toLowerCase()} into one contained window instead of scattering it everywhere.`,
      `Put one guardrail around ${cleanPhrase(reduceHabit).toLowerCase()} before you lose the best remaining attention.`,
    ]
  );
}

function buildEveningBlock({
  input,
  goal,
  buildHabit,
  status,
}: {
  input: DailyPlanInput;
  goal: string;
  buildHabit: string;
  status: "passed" | "active" | "upcoming";
}) {
  const priority = firstMeaningfulSignal(input.priorities, stripLeadVerb(goal) || "tomorrow");

  return joinBlockSummary(
    status === "active"
      ? "Use the evening to land well, not to squeeze a second day into one body."
      : "The evening block should lower friction for sleep and tomorrow’s start.",
    [
      `Eat, reset the space, and stop carrying today's mental tabs into sleep at ${input.sleepTime}.`,
      `Do one 10-minute setup that makes ${cleanPhrase(buildHabit).toLowerCase()} easier tomorrow.`,
      `Close one small loop tied to ${priority.toLowerCase()} so tomorrow starts cleaner than today did.`,
    ]
  );
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
        summary: buildMorningBlock({
          input,
          goal: goalA,
          buildHabit,
          status: morningStatus,
        }),
        startTime: input.wakeTime,
        endTime: "11:30"
      },
      {
        period: "MIDDAY",
        title: middayStatus === "active" ? "Midday now" : "Midday",
        summary: buildMiddayBlock({
          input,
          goal: goalA,
          buildHabit,
          reduceHabit,
          status: middayStatus,
        }),
        startTime: "11:30",
        endTime: "14:00"
      },
      {
        period: "AFTERNOON",
        title: afternoonStatus === "active" ? "Afternoon focus" : "Afternoon",
        summary: buildAfternoonBlock({
          input,
          goal: goalB,
          reduceHabit,
          status: afternoonStatus,
        }),
        startTime: "14:00",
        endTime: "18:00"
      },
      {
        period: "EVENING",
        title: eveningStatus === "active" ? "Evening landing" : "Evening",
        summary: buildEveningBlock({
          input,
          goal: goalB,
          buildHabit,
          status: eveningStatus,
        }),
        startTime: "18:00",
        endTime: input.sleepTime
      }
    ]
  };
}
