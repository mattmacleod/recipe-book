import fs from 'fs';
import path from 'path';
import sanitize from 'sanitize-filename';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const recipeDirectory = path.join(process.cwd(), 'recipes');

export interface Recipe {
  slug: string;
  name: string | null;
  content: string;
}

export const getRecipeFiles = () => {
  return fs.readdirSync(recipeDirectory);
}

export const getRecipeBySlug = (slug: string) => {
  const sanitizedSlug = sanitize(slug);
  const fullPath = path.join(recipeDirectory, `${ sanitizedSlug }.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    slug: sanitizedSlug,
    name: data.name || null,
    content: md2html(content),
  };
}

export const getAllRecipes = () =>{
  const fileNames = getRecipeFiles();
  const recipes = fileNames
    .map((f) => getRecipeBySlug(f.replace(/\.md$/, '')));

    return recipes;
}

export const md2html = (markdown: string) =>{
  const result = remark().use(html).processSync(markdown);
  return result.toString();
}
