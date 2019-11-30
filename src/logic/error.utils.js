class InfraError extends Error {
    constructor(message, errorMetadata) {
      super(message);
      this.name = 'InfraError';
      // This is for saving context when throwing (org, offset, etc.)
      this.errorMetadata = errorMetadata;
    }
  }


function HandleStreamError(e) {
    console.log('Error in similarweb processor', e);
    //metrics.increment('_error_count');
    //YOUR ERROR HANDLER HERE 
    process.exit(1);
  }

  module.exports = {
    InfraError,
    HandleStreamError
  };
  