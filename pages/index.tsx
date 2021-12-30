import styles from './index.module.scss';

import { GetStaticProps } from 'next';
import Link from 'next/link';

import Layout from '/components/layout'

import { Category } from '/lib/types';
import { getRecipesByCategory } from '/lib/data';

interface StaticProps {
  categories: Record<string, Category>;
}

const Home = ({ categories }: { categories: Record<string, Category> }) => {
  return (
    <Layout>
      <section className={ styles.intro }>
        <div className={ styles.introText }>
          <header>
            <h2>Hello there!</h2>
          </header>
          <p>Welcome to my recipe book. I&apos;m <a href='https://github.com/mattmacleod' target='_blank' rel='noreferrer'>@mattmacleod</a>, and this is a small web application I use to store and publish recipes I use. You can <Link href='/about'>read more about this site</Link> or choose one of the recipes below.</p>
        </div>
      </section>
      <div className={ styles.categories }>
        { Object.keys(categories).sort().map((k) => <Category key={ k } category={ categories[k] } />) }
      </div>
    </Layout>
  )
}

const Category = ({ category }: { category: Category }) => {
  return (
    <article className={ styles.category }>
      <h3 className={ styles.header }>
        { category.name.replace(/^\w/, (c) => c.toUpperCase()) }
      </h3>
      <ul className={ styles.recipes }>
        {
          category.recipes.map((r) => (
            <li key={ r.slug } className={ styles.recipe }>
              <Link href={ `/recipes/${ r.slug }` }>
                { r.name }
              </Link>
            </li>
          ))
        }
      </ul>
    </article>
  );
};

export const getStaticProps: GetStaticProps<StaticProps> = () => {
  return {
    props: {
      categories: getRecipesByCategory(),
    }
  };
};

export default Home
