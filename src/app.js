
const shutdown = require('setup/shutdown');
const bootleg = require('bootleg');

module.exports = function bootApp() {
      
    
    const kafka = require('setup/kafka');
    const listener = require('logic/listener').init;
    /* eslint-enable global-require */
  
    const app = bootleg();
    
    app.phase('shutdown', shutdown);
    app.phase('kafka', kafka, '@shutdown');
    app.phase('similiar-listener', () => listener().resume());
  
    return app.boot();
  };