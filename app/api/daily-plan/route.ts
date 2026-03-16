import { NextResponse } from "next/server";
import { HabitDirection } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/current-user";
import { generateDailyPlan } from "@/lib/services/daily-plan";

export async function GET() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true, goals: true, habits: true },
  });

  if (!user || !user.profile) {
    return NextResponse.json({ error: "No user profile found." }, { status: 404 });
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

  return NextResponse.json(plan);
}
