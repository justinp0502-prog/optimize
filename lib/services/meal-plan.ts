type MealPlanInput = {
  mealPreferences: string;
  restrictions: string;
  cookingStyle: string;
};

const templates = [
  {
    dayLabel: "Monday",
    mealType: "Dinner",
    title: "Lemon chicken grain bowl",
    description: "Roasted chicken, quinoa, cucumber, herbs, and yogurt-free lemon dressing.",
    category: "Protein + Grain",
    groceries: [
      { label: "Chicken thighs", category: "PROTEIN", quantity: "1.5 lb" },
      { label: "Quinoa", category: "PANTRY", quantity: "1 bag" },
      { label: "Cucumber", category: "PRODUCE", quantity: "2" },
      { label: "Parsley", category: "PRODUCE", quantity: "1 bunch" }
    ]
  },
  {
    dayLabel: "Tuesday",
    mealType: "Dinner",
    title: "Turkey taco lettuce cups",
    description: "Ground turkey with avocado, salsa, black beans, and crunchy lettuce.",
    category: "Fast",
    groceries: [
      { label: "Ground turkey", category: "PROTEIN", quantity: "1 lb" },
      { label: "Romaine hearts", category: "PRODUCE", quantity: "3" },
      { label: "Black beans", category: "PANTRY", quantity: "2 cans" },
      { label: "Avocados", category: "PRODUCE", quantity: "2" }
    ]
  },
  {
    dayLabel: "Wednesday",
    mealType: "Dinner",
    title: "Salmon, potatoes, and green beans",
    description: "Sheet-pan salmon with crisp potatoes and garlicky green beans.",
    category: "Sheet Pan",
    groceries: [
      { label: "Salmon fillets", category: "PROTEIN", quantity: "4 fillets" },
      { label: "Baby potatoes", category: "PRODUCE", quantity: "1.5 lb" },
      { label: "Green beans", category: "PRODUCE", quantity: "12 oz" },
      { label: "Garlic", category: "PRODUCE", quantity: "1 bulb" }
    ]
  },
  {
    dayLabel: "Thursday",
    mealType: "Dinner",
    title: "Soba veggie stir-fry",
    description: "Buckwheat noodles with tofu, peppers, spinach, and sesame sauce.",
    category: "Varied",
    groceries: [
      { label: "Soba noodles", category: "PANTRY", quantity: "2 packs" },
      { label: "Extra-firm tofu", category: "PROTEIN", quantity: "2 blocks" },
      { label: "Bell peppers", category: "PRODUCE", quantity: "3" },
      { label: "Spinach", category: "PRODUCE", quantity: "1 bag" }
    ]
  },
  {
    dayLabel: "Friday",
    mealType: "Dinner",
    title: "Steak and sweet potato salad",
    description: "Seared steak over arugula with roasted sweet potato and pumpkin seeds.",
    category: "Recovery",
    groceries: [
      { label: "Sirloin steak", category: "PROTEIN", quantity: "1 lb" },
      { label: "Sweet potatoes", category: "PRODUCE", quantity: "2 large" },
      { label: "Arugula", category: "PRODUCE", quantity: "1 box" },
      { label: "Pumpkin seeds", category: "PANTRY", quantity: "1 bag" }
    ]
  },
  {
    dayLabel: "Saturday",
    mealType: "Lunch",
    title: "Meal-prep Mediterranean boxes",
    description: "Chicken, hummus, carrots, olives, rice, and fruit packed for easy wins.",
    category: "Meal Prep",
    groceries: [
      { label: "Cooked chicken breast", category: "PROTEIN", quantity: "1.5 lb" },
      { label: "Hummus", category: "DAIRY", quantity: "1 tub" },
      { label: "Carrots", category: "PRODUCE", quantity: "1 bag" },
      { label: "Olives", category: "PANTRY", quantity: "1 jar" }
    ]
  },
  {
    dayLabel: "Sunday",
    mealType: "Dinner",
    title: "Slow cooker chili",
    description: "Turkey chili with beans, peppers, onions, and an easy reheat path.",
    category: "Batch Cook",
    groceries: [
      { label: "Ground turkey", category: "PROTEIN", quantity: "1 lb" },
      { label: "Kidney beans", category: "PANTRY", quantity: "2 cans" },
      { label: "Crushed tomatoes", category: "PANTRY", quantity: "2 cans" },
      { label: "Yellow onion", category: "PRODUCE", quantity: "2" }
    ]
  }
];

export function generateMealPlan(input: MealPlanInput) {
  const meals = templates.map((meal) => ({
    ...meal,
    description: `${meal.description} Built for ${input.cookingStyle.toLowerCase()} cooking, with ${input.mealPreferences.toLowerCase()} in mind and adjusted for ${input.restrictions.toLowerCase()}.`,
  }));

  return { meals };
}

const swapMap: Record<
  string,
  {
    title: string;
    description: string;
    category: string;
    groceries: { label: string; category: string; quantity: string }[];
  }
> = {
  "Lemon chicken grain bowl": {
    title: "Herby turkey rice bowl",
    description: "Ground turkey, jasmine rice, cucumber, mint, and a quick lemon vinaigrette.",
    category: "Protein + Grain",
    groceries: [
      { label: "Ground turkey", category: "PROTEIN", quantity: "1.25 lb" },
      { label: "Jasmine rice", category: "PANTRY", quantity: "1 bag" },
      { label: "Cucumber", category: "PRODUCE", quantity: "2" },
      { label: "Fresh mint", category: "PRODUCE", quantity: "1 bunch" }
    ]
  },
  "Turkey taco lettuce cups": {
    title: "Chicken fajita bowls",
    description: "Chicken, peppers, rice, avocado, and a smoky weeknight skillet profile.",
    category: "Fast",
    groceries: [
      { label: "Chicken breast", category: "PROTEIN", quantity: "1.25 lb" },
      { label: "Bell peppers", category: "PRODUCE", quantity: "3" },
      { label: "White rice", category: "PANTRY", quantity: "1 bag" },
      { label: "Avocados", category: "PRODUCE", quantity: "2" }
    ]
  },
  "Salmon, potatoes, and green beans": {
    title: "Cod, rice, and asparagus",
    description: "Roasted cod with lemon rice and asparagus for a lighter midweek dinner.",
    category: "Sheet Pan",
    groceries: [
      { label: "Cod fillets", category: "PROTEIN", quantity: "4 fillets" },
      { label: "White rice", category: "PANTRY", quantity: "1 bag" },
      { label: "Asparagus", category: "PRODUCE", quantity: "2 bunches" },
      { label: "Lemon", category: "PRODUCE", quantity: "2" }
    ]
  },
  "Soba veggie stir-fry": {
    title: "Ginger chicken noodle skillet",
    description: "Quick chicken noodles with bok choy, carrots, and a ginger soy glaze.",
    category: "Varied",
    groceries: [
      { label: "Chicken thighs", category: "PROTEIN", quantity: "1.25 lb" },
      { label: "Rice noodles", category: "PANTRY", quantity: "2 packs" },
      { label: "Bok choy", category: "PRODUCE", quantity: "3 heads" },
      { label: "Carrots", category: "PRODUCE", quantity: "1 bag" }
    ]
  },
  "Steak and sweet potato salad": {
    title: "Chicken and roasted squash salad",
    description: "Warm chicken over greens with roasted squash, seeds, and mustard vinaigrette.",
    category: "Recovery",
    groceries: [
      { label: "Chicken thighs", category: "PROTEIN", quantity: "1.25 lb" },
      { label: "Delicata squash", category: "PRODUCE", quantity: "2" },
      { label: "Mixed greens", category: "PRODUCE", quantity: "1 box" },
      { label: "Sunflower seeds", category: "PANTRY", quantity: "1 bag" }
    ]
  },
  "Meal-prep Mediterranean boxes": {
    title: "Protein bento prep boxes",
    description: "Eggs, chicken, berries, cucumbers, crackers, and snackable meal-prep structure.",
    category: "Meal Prep",
    groceries: [
      { label: "Hard-boiled eggs", category: "PROTEIN", quantity: "8" },
      { label: "Cooked chicken breast", category: "PROTEIN", quantity: "1 lb" },
      { label: "Blueberries", category: "PRODUCE", quantity: "2 pints" },
      { label: "Seed crackers", category: "PANTRY", quantity: "1 box" }
    ]
  },
  "Slow cooker chili": {
    title: "Braised lentil turkey stew",
    description: "A softer batch-cook option with turkey, lentils, carrots, and tomatoes.",
    category: "Batch Cook",
    groceries: [
      { label: "Ground turkey", category: "PROTEIN", quantity: "1 lb" },
      { label: "Brown lentils", category: "PANTRY", quantity: "1 bag" },
      { label: "Carrots", category: "PRODUCE", quantity: "4" },
      { label: "Diced tomatoes", category: "PANTRY", quantity: "2 cans" }
    ]
  }
};

export function swapMealData(currentTitle: string) {
  return (
    swapMap[currentTitle] ?? {
      title: "Fresh seasonal plate",
      description: "A simple seasonal meal that keeps prep light and protein visible.",
      category: "Flexible",
      groceries: [
        { label: "Chicken breast", category: "PROTEIN", quantity: "1 lb" },
        { label: "Seasonal vegetables", category: "PRODUCE", quantity: "1 bag" },
        { label: "Rice or potatoes", category: "PANTRY", quantity: "1 bag" }
      ]
    }
  );
}
