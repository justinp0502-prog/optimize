import { addDays, startOfWeek } from "date-fns";
import { hashSync } from "bcryptjs";
import { PrismaClient, AssistantTone, BlockPeriod, GroceryCategory, HabitDirection } from "@prisma/client";
import { generateDailyPlan, type KeystoneActionItem } from "../lib/services/daily-plan";
import { generateMealPlan } from "../lib/services/meal-plan";

const prisma = new PrismaClient();

async function main() {
  await prisma.groceryItem.deleteMany();
  await prisma.meal.deleteMany();
  await prisma.mealPlan.deleteMany();
  await prisma.dailyBlock.deleteMany();
  await prisma.dailyPlan.deleteMany();
  await prisma.reflection.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.habit.deleteMany();
  await prisma.nudgePreference.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      email: "alex@optimize.app",
      name: "Alex Mercer",
      passwordHash: hashSync("optimize-demo", 10),
      profile: {
        create: {
          wakeTime: "06:30",
          sleepTime: "22:30",
          responsibilities: "Lead designer from 9-5, gym twice per week, partner dinner on Thursdays.",
          topPriorities: "Build momentum at work, improve energy, make evenings calmer.",
          mealPreferences: "High-protein, produce-first meals with simple prep.",
          dietaryRestrictions: "Lactose-light, no shellfish",
          cookingStyle: "Simple",
          tone: AssistantTone.SUPPORTIVE,
        },
      },
      nudgePreference: {
        create: {
          enabled: true,
          reminderEnabled: true,
          encouragementEnabled: true,
          accountabilityEnabled: false,
          cadence: 3,
          quietHoursStart: "21:30",
          quietHoursEnd: "06:45",
        },
      },
      goals: {
        create: [
          {
            title: "Ship the portfolio redesign",
            description: "Close out the final responsive polish and launch notes.",
            progress: 0,
          },
          {
            title: "Stabilize daily energy",
            description: "Wake consistently, eat protein early, and walk after lunch.",
            progress: 0,
          },
          {
            title: "Rebuild self-trust",
            description: "Finish the things I said I would do this week.",
            progress: 0,
          },
        ],
      },
      habits: {
        create: [
          { title: "Morning sunlight", direction: HabitDirection.BUILD, consistency: 0 },
          { title: "Protein-first breakfast", direction: HabitDirection.BUILD, consistency: 0 },
          { title: "Late-night scrolling", direction: HabitDirection.REDUCE, consistency: 0 },
          { title: "10-minute evening reset", direction: HabitDirection.BUILD, consistency: 0 },
        ],
      },
    },
    include: {
      profile: true,
      goals: true,
      habits: true,
    },
  });

  const generatedPlan = generateDailyPlan({
    name: user.name,
    wakeTime: user.profile!.wakeTime,
    sleepTime: user.profile!.sleepTime,
    responsibilities: user.profile!.responsibilities,
    priorities: user.profile!.topPriorities,
    goals: user.goals.map((goal) => goal.title),
    habitsToBuild: user.habits.filter((habit) => habit.direction === HabitDirection.BUILD).map((habit) => habit.title),
    habitsToReduce: user.habits.filter((habit) => habit.direction === HabitDirection.REDUCE).map((habit) => habit.title),
    tone: user.profile!.tone,
  });

  const todayPlan = await prisma.dailyPlan.create({
    data: {
      userId: user.id,
      date: new Date(),
      topLine: generatedPlan.topLine,
      keystoneActions: generatedPlan.keystoneActions as unknown as KeystoneActionItem[],
      blocks: {
        create: generatedPlan.blocks.map((block) => ({
          period: block.period as BlockPeriod,
          title: block.title,
          summary: block.summary,
          startTime: block.startTime,
          endTime: block.endTime,
        })),
      },
    },
  });

  const mealOutput = generateMealPlan({
    mealPreferences: user.profile!.mealPreferences,
    restrictions: user.profile!.dietaryRestrictions,
    cookingStyle: user.profile!.cookingStyle,
  });

  const currentWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
  const mealPlan = await prisma.mealPlan.create({
    data: {
      userId: user.id,
      weekOf: currentWeek,
      meals: {
        create: mealOutput.meals.map((meal) => ({
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
    include: {
      meals: {
        include: {
          groceries: true,
        },
      },
    },
  });

  if (!todayPlan || !mealPlan) {
    throw new Error("Failed to seed Optimize data.");
  }

  await prisma.dailyPlan.create({
    data: {
      userId: user.id,
      date: addDays(new Date(), -1),
      topLine: "Yesterday proved that a calmer structure creates better energy.",
      keystoneActions: [
        { id: "y-1", label: "Protect the first focus block", completed: true },
        { id: "y-2", label: "Eat lunch before the slump starts", completed: true },
        { id: "y-3", label: "Reset the apartment for ten minutes", completed: false }
      ],
      blocks: {
        create: [
          {
            period: BlockPeriod.MORNING,
            title: "Steady start",
            summary: "Wake, breakfast, and 45 minutes of focused design work.",
            startTime: "06:30",
            endTime: "09:00",
          },
          {
            period: BlockPeriod.MIDDAY,
            title: "Protect the middle",
            summary: "Lunch, walk, and keep meetings contained.",
            startTime: "12:00",
            endTime: "14:00",
          },
          {
            period: BlockPeriod.AFTERNOON,
            title: "Close loops",
            summary: "Admin cleanup and portfolio QA review.",
            startTime: "14:00",
            endTime: "18:00",
          },
          {
            period: BlockPeriod.EVENING,
            title: "Settle the landing",
            summary: "Cook dinner, tidy up, and journal briefly.",
            startTime: "18:30",
            endTime: "22:00",
          },
        ],
      },
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
