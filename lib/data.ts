import fs from 'fs';
import path from 'path';
import sanitize from 'sanitize-filename';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

import { IngredientGroup, Recipe, Ingredient, IngredientUnit } from './types';

const recipeDirectory = path.join(process.cwd(), 'recipes');


// Return a list of all recipe files in the recipe listing directory.
export const getRecipeFiles = () => {
  return fs.readdirSync(recipeDirectory);
}

// Get all recipes from disk by loading all recipe files and parsing them.
export const getAllRecipes = (): Recipe[] =>{
  const recipes: Recipe[] = [];
  getRecipeFiles()
    .map((f) => f.replace(/\.md$/, ''))
    .forEach((f) => {
      const recipe = getRecipeBySlug(f);
      if (recipe) recipes.push(recipe);
    }
  );

  return recipes;
}

// Parse Markdown content and render it to HTML.
export const md2html = (markdown: string) =>{
  return remark()
    .use(html)
    .processSync(markdown)
    .toString();
}

// Given a recipe slug, load the content of the recipe from disk. Returns null
// if the recipe doesn't exist.
export const getRecipeBySlug = (slug: string): Recipe | null => {

  // Get the full on-disk path to the recipe.
  const sanitizedSlug = sanitize(slug);
  const fullPath = path.join(recipeDirectory, `${ sanitizedSlug }.md`);

  // Load the content – returning null if the file can't be found or read.
  let fileContents: string;
  try {
    fileContents = fs.readFileSync(fullPath, 'utf8');
  } catch (e) {
    return null;
  }

  // Parse the data from the file's front matter, and the content of the file.
  const { data, content } = matter(fileContents);

  // Validate the content of the data and raise an error at this stage if it is
  // not valid.
  if (!data.name) throw new Error(`Recipe ${ slug } is missing a name.`);
  // TODO: additional validation

  return {
    slug: sanitizedSlug,
    name: data.name,
    tags: data.tags || [],
    image: data.image || null,
    servings: data.servings || 1,
    prepTime: data.prepTime || null,
    cookTime: data.cookTime || null,
    equipment: data.equipment || [],
    ingredients: parseIngredients(data.ingredients),
    steps: data.steps || [],
    content: content ? md2html(content) : '',
  };
}

// Parse raw ingredients from the recipe's front matter.
const parseIngredients = (rawIngredients: any): IngredientGroup[] => {
  const ingredients = rawIngredients as Record<string, any>[] | Record<string, Record<string, any>[]>;

  if (Array.isArray(ingredients)) {
    return [{
      name: 'Ingredients',
      ingredients: parseIngredientList(ingredients),
    }];
  } else {
    return Object.keys(ingredients).map((key) => ({
      name: key,
      ingredients: parseIngredientList(ingredients[key]),
    }));
  }
};

const parseIngredientList = (ingredients: Record<string, any>[]): Ingredient[] => {
  return ingredients.map((i) => {
    const name = Object.keys(i)[0];
    const rawQuantity = i[name];
    const { quantity, unit } = parseQuantity(rawQuantity);

    return {
      name,
      quantity,
      unit,
    }
  });
};

const parseQuantity = (rawQuantity: any) => {
  if (typeof rawQuantity === 'number') {
    return {
      quantity: rawQuantity,
      unit: IngredientUnit.count,
    };
  } else if (typeof rawQuantity === 'string') {
    return parseStringQuantity(rawQuantity);
  } else {
    throw new Error(`Unable to parse quantity: ${ JSON.stringify(rawQuantity) }`);
  }
};

const parseStringQuantity = (rawQuantity: string): { quantity: number, unit: IngredientUnit } => {

  // Find common weight types
  const weightMatch = rawQuantity.match(/^(\d+)\s*(g|kg|grams|kilograms)$/i);
  if (weightMatch) {
    const quantity = parseInt(weightMatch[1]);
    switch (weightMatch[2].toLowerCase()) {
      case 'g':
      case 'grams':
        return { quantity, unit: IngredientUnit.weight };
      case 'kg':
      case 'kilograms':
        return { quantity: quantity * 1000, unit: IngredientUnit.weight };
    }
  }

  // Find common volume types
  const volumeMatch = rawQuantity.match(/^(\d+)\s*(l|ml|litre|millilitre|tsp|teaspoon|tbsp|tablespoon)s?$/i);
  if (volumeMatch) {
    const quantity = parseInt(volumeMatch[1]);
    switch (volumeMatch[2].toLowerCase()) {
      case 'ml':
      case 'millilitre':
        return { quantity: quantity, unit: IngredientUnit.volume };
      case 'l':
      case 'litre':
        return { quantity: quantity * 1000, unit: IngredientUnit.volume };
      case 'tsp':
      case 'teaspoon':
        return { quantity: quantity * 5, unit: IngredientUnit.volume };
      case 'tbsp':
      case 'tablespoon':
        return { quantity: quantity * 15, unit: IngredientUnit.volume };
    }
  }

  // Unkown type
  return {
    quantity: 1,
    unit: IngredientUnit.other,
  }
};