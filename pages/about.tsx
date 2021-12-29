import styles from './about.module.scss';

import Link from 'next/link';
import Layout from '/components/layout'

const About = () => {
  return (
    <Layout>
      <section className={ styles.content }>
        <h2 className={ styles.header }>About this site</h2>
        <p>
          I&apos;m <a href='https://github.com/mattmacleod' target='_blank' rel='noreferrer'>@mattmacleod</a>, and this is a small web application I use to store and publish recipes I use. It contains a variety of different recipes that I&apos;ve been making over the years, and they come from lots of different sources.
          I&apos;ve built this site to keep track of all the things I&apos;ve made, so that I can remind myself how to cook them in the future and share them with others.
        </p>
        <p>
          This site is inspired by <a target='_blank' rel='noreferrer' href='https://chowdown.io'>chowdown.io</a>, which is a similar project using a different implenentation and backend.
        </p>
        <p>
          The content on this site is licensed under a <a rel='noreferrer license' href='https://creativecommons.org/licenses/by/2.0/' target='_blank'>Creative Commons Attribution 2.0 Generic License</a>. This means that you can use it for any purpose, so long as you give attribution. Please link back to this site if you do use these recipes elsewhere.
        </p>
        <p>
          You can view the source code of this site—including all of the recipes—<a rel='noreferrer' target='_blank' href='https://github.com/mattmacleod/recipe-book'>on GitHub</a>. Please feel free to raise a PR if you want to add a recipe to fix anything!
        </p>
        <p>
          From a technical perspective, this site is built using <a rel='noreferrer' target='_blank' href='https://nextjs.org'>Next.js</a>, which is a framework for building modern web applications. Recipes are stored in plain-text Markdown format and rendered to a static HTML page. You can compare the <a rel='noreferrer' target='_blank' href='https://raw.githubusercontent.com/mattmacleod/recipe-book/main/recipes/negroni-cheesecake.md'>Markdown recipe</a> with the <Link href='/recipes/negroni-cheesecake.md'>rendered content</Link> to see how this works.
        </p>
        <p>
          I plan to add some more useful features to this site as I get the chance, such as automatic unit conversions, quantity scaling, and so on – but for the moment I just wanted to build a place to let me store and share recipes. So please enjoy!
        </p>
      </section>
    </Layout>
  )
}

export default About
