import Head from 'next/head';
import Link from 'next/link';

import styles from './layout.module.scss';

import MealIcon from '/public/images/icons/meal.svg';

interface Props {
  title?: string;
}

const Layout = (props: React.PropsWithChildren<Props>) => (
  <div className={ styles.container }>
    <Head>
      <title>Recipe Book{ props.title ? ` – ${ props.title }` : '' }</title>
      <meta name='description' content='A collection of recipes.' />
      <meta charSet='utf-8' />
    </Head>

    <header className={ styles.header }>
      <Link href='/'>
        <a className={ styles.logo }>
          <MealIcon />
        </a>
      </Link>
      <h1 className={ styles.title }>
        Recipes.
      </h1>
    </header>

    <main className={ styles.main }>
      { props.children }
    </main>

    <footer className={ styles.footer }>
      <nav className={ styles.links }>
        <Link href='/'>
          Home
        </Link>
        <span className={ styles.sep }>|</span>
        <Link href='/about'>
          About
        </Link>
      </nav>
      <div className={ styles.credit }>
        Built by <a href='https://github.com/mattmacleod' target='_blank' rel='noreferrer'>
          @mattmacleod
        </a>
      </div>
    </footer>
  </div>
);

export default Layout;
