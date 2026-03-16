import { ArrowRight, Check, Circle, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { saveReflection, swapMeal, toggleKeystoneAction } from "@/lib/actions";
import type { KeystoneActionItem } from "@/lib/services/daily-plan";

export function HeroCard({
  name,
  topLine,
  priorities,
}: {
  name: string;
  topLine: string;
  priorities: string;
}) {
  return (
    <Card className="soft-grid overflow-hidden">
      <CardHeader className="gap-4">
        <div className="flex items-center justify-between">
          <Badge className="bg-white/80">Today</Badge>
          <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, MMMM d")}</p>
        </div>
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">For {name.split(" ")[0]}</p>
          <CardTitle className="max-w-xl text-3xl leading-tight sm:text-4xl">{topLine}</CardTitle>
          <CardDescription className="max-w-2xl text-base">
            Keep these priorities close today: {priorities}
          </CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}

export function TimelineCard({
  title,
  summary,
  startTime,
  endTime,
  status,
}: {
  title: string;
  summary: string;
  startTime: string;
  endTime: string;
  status: "passed" | "active" | "upcoming";
}) {
  return (
    <Card
      className={
        status === "active"
          ? "border-primary/40 bg-[linear-gradient(180deg,rgba(240,248,244,0.98),rgba(255,255,255,0.9))] shadow-float"
          : status === "passed"
            ? "border-border/60 bg-white/55 opacity-80"
            : ""
      }
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{startTime} to {endTime}</CardDescription>
          </div>
          <span
            className={
              status === "active"
                ? "rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground"
                : status === "passed"
                  ? "rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                  : "rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground"
            }
          >
            {status === "active" ? "Now" : status === "passed" ? "Done" : "Plan block"}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-7 text-muted-foreground">{summary}</p>
      </CardContent>
    </Card>
  );
}

export function KeystoneCard({ actions }: { actions: KeystoneActionItem[] }) {
  const completeCount = actions.filter((action) => action.completed).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <CardTitle className="text-xl">Keystone actions</CardTitle>
        </div>
        <CardDescription>
          Three moves that make the rest of the day feel sharper. {completeCount}/{actions.length} complete today.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action) => (
          <form action={toggleKeystoneAction} key={action.id}>
            <input type="hidden" name="actionId" value={action.id} />
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-2xl bg-secondary/80 px-4 py-3 text-left transition hover:bg-secondary"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                {action.completed ? (
                  <Check className="h-4 w-4 text-primary" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{action.label}</p>
                {action.detail ? (
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{action.detail}</p>
                ) : null}
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {action.completed ? "Completed today" : "Tap to mark complete"}
                </p>
              </div>
            </button>
          </form>
        ))}
      </CardContent>
    </Card>
  );
}

export function MealCard({
  title,
  description,
  mealId,
}: {
  title: string;
  description: string;
  mealId?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Food guidance</CardTitle>
        <CardDescription>One simple meal suggestion to keep energy steady.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-3xl bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(236,241,237,0.9))] p-5">
          <p className="font-serif text-2xl text-foreground">{title}</p>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">{description}</p>
        </div>
        {mealId ? (
          <form action={swapMeal.bind(null, mealId)}>
            <Button variant="secondary" className="w-full sm:w-auto">Swap this meal</Button>
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function ReflectionCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Evening reflection</CardTitle>
        <CardDescription>Short enough to finish, useful enough to remember.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={saveReflection} className="space-y-4">
          <textarea
            name="moved"
            placeholder="What moved forward today?"
            className="min-h-24 w-full rounded-3xl border border-border bg-input px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <textarea
            name="felt"
            placeholder="How did you feel today?"
            className="min-h-24 w-full rounded-3xl border border-border bg-input px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <textarea
            name="aligned"
            placeholder="Did today feel aligned with the life you want?"
            className="min-h-24 w-full rounded-3xl border border-border bg-input px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button className="w-full sm:w-auto">
            Save reflection
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function TrendCard({
  label,
  value,
  detail,
  source,
}: {
  label: string;
  value: string;
  detail: string;
  source: string;
}) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-7 text-muted-foreground">{detail}</p>
        <p className="mt-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">{source}</p>
      </CardContent>
    </Card>
  );
}
