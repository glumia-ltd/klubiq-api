module.exports = {
  '{apps,libs}/**/*.{js,ts,tsx,jsx}': [
    (files) => `npx eslint --fix ${files.join(' ')} `,
    (files) => `npm run format --files=${files.join(',')}`,
  ],
}