import { getPrimaryUser } from "@/lib/data";
import { saveProfile } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TextAreaField, TextField } from "@/components/forms";

export default async function OnboardingPage() {
  const user = await getPrimaryUser();
  const profile = user?.profile;

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Life profile</CardTitle>
          <CardDescription>
            This setup gives Optimize enough context to make daily structure, meals, nudges, and reflections feel believable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveProfile} className="grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <TextField id="name" name="name" label="Name" defaultValue={user?.name ?? ""} />
              <TextField id="tone" name="tone" label="Assistant tone" defaultValue={profile?.tone ?? "SUPPORTIVE"} description="Supportive, direct, analytical, or challenging." />
              <TextField id="wakeTime" name="wakeTime" type="time" label="Wake time" defaultValue={profile?.wakeTime ?? "06:30"} />
              <TextField id="sleepTime" name="sleepTime" type="time" label="Sleep time" defaultValue={profile?.sleepTime ?? "22:30"} />
            </div>

            <TextAreaField
              id="responsibilities"
              name="responsibilities"
              label="Work blocks and responsibilities"
              defaultValue={profile?.responsibilities ?? ""}
            />
            <TextAreaField
              id="goals"
              name="goals"
              label="Goals"
              description="Comma-separated is fine."
              defaultValue={user?.goals.map((goal) => goal.title).join(", ") ?? ""}
            />
            <div className="grid gap-5 md:grid-cols-2">
              <TextAreaField
                id="habitsBuild"
                name="habitsBuild"
                label="Habits to build"
                defaultValue={user?.habits.filter((habit) => habit.direction === "BUILD").map((habit) => habit.title).join(", ") ?? ""}
              />
              <TextAreaField
                id="habitsReduce"
                name="habitsReduce"
                label="Habits to reduce"
                defaultValue={user?.habits.filter((habit) => habit.direction === "REDUCE").map((habit) => habit.title).join(", ") ?? ""}
              />
            </div>
            <TextAreaField
              id="mealPreferences"
              name="mealPreferences"
              label="Meal preferences"
              defaultValue={profile?.mealPreferences ?? ""}
            />
            <div className="grid gap-5 md:grid-cols-2">
              <TextField
                id="dietaryRestrictions"
                name="dietaryRestrictions"
                label="Dietary restrictions"
                defaultValue={profile?.dietaryRestrictions ?? ""}
              />
              <TextField id="cookingStyle" name="cookingStyle" label="Cooking style" defaultValue={profile?.cookingStyle ?? "Simple"} />
            </div>
            <TextAreaField
              id="topPriorities"
              name="topPriorities"
              label="Top priorities right now"
              defaultValue={profile?.topPriorities ?? ""}
            />
            <Button className="w-full sm:w-auto">Save profile</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
