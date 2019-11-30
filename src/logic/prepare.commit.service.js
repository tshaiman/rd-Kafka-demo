

const prepareCommitParams = (kafkaMessages) => {
  const notIgnoredKafkaMessages = kafkaMessages.filter((m) => !(m.ignore));
  const batchSize = kafkaMessages.length;
  const lastKafkaMessage = kafkaMessages[batchSize - 1];
  const { topic, offset, partition } = lastKafkaMessage;
  const commitParamsAndKafkaMessages = {
    commitParams: {
      topic,
      offset,
      partition,
      batchSize
    },
    kafkaMessages: []
  };

  if (!notIgnoredKafkaMessages.length) {
    console.log('prepareCommitParams: Skipping empty batch', { topic, offset, partition });
    return commitParamsAndKafkaMessages;
  }
  const organization = topic;
  const loggingMetadata = {
    organization: topic,
    msg_count: notIgnoredKafkaMessages.length
  };
  console.log('prepareCommitParams: Starting dedup', loggingMetadata);

  /*metrics.gauge('mp_passed_batch_length', notIgnoredKafkaMessages.length, {
    org: organization
  });
  metrics.gauge('mp_all_batch_length', kafkaMessages.length, {
    org: organization
  });*/
  const retResult = {
    ...commitParamsAndKafkaMessages,
    kafkaMessages
  };
  return Promise.resolve(retResult);
};

module.exports = { prepareCommitParams };