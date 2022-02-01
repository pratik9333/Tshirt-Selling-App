const redis = require("redis");

const client = redis.createClient({ host: "localhost", port: 6379 });

client.on("error", function error() {
  console.log("error occured");
});

client.on("connect", function error() {
  console.log("Connected");
});

module.exports = client;
