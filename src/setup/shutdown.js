/* eslint-disable no-console */
const ShutdownHook = require('shutdown-hook');

/**
 * Console.log is used instead of a proper logger because the logger might already be closed at this point
 * @returns {ShutdownHook}
 */
module.exports = function setupShutdown() {
  const shutdownHook = new ShutdownHook({ timeout: 20000 });
  shutdownHook.register();

  shutdownHook.on('ShutdownStarted', () => {
    console.log('Shutdown sequence started');
  });

  shutdownHook.on('ComponentShutdown', (event) => {
    console.log(`Shutting down ${event.name}`);
  });

  shutdownHook.on('ShutdownEnded', (event) => {
    switch (event.code) {
      case 0:
        console.log('Shutdown sequence ended successfully'); break;
      case 1:
        console.error('Shutdown sequence failed', { error_message: event.error.message, error_stack: event.error.stack }); break;
      default:
        console.error('Unknown sequence termination code');
    }
  });

  return shutdownHook;
};
/* eslint-enable no-console */
