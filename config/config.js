const merge = require('lodash/merge');
const envConfig = require(`./env/${process.env.NODE_ENV}`); // eslint-disable-line import/no-dynamic-require
const allConfig = require('./env/all');


module.exports = merge(allConfig, envConfig);
