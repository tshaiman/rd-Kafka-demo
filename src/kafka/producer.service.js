let Promise;
const Kafka = require('node-rdkafka');

let producer;
let producerInitPromise;

const PRODUCER_POLL_INTERVAL = 100;

function get(serviceName, hosts, config) {
  if (producer) {
    return producerInitPromise;
  }

  return init(serviceName, hosts, config);
}

function init(serviceName, hosts, config = {}) {
  const PRODUCER_CLIENT_ID = `${serviceName}-kafka-producer`;
  if (config.dr_cb) {
    return Promise.reject(new Error('Custom Config overides "dr_cb". This might prevent the "produce" promise to resolve.'));
  }

  producerInitPromise = new Promise((resolve, reject) => {
    producer = new Kafka.Producer({
      'client.id': PRODUCER_CLIENT_ID,
      'metadata.broker.list': hosts,
      'compression.codec': 'lz4',
      dr_cb: (error, { opaque: producePromise, ...report }) => {
        // 'producePromise' - Reference to a Promise callbacks for a produced message
        if (error) {
          return producePromise.reject(error);
        }
        return producePromise.resolve(report);
      },
      ...config
    });

    producer.connect();
    producer.setPollInterval(PRODUCER_POLL_INTERVAL);

    producer.on('ready', () => {
      resolve({ produce });
    });

    producer.on('connection.failure', (metrics) =>
      reject(new Error(`Producer connection error. Producer metrics: ${metrics}`)));
  });

  return producerInitPromise;
}

function produce(topicName, message, messageId = null, partition = -1, timeStamp = null) {
  return new Promise((resolve, reject) => {
    try {
      producer.produce(
        topicName,
        partition,
        Buffer.isBuffer(message) ? message : Buffer.from(JSON.stringify(message)),
        messageId,
        timeStamp,
        { resolve, reject }
      );
    } catch (e) {
      reject(e);
    }
  });
}

function shutdown() {
  return new Promise((resolve) => {
    if (!producer) {
      resolve();
      return;
    }

    producer.disconnect(5000, () => {
      resolve();
    });

    producer = undefined;
  });
}

module.exports = function producerService(customPromise) {
  Promise = customPromise;

  return {
    get,
    shutdown
  };
};
