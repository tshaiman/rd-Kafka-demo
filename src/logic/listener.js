/* eslint-disable indent */
const hi = require('highland');
const kafka = require('kafka');
const { InfraError,HandleStreamError } = require('./error.utils');


const { prepareCommitParams } = require('./prepare.commit.service');
const { validate } = require('./validator');


const BATCH_MAX_SIZE = 20;
const BATCH_MAX_MS = 20;

const parseAndLogOnError = (kafkaMessage) => {
  const { topic, offset, partition } = kafkaMessage;
  const topicPartition = `${topic}${partition}`;
  try {
    return {
      ...kafkaMessage,
      value: JSON.parse(kafkaMessage.value),
      topicPartition: topicPartition
    };
  } catch (e) {
    console.log('parseAndLogOnError: Error on kafka message parse', e, {
      topic: topic,
      partition: partition,
      kafka_offset: offset
    });

    return {
      ...{
        topic,
        offset,
        partition,
        topicPartition
      },
      ignore: true
    };
  }
};

const sendInputMetrics = ({ timestamp }) => {
    //metrics.increment('input_count');
    if (timestamp > 0) {
        //metrics.timing('kafka_message_duration_ms', timestamp);
        console.log('kafka_message_duration_ms', timestamp)
    }
  };
  
  const sendBatchMetrics = (batch) => {
    const numberOfMessages = batch.length;
    if (!numberOfMessages) {
      return;
    }
    const lastMessage = batch[numberOfMessages - 1];
    //metrics.gauge('batch_size', batch.length, { topic: lastMessage.topic });
    console.log('batch_size ' + batch.length)
  };


const processBatch = (message) => {
    console.log(`process batch ${message.length}`);
    return message;
};

const init = () => {
  const kafkaStream = kafka.getConsumerStream();

  return hi(kafkaStream)
    .errors((e) => {
        HandleStreamError(new InfraError(e.message));
    })
    .doto(sendInputMetrics)
    .map(parseAndLogOnError)
    .map(validate)
    .batchWithTimeOrCount(BATCH_MAX_MS, BATCH_MAX_SIZE)
    .flatMap((messagesBatch) => hi(messagesBatch).group('topicPartition'))
    .flatMap((topicsToMessages) => hi(Object.values(topicsToMessages)))
    .doto((m) => processBatch(m))
    .flatMap((m) => hi(prepareCommitParams(m)))
    .consume(stopOnInfraErrors)
    .doto(commitToKafka)
    .errors(HandleStreamError);

    function commitToKafka(batch) {
      const { commitParams } = batch;
      const {
        topic, partition, offset, batchSize
      } = commitParams;
      console.log('commitToKafka: Commiting batch', {
        topic: topic,
        partition: partition,
        kafka_offset: offset,
        batch_size: batchSize
      });
      try {
        kafkaStream.consumer.commit({
          topic: topic,
          partition: partition,
          offset: offset + 1
        });
      } catch (e) {
        console.log('commitToKafka: Error in Kafka commit ', e, {
          topic: topic,
          partition: partition,
          kafka_offset: offset + 1
        });
      }
    }
  };

  function stopOnInfraErrors(err, x, push, next) {
    // Stop the stream in case of InfraErrors.
    // We do this to avoid committing to kafka messages that slipped _after_ the
    // infra error before we managed to restart the process. Committing these
    // messages can cause data loss.
    push(err, x);
    if (err instanceof InfraError) {
      push(null, hi.nil);
      // It's important not to call next() after pushing 'nil'
      return;
    }
    if (x !== hi.nil) {
      next();
    }
  }



  module.exports = { init };

