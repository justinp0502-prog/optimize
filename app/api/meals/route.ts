import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/current-user";
import { generateMealPlan } from "@/lib/services/meal-plan";

export async function GET() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user || !user.profile) {
    return NextResponse.json({ error: "No user profile found." }, { status: 404 });
  }

  return NextResponse.json(
    generateMealPlan({
      mealPreferences: user.profile.mealPreferences,
      restrictions: user.profile.dietaryRestrictions,
      cookingStyle: user.profile.cookingStyle,
    })
  );
}
