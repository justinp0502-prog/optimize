import Link from "next/link";
import { ArrowRight, RefreshCcw } from "lucide-react";
import { getDashboardData } from "@/lib/data";
import { rebuildDay } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HeroCard, KeystoneCard, MealCard, ReflectionCard, TimelineCard } from "@/components/sections";

function parseTimeToHour(time: string) {
  const [rawHour, rawMinute] = time.split(":").map(Number);
  const hour = Number.isFinite(rawHour) ? rawHour : 0;
  const minute = Number.isFinite(rawMinute) ? rawMinute : 0;
  return hour + minute / 60;
}

export default async function HomePage() {
  const data = await getDashboardData();

  if (!data || !data.todayPlan) {
    return (
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Start by setting up your profile</CardTitle>
            <CardDescription>The dashboard needs a life profile and seeded data before it can personalize the day.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/onboarding">Go to onboarding</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const timelineBlocks = data.todayPlan.blocks.map((block) => {
    const startHour = parseTimeToHour(block.startTime);
    const endHour = parseTimeToHour(block.endTime);
    const status: "passed" | "active" | "upcoming" =
      currentHour >= endHour ? "passed" : currentHour >= startHour ? "active" : "upcoming";

    return {
      ...block,
      status,
    };
  });

  return (
    <div className="grid gap-6">
      <HeroCard
        name={data.user.name}
        topLine={data.todayPlan.topLine}
        priorities={data.user.profile!.topPriorities}
      />

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Your day outline</CardTitle>
                <CardDescription>Built around structure, energy, and what matters now.</CardDescription>
              </div>
              <form action={rebuildDay}>
                <Button variant="secondary">
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Rebuild my day
                </Button>
              </form>
            </CardHeader>
            <CardContent className="space-y-4">
              {timelineBlocks.map((block) => (
                <TimelineCard
                  key={block.id}
                  title={block.title}
                  summary={block.summary}
                  startTime={block.startTime}
                  endTime={block.endTime}
                  status={block.status}
                />
              ))}
            </CardContent>
          </Card>

          <ReflectionCard />
        </div>

        <div className="space-y-6">
          <KeystoneCard actions={data.keystoneActions} />
          <MealCard
            title={data.featuredMeal?.title ?? "Start with a simple, protein-forward meal"}
            description={
              data.featuredMeal?.description ??
              "Keep breakfast or lunch uncomplicated so the rest of the day has less friction."
            }
            mealId={data.featuredMeal?.id}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Gentle nudges</CardTitle>
              <CardDescription>Adaptive messaging, simulated locally for the MVP.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.sampleNudges.map((nudge) => (
                <div key={nudge.message} className="rounded-2xl border border-border/70 bg-white/70 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{nudge.label}</p>
                  <p className="mt-2 text-sm leading-6 text-foreground">{nudge.message}</p>
                </div>
              ))}
              <Button asChild variant="ghost" className="w-full justify-between rounded-2xl bg-secondary/60">
                <Link href="/settings">
                  Tune nudges and tone
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
