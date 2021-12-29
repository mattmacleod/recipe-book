import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ParsedUrlQuery } from 'querystring';
import { createContext, useContext } from 'react';
import { plural } from 'pluralize';

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
    <Layout title={ recipe.name }>
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
        { formatServings(recipe) }
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
  return (
    <li>
      <span className={ styles.quantity }>
        { formatIngredientQuantity(ingredient) }
      </span>
      <span className={ styles.name }>
        { formatIngredientName(ingredient) }
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

// Extract the quantity and unit from an ingredient and format appropriately
const formatIngredientQuantity = (ingredient: Ingredient): string => {
  switch (ingredient.unit) {

    // Format a weight as either grams or kilograms
    case IngredientUnit.weight:
      if (ingredient.quantity > 1000) {
        return `${ ingredient.quantity / 1000 }kg`;
      } else {
        return `${ ingredient.quantity }g`;
      }

    // Format a volume as either millilitres or litres, with special handling
    // for teaspoon and tablespoon sizes
    case IngredientUnit.volume:
      if (ingredient.quantity > 1000) {
        return `${ ingredient.quantity / 1000 } litres`;

      } else if (ingredient.quantity <= 60 && ingredient.quantity % 7.5 === 0) {
        // Render teaspoons with 1/2 tbsp (7.5ml) precision
        const val = ingredient.quantity / 15;
        return `${ val } tbsp`;

      } else if (ingredient.quantity <= 30 && ingredient.quantity % 1.25 === 0) {
        // Render teaspoons with 1/4 tsp (1.25ml) precision
        const val = ingredient.quantity / 5;
        return `${ val } tsp`;

      } else {
        return `${ ingredient.quantity }ml`;
      }

    // Count just displays the number of items
    case IngredientUnit.count:
      return ingredient.quantity.toString();

    // Other type displays the number of units with the unit description
    case IngredientUnit.other:
      return `${ ingredient.quantity } ${ ingredient.unitDescription }`;

    // Render no specific quantity
    case IngredientUnit.none:
      return ingredient.unitDescription;
  }
};

const formatIngredientName = (ingredient: Ingredient): string => {
  if (ingredient.unit === IngredientUnit.count) {
    return ingredient.quantity === 1 ? ingredient.name : plural(ingredient.name);
  } else {
    return ingredient.name;
  }
}

const formatServings = (recipe: Recipe): string => {
  if (recipe.servings.description) {
    const count = recipe.servings.count;
    return `${ count } ${ count > 1 ? plural(recipe.servings.description) : recipe.servings.description }`;
  } else {
    return recipe.servings.count.toString();
  }
}

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
