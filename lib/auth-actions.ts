"use server";

import { hash } from "bcryptjs";
import { AssistantTone } from "@prisma/client";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function loginUser(formData: FormData) {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?error=Invalid%20email%20or%20password");
    }

    throw error;
  }
}

export async function registerUser(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || password.length < 8) {
    redirect("/signup?error=Use%20a%20name,%20valid%20email,%20and%20password%20with%208+%20characters");
  }

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    redirect("/signup?error=An%20account%20with%20that%20email%20already%20exists");
  }

  const passwordHash = await hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      profile: {
        create: {
          wakeTime: "06:30",
          sleepTime: "22:30",
          responsibilities: "",
          topPriorities: "",
          mealPreferences: "",
          dietaryRestrictions: "",
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
          quietHoursStart: "21:00",
          quietHoursEnd: "07:00",
        },
      },
    },
  });

  await signIn("credentials", {
    email,
    password,
    redirectTo: "/onboarding",
  });
}

export async function logoutUser() {
  await signOut({
    redirectTo: "/login",
  });
}
