import styles from './about.module.scss';

import Layout from '/components/layout'

const About = () => {
  return (
    <Layout>
      <section className={ styles.content }>
        <h2 className={ styles.header }>About this site</h2>
        <p>
          This site contains a variety of different recipes that I&apos;ve been making over the years, based on lots of different sources.
          I&apos;ve built this site to keep track the things I&apos;ve made, so that I can remind myself to cook them again and share them with others.
        </p>
        <p>
          This site is inspired by <a target='_blank' rel='noreferrer' href='https://chowdown.io'>chowdown.io</a>, which  is a really similar project using a different backend.
        </p>
        <p>
          The content on this site is licensed under a <a rel='noreferrer license' href='https://creativecommons.org/licenses/by/2.0/' target='_blank'>Creative Commons Attribution 2.0 Generic License</a>. This means that you can use it for any purpose, so long as you give attribution to the author. Please link back to this site if you do use these recipes elsewhere.
        </p>
        <p>
          You can view the source code of this site—including all of the recipes—<a rel='noreferrer' target='_blank' href='https://github.com/mattmacleod/recipe-book'>on GitHub</a>. Please feel free to raise a PR if you want to add a recipe to fix anything!
        </p>
      </section>
    </Layout>
  )
}

export default About
