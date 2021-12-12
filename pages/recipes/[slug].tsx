import { GetStaticPaths, GetStaticProps } from 'next';
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
        <header className={ styles.header }>
          <h2>{ recipe.name }</h2>
        </header>
        <section className={ styles.stats }>
          <dl>
            <dt>Servings</dt>
            <dd>{ recipe.servings }</dd>
            <dt>Prep time</dt>
            <dd>{ recipe.prepTime }</dd>
            <dt>Cooking time</dt>
            <dd>{ recipe.cookTime }</dd>
          </dl>
        </section>

        <section className={ styles.intro } dangerouslySetInnerHTML={{ __html: recipe.content }} />

        <div className={ styles.mainContent }>

          <div className={ styles.requirements }>
            <section className={ styles.equipment }>
              <h3>Equipment.</h3>
              <ul>
                { recipe.equipment.map((v, i) => <li key={ i }>{ v }</li>) }
              </ul>
            </section>
            <section className={ styles.ingredients }>
              <h3>Ingredients.</h3>
              <ul>
                { recipe.ingredients.map((value, i) => <li key={ i }>{ JSON.stringify(value) }</li>) }
              </ul>
            </section>
          </div>

          <section className={ styles.directions }>
            <h3>Directions.</h3>
            <ol>
                { recipe.steps.map((s, i) => <li key={ i }>{ s }</li>) }
            </ol>
          </section>
        </div>
      </article>
    </Layout>
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
