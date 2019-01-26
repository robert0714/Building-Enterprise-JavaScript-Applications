const presets = [
  [
    "@babel/env",
    {
      targets: {
        edge: "8",
        firefox: "40",
        chrome: "47",
        safari: "10.1",
      },
      useBuiltIns: "usage",
    },
  ],
];

module.exports = { presets };

