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

const HeaderImage = () => {
  const recipe = useRecipe();

  if (!recipe.image) return null;

  return (
    <div className={ styles.headerImage }>
      <Image src={ recipe.image } alt={ recipe.name } layout='fill' objectFit='cover' />
    </div>
  );
};

const Header = () => {
  const recipe = useRecipe();

  return (
    <header className={ styles.header }>
      <div className={ styles.breadcrumbs }>
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

const Stats = () => {
  const recipe = useRecipe();

  const servings = recipe.servings && (
    <li>
      <span className={ styles.label }>
        Servings
      </span>
      <span className={ styles.value }>
        { recipe.servings }
      </span>
    </li>
  );

  const prepTime = recipe.prepTime && (
    <li>
      <span className={ styles.label }>
        Prep time
      </span>
      <span className={ styles.value }>
        { recipe.prepTime }
      </span>
    </li>
  );

  const cookTime = recipe.cookTime && (
    <li>
      <span className={ styles.label }>
        Cooking time
      </span>
      <span className={ styles.value }>
        { recipe.cookTime }
      </span>
    </li>
  );

  return (
    <section className={ styles.stats }>
      <ul>
        { servings }
        { prepTime }
        { cookTime }
      </ul>
    </section>
  );
};

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

const IngredientList = ({ ingredients }: { ingredients: Ingredient[] }) => {
  return (
    <ul>
      { ingredients.map((i, idx) => <IngredientItem ingredient={ i } key={ idx } /> ) }
    </ul>
  );
};

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
