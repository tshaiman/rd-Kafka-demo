
const kafkaUtils = require('kafka')
const {
  kafka: {
    hosts,
    groupId,
    topic
  }
} = require('config');

module.exports = async function kafka(shutdown) {
  const metadataRefeshInterval = 30 * 1000;
  console.log('Connecting to kafka', { hosts: hosts, topics: topic.toString(), groupId: groupId });
  const stream = kafkaUtils.createConsumerStream(hosts, topic.toString(), groupId, {
    'queued.max.messages.kbytes': 1000000,
    'batch.num.messages': 100000,
    'fetch.message.max.bytes': 10000, // Assuming 200 bytes per message and 50 messages
    'fetch.max.bytes': 524288000,
    'topic.metadata.refresh.interval.ms': metadataRefeshInterval,
    'retry.backoff.ms': 200,
    retries: 5
  }, {}, {
    fetchSize: 0
  });
  shutdown.add(() => kafkaUtils.shutdown(), { name: 'kafka', order: 1 });
  return stream;
};
