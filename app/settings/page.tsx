import { getDashboardData } from "@/lib/data";
import { updateSettings } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TextField } from "@/components/forms";

export default async function SettingsPage() {
  const data = await getDashboardData();

  if (!data || !data.user.profile || !data.user.nudgePreference) {
    return null;
  }

  const preference = data.user.nudgePreference;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Settings</CardTitle>
          <CardDescription>Control the tone, cadence, and boundaries of the assistant.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateSettings} className="grid gap-5">
            <TextField id="tone" name="tone" label="Assistant tone" defaultValue={data.user.profile.tone} />
            <div className="grid gap-3 rounded-3xl bg-secondary/60 p-4">
              <label className="flex items-center justify-between text-sm">
                <span>Enable nudges</span>
                <input type="checkbox" name="enabled" defaultChecked={preference.enabled} className="h-4 w-4" />
              </label>
              <label className="flex items-center justify-between text-sm">
                <span>Reminders</span>
                <input type="checkbox" name="reminderEnabled" defaultChecked={preference.reminderEnabled} className="h-4 w-4" />
              </label>
              <label className="flex items-center justify-between text-sm">
                <span>Encouragement</span>
                <input type="checkbox" name="encouragementEnabled" defaultChecked={preference.encouragementEnabled} className="h-4 w-4" />
              </label>
              <label className="flex items-center justify-between text-sm">
                <span>Accountability</span>
                <input type="checkbox" name="accountabilityEnabled" defaultChecked={preference.accountabilityEnabled} className="h-4 w-4" />
              </label>
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              <TextField id="cadence" name="cadence" type="number" min="1" max="5" label="Nudges per day" defaultValue={String(preference.cadence)} />
              <TextField id="quietHoursStart" name="quietHoursStart" type="time" label="Quiet hours start" defaultValue={preference.quietHoursStart} />
              <TextField id="quietHoursEnd" name="quietHoursEnd" type="time" label="Quiet hours end" defaultValue={preference.quietHoursEnd} />
            </div>
            <Button className="w-full sm:w-auto">Save settings</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Nudge preview</CardTitle>
          <CardDescription>Example prompts built with simple heuristics and local data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.sampleNudges.map((nudge) => (
            <div key={nudge.message} className="rounded-2xl border border-border/70 bg-white/70 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{nudge.label}</p>
              <p className="mt-2 text-sm leading-6">{nudge.message}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
