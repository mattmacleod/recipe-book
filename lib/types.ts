export interface Recipe {
  slug: string;
  name: string;
  tags: string[];
  image: string;
  servings: number;
  prepTime: string;
  cookTime: string;
  equipment: string[];
  ingredients: IngredientGroup[];
  steps: string[];
  content: string;
}

export interface IngredientGroup {
  name: string;
  ingredients: Ingredient[];
}

export interface Ingredient {
  name: string;
  unit: IngredientUnit;
  quantity: number;
}

export enum IngredientUnit {
  weight, // Measured in grams
  volume, // Measured in millilitres
  count,  // Measued in units
  other,  // Unknown – treated as opaque string
}
