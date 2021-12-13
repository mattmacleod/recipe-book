import fs from 'fs';
import path from 'path';
import sanitize from 'sanitize-filename';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const recipeDirectory = path.join(process.cwd(), 'recipes');

export interface Recipe {
  slug: string;
  name: string;
  tags: string[];
  image: string;
  servings: number;
  prepTime: string;
  cookTime: string;
  equipment: string[];
  ingredients: any[];
  steps: string[];
  content: string;
}

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
  if (!data.name) {
    throw new Error(`Recipe ${ slug } is missing a name.`);
  }

  return {
    slug: sanitizedSlug,
    name: data.name,
    tags: data.tags || [],
    image: data.image || null,
    servings: data.servings || 1,
    prepTime: data.prepTime || null,
    cookTime: data.cookTime || null,
    equipment: data.equipment || [],
    ingredients: data.ingredients || [],
    steps: data.steps || [],
    content: content ? md2html(content) : '',
  };
}
