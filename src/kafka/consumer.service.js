let Promise;
const _ = require('lodash');
const Kafka = require('node-rdkafka');

const CONSUMER_ENABLE_AUTO_COMMIT = false;
const CONSUMER_OFFSET_STORE_METHOD = 'broker';
const CONSUMER_PARTITION_ASSIGNMENT_STRATEGY = 'roundrobin';

const CONSUMER_REFRESH_INTERVAL = 30000;

const CONSUMER_WAIT_INTERVAL = 0;
const CONSUMER_FETCH_SIZE = 0;
const KAFKACONSUMER_IS_DISCONNECTED_ERROR = -172;

let stream;

function createConsumerStream(hosts, topics, groupId, config = {}, topicConfig = {}, streamOptions = {}) {
  const globalConfig = {
    'metadata.broker.list': hosts,
    'group.id': groupId,
    'enable.auto.commit': CONSUMER_ENABLE_AUTO_COMMIT,
    'offset.store.method': CONSUMER_OFFSET_STORE_METHOD,
    'partition.assignment.strategy': CONSUMER_PARTITION_ASSIGNMENT_STRATEGY,
    'topic.metadata.refresh.interval.ms': CONSUMER_REFRESH_INTERVAL,
    offset_commit_cb: (err, topicPartition) => {
      if (err) {
        const message = _.findKey(Kafka.CODES.ERRORS, (c) => c === err) || 'unknown';

        topicPartition.forEach(({ topic, partition }) => {
          console.log('Error in kafka commit', {
            error_message: message,
            error_code: err,
            topic: topic,
            partition: partition
          });

          //metrics.increment('kafka_commit_error_count', { topic, partition });
        });

        return;
      }
      console.log('INFO-Commit done', topicPartition);
    },
    rebalance_cb: true,
    ...config
  };

  // Be aware that reading from earliest can cause high load on initial start
  stream = new Kafka.createReadStream(globalConfig, {
    'auto.offset.reset': 'earliest',
    ...topicConfig
  }, {
    ...{
      topics: topics,
      waitInterval: CONSUMER_WAIT_INTERVAL,
      fetchSize: CONSUMER_FETCH_SIZE
    },
    ...streamOptions
  });

  stream.on('error', (err) => {
    if ((stream.consumer && stream.consumer._isDisconnecting) ||
        (err.code === KAFKACONSUMER_IS_DISCONNECTED_ERROR)) {
      return;
    }

    console.log('Error- in kafka consumer stream', {
      error_message: err.stack,
      error_code: err.code
    });
  });

  stream.consumer.on('event.error', (err) => {
    if (err.stack === 'Error: Local: Broker transport failure') {
      // The broker closes the connection with the consumer due to inactivity
      // librdkafka will reconnect automatically
      // https://github.com/edenhill/librdkafka/wiki/FAQ#why-am-i-seeing-receive-failed-disconnected
      return;
    }

    console.log('Error in kafka consumer', {
      error_message: err.stack,
      error_code: err.code
    });

    stream.emit('rd-kafka-error', err);
  });

  stream.consumer.on('rebalance', (err, partition) => {
    console.log('INFO-Rebalance event', {
      error_message: err,
      partition: partition
    });
  });

  return stream;
}

function shutdown() {
  return new Promise((resolve) => {
    if (!stream) {
      resolve();
      return;
    }

    stream.close(() => {
      resolve();
    });
  });
}

function getConsumerStream() {
  return stream;
}

module.exports = function consumerService(customPromise) {
  Promise = customPromise;

  return {
    createConsumerStream,
    getConsumerStream,
    shutdown
  };
};
