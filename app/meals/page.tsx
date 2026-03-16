import { format } from "date-fns";
import { getDashboardData } from "@/lib/data";
import { regenerateMeals, swapMeal } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toTitleCase } from "@/lib/utils";

export default async function MealsPage() {
  const data = await getDashboardData();

  if (!data || !data.currentMealPlan) {
    return null;
  }

  const groceryGroups = data.currentMealPlan.meals.flatMap((meal) => meal.groceries).reduce<Record<string, typeof data.currentMealPlan.meals[number]["groceries"]>>((acc, item) => {
    const key = item.category;
    acc[key] = acc[key] ? [...acc[key], item] : [item];
    return acc;
  }, {});

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-3xl">Weekly meal plan</CardTitle>
            <CardDescription>Week of {format(data.weekOf ?? new Date(), "MMMM d")}.</CardDescription>
          </div>
          <form action={regenerateMeals}>
            <Button variant="secondary">Regenerate week</Button>
          </form>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.currentMealPlan.meals.map((meal) => (
            <div key={meal.id} className="rounded-3xl border border-border/70 bg-white/70 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    {meal.dayLabel} · {meal.mealType}
                  </p>
                  <p className="mt-2 font-serif text-2xl text-foreground">{meal.title}</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{meal.description}</p>
                </div>
                <form action={swapMeal.bind(null, meal.id)}>
                  <Button variant="ghost" className="w-full sm:w-auto">Swap</Button>
                </form>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Grocery list</CardTitle>
          <CardDescription>Categorized automatically from the current meal plan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {Object.entries(groceryGroups).map(([category, items]) => (
            <div key={category}>
              <p className="mb-3 text-xs uppercase tracking-[0.24em] text-muted-foreground">{toTitleCase(category)}</p>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-2xl bg-secondary/60 px-4 py-3 text-sm">
                    <span>{item.label}</span>
                    <span className="text-muted-foreground">{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
