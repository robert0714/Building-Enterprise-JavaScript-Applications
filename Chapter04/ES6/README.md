# BABEL Usage

<https://babeljs.io/docs/en/usage>

* The entire process to set this up involves:

```javascript
npm install --save-dev @babel/core @babel/cli @babel/preset-env
npm install --save @babel/polyfill
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
./node_modules/.bin/babel src --out-dir lib
./node_modules/.bin/babel main.js -o t.js
```