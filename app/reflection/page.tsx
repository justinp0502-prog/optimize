import { format } from "date-fns";
import { getPrimaryUser } from "@/lib/data";
import { clearReflectionHistory, saveReflection } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ReflectionPage() {
  const user = await getPrimaryUser();

  if (!user) {
    return null;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Log tonight</CardTitle>
          <CardDescription>Three short prompts that build trajectory without overthinking.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveReflection} className="space-y-4">
            <textarea
              name="moved"
              placeholder="What moved forward today?"
              className="min-h-28 w-full rounded-3xl border border-border bg-input px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <textarea
              name="felt"
              placeholder="How did you feel today?"
              className="min-h-28 w-full rounded-3xl border border-border bg-input px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <textarea
              name="aligned"
              placeholder="Did today feel aligned with the life you want?"
              className="min-h-28 w-full rounded-3xl border border-border bg-input px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button className="w-full">Save entry</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-3xl">History</CardTitle>
            <CardDescription>Recent entries stay visible so the app feels like a companion, not a scratchpad.</CardDescription>
          </div>
          {user.reflections.length ? (
            <form action={clearReflectionHistory}>
              <Button variant="secondary">Clear history</Button>
            </form>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          {user.reflections.length ? (
            user.reflections.map((reflection) => (
              <div key={reflection.id} className="rounded-3xl border border-border/70 bg-white/70 p-5">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{format(reflection.date, "EEEE, MMM d")}</p>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs">{reflection.score}/10 aligned</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground"><strong className="text-foreground">Moved:</strong> {reflection.moved}</p>
                <p className="mt-2 text-sm text-muted-foreground"><strong className="text-foreground">Felt:</strong> {reflection.felt}</p>
                <p className="mt-2 text-sm text-muted-foreground"><strong className="text-foreground">Aligned:</strong> {reflection.aligned}</p>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-white/50 p-6">
              <p className="font-medium text-foreground">No reflection history yet.</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Your first saved reflection will show up here. The seeded demo entries have been removed.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
