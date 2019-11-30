module.exports = {
    port: 1830,
    appName: 'rdlib-k-demo',
    secret: 'developSecret',
    kafka: {
      hosts: ['127.0.0.1:9092'],
      groupId: 'shaiman_group',
      topic: 'tomers'
    }
  };
  