import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { ParsedUrlQuery } from 'querystring';

import Layout from '/components/layout';

import { getAllRecipes, getRecipeBySlug, Recipe } from '/lib/data';

import styles from './recipe.module.scss';

interface StaticProps {
  recipe: Recipe;
}

interface StaticPropsParams extends ParsedUrlQuery {
  slug: string;
}

const RecipePage = ({ recipe }: { recipe: Recipe }) => {
  return (
    <Layout>
      <article className={ styles.article }>
        <Header recipe={ recipe } />
        <Stats recipe={ recipe } />
        <Intro recipe={ recipe } />

        <div className={ styles.mainContent }>

          <div className={ styles.requirements }>
            <Equipment recipe={ recipe } />
            <Ingredients recipe={ recipe } />
          </div>

          <Directions recipe={ recipe } />
        </div>
      </article>
    </Layout>
  );
};

const Header = ({ recipe }: { recipe: Recipe }) => {
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

const Stats = ({ recipe }: { recipe: Recipe }) => {
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

const Equipment = ({ recipe }: { recipe: Recipe }) => {
  return (
    <section className={ styles.equipment }>
      <h3>Equipment</h3>
      <ul>
        { recipe.equipment.map((v, i) => <li key={ i }>{ v }</li>) }
      </ul>
    </section>
  );
};

const Ingredients = ({ recipe }: { recipe: Recipe }) => {
  return (
    <section className={ styles.ingredients }>
      <h3>Ingredients</h3>
      <ul>
        { recipe.ingredients.map((value, i) => <li key={ i }>{ JSON.stringify(value) }</li>) }
      </ul>
    </section>
  );
};

const Directions = ({ recipe }: { recipe: Recipe }) => {
  return (
    <section className={ styles.directions }>
      <h3>Directions</h3>
      <ol>
          { recipe.steps.map((s, i) => <li key={ i }>{ s }</li>) }
      </ol>
    </section>
  );
};

const Intro = ({ recipe }: { recipe: Recipe }) => {
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

// GGet an individual recipe
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
