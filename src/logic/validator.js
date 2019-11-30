const validate = (kafkaMessage) => {
    const {
      offset: kafka_offset, topic, partition, value: payload
    } = kafkaMessage;
    try {
      console.log('similiarWeb validation: Successfully validated message');
      //YOUR LOGIC GOES HERE 
      const validationEndTime = +new Date();
      return kafkaMessage;
    } catch (e) {
      console.log("Validation Error")
      return {
        ...kafkaMessage,
        ignore: true
      };
    }
  };

  module.exports = { validate };