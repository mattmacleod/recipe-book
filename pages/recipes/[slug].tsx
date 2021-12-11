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
          <h2>{ recipe.name } </h2>
        </header>
        <section className={ styles.body } dangerouslySetInnerHTML={{ __html: recipe.content }} />
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
