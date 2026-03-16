"use server";

import { revalidatePath } from "next/cache";
import { startOfWeek } from "date-fns";
import { redirect } from "next/navigation";
import { AssistantTone, BlockPeriod, GroceryCategory, HabitDirection } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/current-user";
import { generateDailyPlan, type KeystoneActionItem } from "@/lib/services/daily-plan";
import { generateMealPlan, swapMealData } from "@/lib/services/meal-plan";

function splitList(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function inferReflectionScore({
  moved,
  felt,
  aligned,
}: {
  moved: string;
  felt: string;
  aligned: string;
}) {
  const text = `${moved} ${felt} ${aligned}`.toLowerCase();
  let score = 5;

  const positiveSignals = [
    "aligned",
    "good",
    "great",
    "clear",
    "focused",
    "steady",
    "confident",
    "calm",
    "progress",
    "yes",
    "better",
  ];
  const negativeSignals = [
    "misaligned",
    "bad",
    "anxious",
    "scattered",
    "tired",
    "stuck",
    "overwhelmed",
    "no",
    "drained",
    "chaotic",
  ];

  for (const signal of positiveSignals) {
    if (text.includes(signal)) {
      score += 1;
    }
  }

  for (const signal of negativeSignals) {
    if (text.includes(signal)) {
      score -= 1;
    }
  }

  if (aligned.toLowerCase().includes("mostly")) {
    score += 1;
  }

  if (moved.trim().length > 40) {
    score += 1;
  }

  return Math.max(1, Math.min(10, score));
}

function normalizeKeystoneActions(value: unknown): KeystoneActionItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item, index) => {
    if (typeof item === "string") {
      return {
        id: `legacy-${index}`,
        label: item,
        detail: undefined,
        duration: undefined,
        completed: false,
        targetType: "goal",
        targetLabel: "",
      };
    }

    if (item && typeof item === "object") {
      const record = item as Partial<KeystoneActionItem>;
      return {
        id: String(record.id ?? `generated-${index}`),
        label: String(record.label ?? ""),
        detail: record.detail ? String(record.detail) : undefined,
        duration: record.duration ? String(record.duration) : undefined,
        completed: Boolean(record.completed),
        targetType: record.targetType === "habit" ? "habit" : "goal",
        targetLabel: String(record.targetLabel ?? ""),
        targetDirection:
          record.targetDirection === "REDUCE"
            ? "REDUCE"
            : record.targetDirection === "BUILD"
              ? "BUILD"
              : undefined,
      };
    }

    return {
      id: `generated-${index}`,
      label: "",
      detail: undefined,
      duration: undefined,
      completed: false,
      targetType: "goal",
      targetLabel: "",
    };
  });
}

async function recomputeDerivedProgress(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      goals: true,
      habits: true,
      dailyPlans: {
        orderBy: { date: "desc" },
        take: 21,
      },
    },
  });

  if (!user) {
    return;
  }

  const actionHistory = user.dailyPlans.flatMap((plan) => normalizeKeystoneActions(plan.keystoneActions));

  for (const goal of user.goals) {
    const related = actionHistory.filter(
      (action) => action.targetType === "goal" && action.targetLabel === goal.title
    );
    const progress = related.length
      ? Math.round((related.filter((action) => action.completed).length / related.length) * 100)
      : 0;

    await prisma.goal.update({
      where: { id: goal.id },
      data: { progress },
    });
  }

  for (const habit of user.habits) {
    const related = actionHistory.filter(
      (action) =>
        action.targetType === "habit" &&
        action.targetLabel === habit.title &&
        action.targetDirection === habit.direction
    );
    const consistency = related.length
      ? Math.round((related.filter((action) => action.completed).length / related.length) * 100)
      : 0;

    await prisma.habit.update({
      where: { id: habit.id },
      data: { consistency },
    });
  }
}

export async function saveProfile(formData: FormData) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true, goals: true, habits: true, nudgePreference: true },
  });

  if (!user) {
    return;
  }

  const name = String(formData.get("name") ?? user.name);
  const tone = String(formData.get("tone") ?? "SUPPORTIVE").toUpperCase() as AssistantTone;
  const goalTitles = splitList(formData.get("goals"));
  const buildHabits = splitList(formData.get("habitsBuild"));
  const reduceHabits = splitList(formData.get("habitsReduce"));

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      profile: {
        upsert: {
          create: {
            wakeTime: String(formData.get("wakeTime") ?? "06:30"),
            sleepTime: String(formData.get("sleepTime") ?? "22:30"),
            responsibilities: String(formData.get("responsibilities") ?? ""),
            topPriorities: String(formData.get("topPriorities") ?? ""),
            mealPreferences: String(formData.get("mealPreferences") ?? ""),
            dietaryRestrictions: String(formData.get("dietaryRestrictions") ?? ""),
            cookingStyle: String(formData.get("cookingStyle") ?? "Simple"),
            tone,
          },
          update: {
            wakeTime: String(formData.get("wakeTime") ?? "06:30"),
            sleepTime: String(formData.get("sleepTime") ?? "22:30"),
            responsibilities: String(formData.get("responsibilities") ?? ""),
            topPriorities: String(formData.get("topPriorities") ?? ""),
            mealPreferences: String(formData.get("mealPreferences") ?? ""),
            dietaryRestrictions: String(formData.get("dietaryRestrictions") ?? ""),
            cookingStyle: String(formData.get("cookingStyle") ?? "Simple"),
            tone,
          },
        },
      },
    },
  });

  await prisma.goal.deleteMany({ where: { userId: user.id } });
  await prisma.habit.deleteMany({ where: { userId: user.id } });

  if (goalTitles.length > 0) {
    await prisma.goal.createMany({
      data: goalTitles.map((title, index) => ({
        userId: user.id,
        title,
        description: `Priority ${index + 1} for the current season.`,
        progress: 0,
      })),
    });
  }

  const allHabits = [
    ...buildHabits.map((title) => ({ title, direction: HabitDirection.BUILD })),
    ...reduceHabits.map((title) => ({ title, direction: HabitDirection.REDUCE })),
  ];

  if (allHabits.length > 0) {
    await prisma.habit.createMany({
      data: allHabits.map((habit, index) => ({
        userId: user.id,
        title: habit.title,
        direction: habit.direction,
        consistency: 0,
      })),
    });
  }

  const refreshedUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      profile: true,
      goals: true,
      habits: true,
      dailyPlans: {
        orderBy: { date: "desc" },
        take: 1,
      },
      mealPlans: {
        orderBy: { weekOf: "desc" },
        take: 1,
      },
    },
  });

  if (refreshedUser?.profile) {
    const plan = generateDailyPlan({
      name: refreshedUser.name,
      wakeTime: refreshedUser.profile.wakeTime,
      sleepTime: refreshedUser.profile.sleepTime,
      responsibilities: refreshedUser.profile.responsibilities,
      priorities: refreshedUser.profile.topPriorities,
      goals: refreshedUser.goals.map((goal) => goal.title),
      habitsToBuild: refreshedUser.habits
        .filter((habit) => habit.direction === HabitDirection.BUILD)
        .map((habit) => habit.title),
      habitsToReduce: refreshedUser.habits
        .filter((habit) => habit.direction === HabitDirection.REDUCE)
        .map((habit) => habit.title),
      tone: refreshedUser.profile.tone,
    });

    if (refreshedUser.dailyPlans[0]) {
      await prisma.dailyBlock.deleteMany({
        where: { dailyPlanId: refreshedUser.dailyPlans[0].id },
      });

      await prisma.dailyPlan.update({
        where: { id: refreshedUser.dailyPlans[0].id },
        data: {
          date: new Date(),
          topLine: plan.topLine,
          keystoneActions: plan.keystoneActions as unknown as KeystoneActionItem[],
          blocks: {
            create: plan.blocks.map((block) => ({
              period: block.period as BlockPeriod,
              title: block.title,
              summary: block.summary,
              startTime: block.startTime,
              endTime: block.endTime,
            })),
          },
        },
      });
    } else {
      await prisma.dailyPlan.create({
        data: {
          userId: refreshedUser.id,
          date: new Date(),
          topLine: plan.topLine,
          keystoneActions: plan.keystoneActions as unknown as KeystoneActionItem[],
          blocks: {
            create: plan.blocks.map((block) => ({
              period: block.period as BlockPeriod,
              title: block.title,
              summary: block.summary,
              startTime: block.startTime,
              endTime: block.endTime,
            })),
          },
        },
      });
    }

    const generatedMeals = generateMealPlan({
      mealPreferences: refreshedUser.profile.mealPreferences,
      restrictions: refreshedUser.profile.dietaryRestrictions,
      cookingStyle: refreshedUser.profile.cookingStyle,
    });

    if (refreshedUser.mealPlans[0]) {
      await prisma.groceryItem.deleteMany({
        where: { meal: { mealPlanId: refreshedUser.mealPlans[0].id } },
      });
      await prisma.meal.deleteMany({
        where: { mealPlanId: refreshedUser.mealPlans[0].id },
      });

      await prisma.mealPlan.update({
        where: { id: refreshedUser.mealPlans[0].id },
        data: {
          weekOf: startOfWeek(new Date(), { weekStartsOn: 1 }),
          meals: {
            create: generatedMeals.meals.map((meal) => ({
              dayLabel: meal.dayLabel,
              mealType: meal.mealType,
              title: meal.title,
              description: meal.description,
              category: meal.category,
              groceries: {
                create: meal.groceries.map((item) => ({
                  label: item.label,
                  category: item.category as GroceryCategory,
                  quantity: item.quantity,
                })),
              },
            })),
          },
        },
      });
    } else {
      await prisma.mealPlan.create({
        data: {
          userId: refreshedUser.id,
          weekOf: startOfWeek(new Date(), { weekStartsOn: 1 }),
          meals: {
            create: generatedMeals.meals.map((meal) => ({
              dayLabel: meal.dayLabel,
              mealType: meal.mealType,
              title: meal.title,
              description: meal.description,
              category: meal.category,
              groceries: {
                create: meal.groceries.map((item) => ({
                  label: item.label,
                  category: item.category as GroceryCategory,
                  quantity: item.quantity,
                })),
              },
            })),
          },
        },
      });
    }

    await recomputeDerivedProgress(refreshedUser.id);
  }

  revalidatePath("/");
  revalidatePath("/onboarding");
  revalidatePath("/profile");
  revalidatePath("/settings");
  revalidatePath("/progress");

  redirect("/");
}

export async function rebuildDay() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true, goals: true, habits: true },
  });

  if (!user || !user.profile) {
    return;
  }

  const plan = generateDailyPlan({
    name: user.name,
    wakeTime: user.profile.wakeTime,
    sleepTime: user.profile.sleepTime,
    responsibilities: user.profile.responsibilities,
    priorities: user.profile.topPriorities,
    goals: user.goals.map((goal) => goal.title),
    habitsToBuild: user.habits.filter((habit) => habit.direction === HabitDirection.BUILD).map((habit) => habit.title),
    habitsToReduce: user.habits.filter((habit) => habit.direction === HabitDirection.REDUCE).map((habit) => habit.title),
    tone: user.profile.tone,
  });

  const currentPlan = await prisma.dailyPlan.findFirst({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  if (currentPlan) {
    const existingActions = normalizeKeystoneActions(currentPlan.keystoneActions);
    const completionById = new Map(existingActions.map((action) => [action.id, action.completed]));
    const mergedKeystoneActions = plan.keystoneActions.map((action) => ({
      ...action,
      completed: completionById.get(action.id) ?? false,
    }));

    await prisma.dailyBlock.deleteMany({ where: { dailyPlanId: currentPlan.id } });
    await prisma.dailyPlan.update({
      where: { id: currentPlan.id },
      data: {
        date: new Date(),
        topLine: plan.topLine,
        keystoneActions: mergedKeystoneActions as unknown as KeystoneActionItem[],
        blocks: {
          create: plan.blocks.map((block) => ({
            period: block.period as BlockPeriod,
            title: block.title,
            summary: block.summary,
            startTime: block.startTime,
            endTime: block.endTime,
          })),
        },
      },
    });
  } else {
    await prisma.dailyPlan.create({
      data: {
        userId: user.id,
        date: new Date(),
        topLine: plan.topLine,
        keystoneActions: plan.keystoneActions as unknown as KeystoneActionItem[],
        blocks: {
          create: plan.blocks.map((block) => ({
            period: block.period as BlockPeriod,
            title: block.title,
            summary: block.summary,
            startTime: block.startTime,
            endTime: block.endTime,
          })),
        },
      },
    });
  }

  await recomputeDerivedProgress(user.id);

  revalidatePath("/");
  revalidatePath("/progress");
  revalidatePath("/profile");
}

export async function saveReflection(formData: FormData) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return;
  }

  const moved = String(formData.get("moved") ?? "");
  const felt = String(formData.get("felt") ?? "");
  const aligned = String(formData.get("aligned") ?? "");
  const inferredScore = inferReflectionScore({ moved, felt, aligned });

  await prisma.reflection.create({
    data: {
      userId,
      date: new Date(),
      moved,
      felt,
      aligned,
      score: inferredScore,
    },
  });

  revalidatePath("/");
  revalidatePath("/reflection");
  revalidatePath("/progress");
}

export async function toggleKeystoneAction(formData: FormData) {
  const actionId = String(formData.get("actionId") ?? "");
  const userId = await getCurrentUserId();

  if (!actionId || !userId) {
    return;
  }

  const plan = await prisma.dailyPlan.findFirst({
    where: { userId },
    orderBy: { date: "desc" },
  });

  if (!plan) {
    return;
  }

  const actions = normalizeKeystoneActions(plan.keystoneActions);
  const updatedActions = actions.map((action) =>
    action.id === actionId ? { ...action, completed: !action.completed } : action
  );

  await prisma.dailyPlan.update({
    where: { id: plan.id },
    data: {
      keystoneActions: updatedActions,
    },
  });

  await recomputeDerivedProgress(plan.userId);

  revalidatePath("/");
  revalidatePath("/progress");
  revalidatePath("/profile");
}

export async function clearReflectionHistory() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return;
  }

  await prisma.reflection.deleteMany({
    where: { userId },
  });

  revalidatePath("/");
  revalidatePath("/reflection");
  revalidatePath("/progress");
}

export async function updateSettings(formData: FormData) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true, nudgePreference: true },
  });

  if (!user || !user.profile) {
    return;
  }

  const tone = String(formData.get("tone") ?? user.profile.tone).toUpperCase() as AssistantTone;

  await prisma.profile.update({
    where: { id: user.profile.id },
    data: { tone },
  });

  await prisma.nudgePreference.upsert({
    where: { userId: user.id },
    update: {
      enabled: formData.get("enabled") === "on",
      reminderEnabled: formData.get("reminderEnabled") === "on",
      encouragementEnabled: formData.get("encouragementEnabled") === "on",
      accountabilityEnabled: formData.get("accountabilityEnabled") === "on",
      cadence: Number(formData.get("cadence") ?? 3),
      quietHoursStart: String(formData.get("quietHoursStart") ?? "21:00"),
      quietHoursEnd: String(formData.get("quietHoursEnd") ?? "07:00"),
    },
    create: {
      userId: user.id,
      enabled: formData.get("enabled") === "on",
      reminderEnabled: formData.get("reminderEnabled") === "on",
      encouragementEnabled: formData.get("encouragementEnabled") === "on",
      accountabilityEnabled: formData.get("accountabilityEnabled") === "on",
      cadence: Number(formData.get("cadence") ?? 3),
      quietHoursStart: String(formData.get("quietHoursStart") ?? "21:00"),
      quietHoursEnd: String(formData.get("quietHoursEnd") ?? "07:00"),
    },
  });

  revalidatePath("/settings");
  revalidatePath("/");
}

export async function regenerateMeals() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user || !user.profile) {
    return;
  }

  const generated = generateMealPlan({
    mealPreferences: user.profile.mealPreferences,
    restrictions: user.profile.dietaryRestrictions,
    cookingStyle: user.profile.cookingStyle,
  });

  const existingPlan = await prisma.mealPlan.findFirst({
    where: { userId: user.id },
    include: { meals: { include: { groceries: true } } },
    orderBy: { weekOf: "desc" },
  });

  if (existingPlan) {
    await prisma.groceryItem.deleteMany({
      where: { meal: { mealPlanId: existingPlan.id } },
    });
    await prisma.meal.deleteMany({ where: { mealPlanId: existingPlan.id } });

    await prisma.mealPlan.update({
      where: { id: existingPlan.id },
      data: {
        weekOf: startOfWeek(new Date(), { weekStartsOn: 1 }),
        meals: {
          create: generated.meals.map((meal) => ({
            dayLabel: meal.dayLabel,
            mealType: meal.mealType,
            title: meal.title,
            description: meal.description,
            category: meal.category,
            groceries: {
              create: meal.groceries.map((item) => ({
                label: item.label,
                category: item.category as GroceryCategory,
                quantity: item.quantity,
              })),
            },
          })),
        },
      },
    });
  } else {
    await prisma.mealPlan.create({
      data: {
        userId: user.id,
        weekOf: startOfWeek(new Date(), { weekStartsOn: 1 }),
        meals: {
          create: generated.meals.map((meal) => ({
            dayLabel: meal.dayLabel,
            mealType: meal.mealType,
            title: meal.title,
            description: meal.description,
            category: meal.category,
            groceries: {
              create: meal.groceries.map((item) => ({
                label: item.label,
                category: item.category as GroceryCategory,
                quantity: item.quantity,
              })),
            },
          })),
        },
      },
    });
  }

  revalidatePath("/meals");
  revalidatePath("/");
}

export async function swapMeal(mealId: string) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return;
  }

  const meal = await prisma.meal.findUnique({
    where: { id: mealId },
    include: {
      groceries: true,
      mealPlan: true,
    },
  });

  if (!meal || meal.mealPlan.userId !== userId) {
    return;
  }

  const swapped = swapMealData(meal.title);

  await prisma.groceryItem.deleteMany({ where: { mealId: meal.id } });
  await prisma.meal.update({
    where: { id: meal.id },
    data: {
      title: swapped.title,
      description: swapped.description,
      category: swapped.category,
      groceries: {
        create: swapped.groceries.map((item) => ({
          label: item.label,
          category: item.category as GroceryCategory,
          quantity: item.quantity,
        })),
      },
    },
  });

  revalidatePath("/meals");
  revalidatePath("/");
}
