const appModulePath = require('app-module-path');

appModulePath.addPath(`${__dirname}/src`);
appModulePath.addPath(`${__dirname}/config`);

const config = require('config');

require('app')()
  .then(() => {
    if (process.send) {
      process.send(`${config.appName} is up!`);
    }
  })
  .catch((err) => console.log(err));

