/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: { and: [/\.(js|ts|md)x?$/] },
      use: [{
        loader: '@svgr/webpack',
        options: {
          dimensions: false,
        }
      }],
    });

    return config;
  },

  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
}
