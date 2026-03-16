import { endOfDay, endOfWeek, startOfDay, startOfWeek } from "date-fns";
import { HabitDirection } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/current-user";
import { buildSampleNudges } from "@/lib/services/nudges";
import type { KeystoneActionItem } from "@/lib/services/daily-plan";

const weekdayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export async function getPrimaryUser() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      goals: true,
      habits: true,
      reflections: {
        orderBy: { date: "desc" },
      },
      dailyPlans: {
        include: {
          blocks: {
            orderBy: { startTime: "asc" },
          },
        },
        orderBy: { date: "desc" },
        take: 21,
      },
      mealPlans: {
        include: {
          meals: {
            include: {
              groceries: true,
            },
          },
        },
        orderBy: { weekOf: "desc" },
        take: 8,
      },
      nudgePreference: true,
    },
  });
}

export async function getDashboardData() {
  const user = await getPrimaryUser();

  if (!user || !user.profile) {
    return null;
  }

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const todayPlan = user.dailyPlans.find((plan) => plan.date >= todayStart && plan.date <= todayEnd);
  const currentMealPlan = user.mealPlans.find(
    (mealPlan) => mealPlan.weekOf >= currentWeekStart && mealPlan.weekOf <= currentWeekEnd
  );
  const orderedMeals = currentMealPlan
    ? [...currentMealPlan.meals].sort(
        (a, b) => weekdayOrder.indexOf(a.dayLabel) - weekdayOrder.indexOf(b.dayLabel)
      )
    : [];
  const featuredMeal = orderedMeals[0];

  const buildHabits = user.habits.filter((habit) => habit.direction === HabitDirection.BUILD);
  const reduceHabits = user.habits.filter((habit) => habit.direction === HabitDirection.REDUCE);
  const reflections = user.reflections.slice(0, 4);
  const parsedKeystoneActions = Array.isArray(todayPlan?.keystoneActions)
    ? (todayPlan.keystoneActions as unknown as Array<string | KeystoneActionItem>).map((action, index) =>
        typeof action === "string"
          ? {
              id: `legacy-${index}`,
              label: action,
              detail: undefined,
              duration: undefined,
              completed: false,
              targetType: "goal" as const,
              targetLabel: "",
            }
          : action
      )
    : [];
  const completedKeystoneCount = parsedKeystoneActions.filter((action) => action.completed).length;

  return {
    user,
    todayPlan,
    keystoneActions: parsedKeystoneActions,
    completedKeystoneCount,
    currentMealPlan: currentMealPlan ? { ...currentMealPlan, meals: orderedMeals } : null,
    featuredMeal,
    buildHabits,
    reduceHabits,
    reflections,
    sampleNudges: buildSampleNudges(
      user.profile.tone.toLowerCase() as "supportive" | "direct" | "analytical" | "challenging",
      parsedKeystoneActions.map((action) => action.label)
    ),
    weekOf: currentMealPlan ? startOfWeek(currentMealPlan.weekOf, { weekStartsOn: 1 }) : null,
  };
}
