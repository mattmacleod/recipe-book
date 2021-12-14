import styles from './index.module.scss';

import { GetStaticProps } from 'next';
import Link from 'next/link';

import Layout from '/components/layout'

import { Recipe } from '/lib/types';
import { getAllRecipes } from '/lib/data';

interface StaticProps {
  recipes: Recipe[];
}

const Home = ({ recipes }: { recipes: Recipe[] }) => {
  return (
    <Layout>
      <h2 className={ styles.header }>Recipes</h2>
      <ul className={ styles.recipes }>
        {
          recipes.map((r) => (
            <li key={ r.slug }>
              <Link href={ `/recipes/${ r.slug }` }>
                { r.name }
              </Link>
            </li>
          ))
        }
      </ul>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps<StaticProps> = () => {
  return {
    props: {
      recipes: getAllRecipes(),
    }
  };
};

export default Home
