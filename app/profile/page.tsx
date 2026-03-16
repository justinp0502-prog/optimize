import { getPrimaryUser } from "@/lib/data";
import { saveProfile } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TextAreaField, TextField } from "@/components/forms";

export default async function ProfilePage() {
  const user = await getPrimaryUser();

  if (!user || !user.profile) {
    return null;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Profile</CardTitle>
          <CardDescription>Editable context used by planning, meals, and nudge logic.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveProfile} className="grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField id="name" name="name" label="Name" defaultValue={user.name} />
              <TextField id="tone" name="tone" label="Assistant tone" defaultValue={user.profile.tone} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField id="wakeTime" name="wakeTime" type="time" label="Wake time" defaultValue={user.profile.wakeTime} />
              <TextField id="sleepTime" name="sleepTime" type="time" label="Sleep time" defaultValue={user.profile.sleepTime} />
            </div>
            <TextAreaField id="responsibilities" name="responsibilities" label="Responsibilities" defaultValue={user.profile.responsibilities} />
            <TextAreaField id="topPriorities" name="topPriorities" label="Top priorities" defaultValue={user.profile.topPriorities} />
            <TextAreaField id="goals" name="goals" label="Goals" defaultValue={user.goals.map((goal) => goal.title).join(", ")} />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextAreaField
                id="habitsBuild"
                name="habitsBuild"
                label="Habits to build"
                defaultValue={user.habits.filter((habit) => habit.direction === "BUILD").map((habit) => habit.title).join(", ")}
              />
              <TextAreaField
                id="habitsReduce"
                name="habitsReduce"
                label="Habits to reduce"
                defaultValue={user.habits.filter((habit) => habit.direction === "REDUCE").map((habit) => habit.title).join(", ")}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField id="mealPreferences" name="mealPreferences" label="Meal preferences" defaultValue={user.profile.mealPreferences} />
              <TextField id="dietaryRestrictions" name="dietaryRestrictions" label="Dietary restrictions" defaultValue={user.profile.dietaryRestrictions} />
            </div>
            <TextField id="cookingStyle" name="cookingStyle" label="Cooking style" defaultValue={user.profile.cookingStyle} />
            <Button className="w-full sm:w-auto">Update profile</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Current goals</CardTitle>
            <CardDescription>The app uses these to shape keystone actions and progress.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.goals.map((goal) => (
              <div key={goal.id} className="rounded-2xl bg-secondary/70 px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{goal.title}</p>
                  <span className="text-sm text-muted-foreground">{goal.progress}%</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{goal.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
