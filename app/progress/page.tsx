import { getDashboardData } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendCard } from "@/components/sections";

export default async function ProgressPage() {
  const data = await getDashboardData();

  if (!data) {
    return null;
  }

  const goalAverage = data.user.goals.length
    ? Math.round(data.user.goals.reduce((sum, goal) => sum + goal.progress, 0) / data.user.goals.length)
    : 0;
  const habitAverage = data.user.habits.length
    ? Math.round(data.user.habits.reduce((sum, habit) => sum + habit.consistency, 0) / data.user.habits.length)
    : 0;
  const reflectionAverage = data.user.reflections.length
    ? Math.round(data.user.reflections.reduce((sum, reflection) => sum + reflection.score, 0) / data.user.reflections.length)
    : 0;
  const keystoneAverage = data.keystoneActions.length
    ? Math.round((data.completedKeystoneCount / data.keystoneActions.length) * 100)
    : 0;
  const executionSignals = [
    ...(data.user.goals.length ? [goalAverage] : []),
    ...(data.user.habits.length ? [habitAverage] : []),
    ...(data.keystoneActions.length ? [keystoneAverage] : []),
  ];
  const executionAverage = executionSignals.length
    ? Math.round(executionSignals.reduce((sum, value) => sum + value, 0) / executionSignals.length)
    : 0;
  const reflectionModifier = data.user.reflections.length ? Math.round((reflectionAverage - 5) * 4) : 0;
  const consistency = Math.max(0, Math.min(100, executionAverage + reflectionModifier));

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TrendCard
          label="Goals"
          value={data.user.goals.length ? `${goalAverage}%` : "No goals yet"}
          detail="Goal progress is derived automatically from completed keystone actions that were linked to each goal."
          source={
            data.user.goals.length
              ? "Source: completed goal keystone actions from recent daily plans"
              : "Source: no goals yet"
          }
        />
        <TrendCard
          label="Health habits"
          value={data.user.habits.length ? `${habitAverage}%` : "No habits yet"}
          detail="Habit consistency is derived automatically from completed keystone actions linked to build and reduce habits."
          source={
            data.user.habits.length
              ? "Source: completed habit keystone actions from recent daily plans"
              : "Source: no habits yet"
          }
        />
        <TrendCard
          label="Consistency"
          value={executionSignals.length ? `${consistency}%` : "No data yet"}
          detail="This is mostly built from completed work, then lightly adjusted by how aligned your reflections say the days actually felt."
          source={
            `Source: ${
              [
                data.user.goals.length ? "goals" : null,
                data.user.habits.length ? "habits" : null,
                data.keystoneActions.length ? "keystone actions" : null,
                data.user.reflections.length ? "reflections" : null,
              ]
                .filter(Boolean)
                .join(" + ") || "no tracked inputs yet"
            }`
          }
        />
        <TrendCard
          label="Keystone follow-through"
          value={data.keystoneActions.length ? `${keystoneAverage}%` : "No plan yet"}
          detail="This measures how many of today’s keystone actions you actually marked complete."
          source={
            data.keystoneActions.length
              ? `Source: ${data.completedKeystoneCount}/${data.keystoneActions.length} keystone actions completed`
              : "Source: no daily plan yet"
          }
        />
        <TrendCard
          label="Reflections"
          value={data.user.reflections.length ? `${reflectionAverage}/10` : "No data yet"}
          detail="This score comes directly from your saved evening reflections and shows whether your days felt aligned."
          source={`Source: ${data.user.reflections.length} saved reflection ${data.user.reflections.length === 1 ? "entry" : "entries"}`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Trajectory view</CardTitle>
          <CardDescription>
            Lightweight progress, intentionally free of noise. This view now updates itself from the tasks you complete on the home screen.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {data.user.goals.map((goal) => (
            <div key={goal.id} className="rounded-3xl border border-border/70 bg-white/70 p-5">
              <div className="flex items-center justify-between">
                <p className="font-medium">{goal.title}</p>
                <span className="text-sm text-muted-foreground">{goal.progress}% complete</span>
              </div>
              <div className="mt-4 h-2 rounded-full bg-secondary">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${goal.progress}%` }} />
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{goal.description}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Source: days when a keystone action targeted this goal and was completed
              </p>
            </div>
          ))}
          {data.user.habits.map((habit) => (
            <div key={habit.id} className="rounded-3xl border border-border/70 bg-white/70 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{habit.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    {habit.direction === "BUILD" ? "Build habit" : "Reduce habit"}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">{habit.consistency}% consistent</span>
              </div>
              <div className="mt-4 h-2 rounded-full bg-secondary">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${habit.consistency}%` }} />
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {habit.direction === "BUILD"
                  ? "This rises when you complete keystone actions designed to reinforce this habit."
                  : "This rises when you complete keystone actions designed to reduce this pattern."}
              </p>
              <p className="mt-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Source: days when a keystone action targeted this habit and was completed
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
