const consumerService = require('./consumer.service');
const producerService = require('./producer.service');

let promiseDependency = Promise;
const { createConsumerStream, getConsumerStream } = consumerService(promiseDependency);
const getProducer = producerService(promiseDependency).get;

function shutdown() {
  return promiseDependency.all([consumerService(promiseDependency).shutdown(), producerService(promiseDependency).shutdown()]);
}

function setPromiseDependency(customPromise) {
  promiseDependency = customPromise;
}

module.exports = {
  createConsumerStream,
  getConsumerStream,
  getProducer,
  shutdown,
  setPromiseDependency
};
