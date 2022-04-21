const {webpackConfig, relDir} = require("./webpack.common");

module.exports = {
  entry: {
    index: relDir("src/index.ts"),
    demo: relDir("src/demo.ts"),
    graphDemo: relDir("src/graphDemo.ts"),
  },
  ...webpackConfig(false),
};
