import fs from 'fs';
import path from 'path';
import sanitize from 'sanitize-filename';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { singular } from 'pluralize';

import { IngredientGroup, Recipe, Ingredient, IngredientUnit, IngredientQuantity, Category } from './types';

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

// Get all recipe categories.
export const getRecipesByCategory = (): Record<string, Category> => {
  const recipes = getAllRecipes();
  const categories: Record<string, Category> = {};

  recipes.forEach((r) => {
    r.tags.forEach((c) => {
      const slug = sanitize(c).toLowerCase();
      if (!categories[slug]) categories[slug] = {
        slug: slug,
        name: c,
        recipes: [],
      };

      categories[c].recipes.push(r);
    });
  });

  return categories;
};

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
  validateRecipeData(data);

  return {
    slug: sanitizedSlug,
    name: data.name,
    tags: data.tags || [],
    image: imageURL(data.image),
    servings: parseServings(data.servings),
    prepTime: data.prepTime || null,
    cookTime: data.cookTime || null,
    equipment: data.equipment || [],
    ingredients: parseIngredients(data.ingredients),
    steps: data.steps || [],
    content: content ? md2html(content) : '',
  };
}

// Validate data as being suitable for a recipe. Throws if it isn't.
const validateRecipeData = (data: Record<string, any>) => {
  if (!data.name || !(typeof data.name === 'string')) throw new Error('Recipe must have a valid name');
  if (data.tags && !(Array.isArray(data.tags))) throw new Error('Recipe tags must be a list');
  if (data.image && !(typeof data.image === 'string')) throw new Error('Recipe contains inalid image path');
  if (data.prepTime && !(typeof data.prepTime === 'string')) throw new Error('Recipe must have valid prep time');
  if (data.cookTime && !(typeof data.cookTime === 'string')) throw new Error('Recipe must have valid cook time');
  if (data.equipment && !(Array.isArray(data.equipment))) throw new Error('Recipe equipment must be a list');
  if (!data.steps && !(Array.isArray(data.steps))) throw new Error('Recipe must contain a list of steps');
  if (data.content && !(typeof data.content === 'string')) throw new Error('Recipe must contain vaild content');
};

const parseServings = (servings: any): { count: number, description: string | null } => {
  if (typeof servings === 'number') {
    return {
      count: servings,
      description: null,
    };

  } else if (typeof servings === 'string') {
    const match = servings.match(/^(\d+)\s*(.*)$/);

    if (match) {
      const count = parseInt(match[1]);
      const description = count > 1 ? singular(match[2]) : match[2];
      return { count, description };
    }
  }

  throw new Error(`Unable to parse servings: ${ JSON.stringify(servings) }`);
};

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
    let name = Object.keys(i)[0];
    let quantity: IngredientQuantity;

    if (name === '0') {
      // This is an arbitrary ingredient with no quantity.
      quantity = parseQuantity(i);
      name = '';
    } else {
      quantity = parseQuantity(i[name]);
    }

    // Singularlize the name of the ingredient iff it's a "count" unit and the
    // quantity is not == 1.
    if (quantity.unit === IngredientUnit.count && quantity.quantity !== 1) {
      name = singular(name);
    }

    return Object.assign({ name }, quantity);
  });
};

const parseQuantity = (rawQuantity: any): IngredientQuantity => {
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

const parseStringQuantity = (rawQuantity: string): IngredientQuantity => {

  // Find common weight types
  const weightMatch = rawQuantity.match(/^([\d\.]+)\s*(g|kg|grams|kilograms)$/i);
  if (weightMatch) {
    const quantity = parseFloat(weightMatch[1]);
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
  const volumeMatch = rawQuantity.match(/^([\d\.]+)\s*(l|ml|litre|millilitre|tsp|teaspoon|tbsp|tablespoon)s?$/i);
  if (volumeMatch) {
    const quantity = parseFloat(volumeMatch[1]);
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
  const otherMatch = rawQuantity.match(/^([\d\.]+)\s*(.+)$/i);
  if (otherMatch) {
    const quantity = parseFloat(otherMatch[1]);
    const description = otherMatch[2].toLowerCase();
    const unitDescription = quantity == 1 ? description : singular(description);

    return {
      unit: IngredientUnit.other,
      quantity,
      unitDescription,
    };
  }

  // Unitless type
  return {
    unit: IngredientUnit.none,
    unitDescription: rawQuantity,
  }
};

const imageURL = (path: any): string | null => {
  if (typeof path === 'string') return `/images/recipes/${ path }`;
  return null;
}
