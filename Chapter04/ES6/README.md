# BABEL Usage

<https://babeljs.io/docs/en/usage>

* The entire process to set this up involves:

```bash
 npm install --save-dev @babel/core @babel/cli @babel/preset-env
 npm install --save @babel/polyfill
```

```bash
 yarn add @babel/core @babel/cli @babel/preset-env --save-dev
 yarn add @babel/polyfill  --save
```

* Creating a config file named babel.config.js in the root of your project with this content:

```javascript
const presets = [
  [
    "@babel/env",
    {
      targets: {
        edge: "17",
        firefox: "60",
        chrome: "67",
        safari: "11.1",
      },
      useBuiltIns: "usage",
    },
  ],
];

module.exports = { presets };
```

The browsers list above is just an arbitrary example. You will have to adapt it for the browsers you want to support.

* And running this command to compile all your code from the src directory to lib:

```bash
$ ./node_modules/.bin/babel src --out-dir lib
$ ./node_modules/.bin/babel main.js -o t.js

# transpile a single file
$ ./node_modules/.bin/babel example.js -o compiled.js
# transpile an entire directory
$ ./node_modules/.bin/babel src -d build
```

## Plugins and presets

```bash
$ yarn add @babel/preset-es2017 @babel/plugin-syntax-object-rest-spread --dev
yarn add v1.13.0
.....
```

.babelrc :

```bash
{
"presets": ["@babel/es2017"],
"plugins": ["@babel/syntax-object-rest-spread"]
}
```

### The env preset

```bash
$ yarn remove @babel/preset-es2017 @babel/plugin-syntax-object-rest-spread
$ yarn add @babel/preset-env --dev
.....
```
