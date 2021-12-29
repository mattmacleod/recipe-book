export interface Recipe {
  slug: string;
  name: string;
  tags: string[];
  image: string | null;
  servings: { count: number; description: string | null };
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

export type IngredientQuantity = QuantityWithKnownUnit | QuantityWithUnknownUnit | QuantityWithNoUnit;

export type Ingredient = {
  name: string
} & IngredientQuantity;

export enum IngredientUnit {
  weight,
  volume,
  count,
  other,
  none,
}

export interface QuantityWithKnownUnit {
  unit: IngredientUnit.weight | IngredientUnit.volume | IngredientUnit.count;
  quantity: number;
}

export interface QuantityWithUnknownUnit {
  unit: IngredientUnit.other;
  quantity: number;
  unitDescription: string;
}

export interface QuantityWithNoUnit {
  unit: IngredientUnit.none;
  unitDescription: string;
}
