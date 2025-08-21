// Convert PostCSS config to CommonJS. ESM syntax in a `.js` file
// fails when Node expects CommonJS (package.json "type": "commonjs").

module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
