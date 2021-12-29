import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ParsedUrlQuery } from 'querystring';
import { createContext, useContext } from 'react';

import Layout from '/components/layout';

import { getAllRecipes, getRecipeBySlug } from '/lib/data';
import { Recipe, Ingredient, IngredientUnit } from '/lib/types';

import styles from './recipe.module.scss';

const recipeContext = createContext<Recipe | null>(null);
const useRecipe = () => useContext(recipeContext)!;

interface StaticProps {
  recipe: Recipe;
}

interface StaticPropsParams extends ParsedUrlQuery {
  slug: string;
}

const RecipePage = ({ recipe }: { recipe: Recipe }) => {
  return (
    <Layout>
      <recipeContext.Provider value={ recipe }>
        <article className={ styles.article }>
          <Header />
          <HeaderImage />
          <Stats />
          <Intro />

          <div className={ styles.mainContent }>

            <div className={ styles.requirements }>
              <Equipment />
              <Ingredients />
            </div>

            <Directions />
          </div>
        </article>
      </recipeContext.Provider>
    </Layout>
  );
};

// Image block at the top of the page
const HeaderImage = () => {
  const recipe = useRecipe();

  if (!recipe.image) return null;

  return (
    <div className={ styles.headerImage }>
      <Image src={ recipe.image } alt={ recipe.name } layout='fill' objectFit='cover' />
    </div>
  );
};

// Header element containing the recipe name and link to the home page
const Header = () => {
  const recipe = useRecipe();

  return (
    <header className={ styles.header }>
      <div className={ styles.backLink }>
        <Link href='/'>
          <a>
            &larr; Home
          </a>
        </Link>
      </div>
      <h2>{ recipe.name }</h2>
    </header>
  );
};

// Stats block containing the recipe time and serving count
const Stats = () => {
  const recipe = useRecipe();

  const servings = recipe.servings && (
    <tr>
      <th>
        Servings
      </th>
      <td>
        { recipe.servings }
      </td>
    </tr>
  );

  const prepTime = recipe.prepTime && (
    <tr>
      <th>
        Prep time
      </th>
      <td>
        { recipe.prepTime }
      </td>
    </tr>
  );

  const cookTime = recipe.cookTime && (
    <tr>
      <th>
        Cooking time
      </th>
      <td>
        { recipe.cookTime }
      </td>
    </tr>
  );

  return (
    <section className={ styles.stats }>
      <table>
        <tbody>
          { servings }
          { prepTime }
          { cookTime }
        </tbody>
      </table>
    </section>
  );
};

// List of required equipment
const Equipment = () => {
  const recipe = useRecipe();

  return (
    <section className={ styles.equipment }>
      <h3>Equipment</h3>
      <ul>
        { recipe.equipment.map((v, i) => <li key={ i }>{ v }</li>) }
      </ul>
    </section>
  );
};


// List of required ingredients, sorted by group as required
const Ingredients = () => {
  const recipe = useRecipe();

  const ingredients = recipe.ingredients.length === 1 ? (
    <IngredientList ingredients={ recipe.ingredients[0].ingredients } />
    ) : (
      recipe.ingredients.map((g) => (
        <div className={ styles.group } key={ g.name }>
          <h4>{ g.name }</h4>
          <IngredientList ingredients={ g.ingredients } />
        </div>
      )
    )
  );

  return (
    <section className={ styles.ingredients }>
      <h3>Ingredients</h3>
      { ingredients }
    </section>
  );
};

// An individual list of ingredients for a single group
const IngredientList = ({ ingredients }: { ingredients: Ingredient[] }) => {
  return (
    <ul>
      { ingredients.map((i, idx) => <IngredientItem ingredient={ i } key={ idx } /> ) }
    </ul>
  );
};

// An individual ingredient item
const IngredientItem = ({ ingredient }: { ingredient: Ingredient }) => {
  const unit = (
    ingredient.unit === IngredientUnit.weight ? 'grams' :
    ingredient.unit === IngredientUnit.volume ? 'ml' :
    ''
  )
  const quantity = ingredient.quantity;

  return (
    <li>
      <span className={ styles.quantity }>
        { quantity } { unit }
      </span>
      <span className={ styles.name }>
        { ingredient.name }
      </span>
    </li>
  );
};

// The overall recipe directions
const Directions = () => {
  const recipe = useRecipe();

  return (
    <section className={ styles.directions }>
      <h3>Directions</h3>
      <ol>
          { recipe.steps.map((s, i) => <li key={ i }>{ s }</li>) }
      </ol>
    </section>
  );
};

// A short introduction to the recipe
const Intro = () => {
  const recipe = useRecipe();

  return (
    <section className={ styles.intro } dangerouslySetInnerHTML={{ __html: recipe.content }} />
  );
};

// Return a list of all known recipes
export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: getAllRecipes().map((r) => ({ params: { slug: r.slug } })),
    fallback: 'blocking'
  };
};

// Get an individual recipe
export const getStaticProps: GetStaticProps<StaticProps> = ({ params }) => {
  const recipe = getRecipeBySlug((params as StaticPropsParams).slug);
  if (!recipe) {
    return { notFound: true };
  }

  return {
    props: {
      recipe,
    }
  };
};

export default RecipePage;
