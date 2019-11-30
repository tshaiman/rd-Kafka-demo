Node-rdkafka - Node.js wrapper for Kafka C/C++ library
==============================================

#Overview

This project is based on the node-rdKafka Lib here :
[https://github.com/blizzard/node-rdkafka](https://github.com/blizzard/node-rdkafka)

The demo contains usage of :
* Highland Streams
* bootleg framework
* node-rdkafka consumer (no prodcuer yet)


## Requirements

* Apache Kafka >=0.9
* Node.js >=4
* Linux/Mac
* Windows?! See below
* openssl 1.0.2

### Mac OS High Sierra / Mojave

OpenSSL has been upgraded in High Sierra and homebrew does not overwrite default system libraries. That means when building node-rdkafka, because you are using openssl, you need to tell the linker where to find it:

```sh
export CPPFLAGS=-I/usr/local/opt/openssl/include
export LDFLAGS=-L/usr/local/opt/openssl/lib
```

Then you can run `npm install` on your application to get it to build correctly.

__NOTE:__ From the `librdkafka` docs

> WARNING: Due to a bug in Apache Kafka 0.9.0.x, the ApiVersionRequest (as sent by the client when connecting to the broker) will be silently ignored by the broker causing the request to time out after 10 seconds. This causes client-broker connections to stall for 10 seconds during connection-setup before librdkafka falls back on the `broker.version.fallback` protocol features. The workaround is to explicitly configure `api.version.request` to `false` on clients communicating with <=0.9.0.x brokers.
