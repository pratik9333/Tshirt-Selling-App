const redis = require("redis");

const client = redis.createClient({ host: "localhost", port: 6379 });

// const usercart = [
//   {
//     product: "61f1b68d3e0df24a8ef153fb",
//     quantity: "1",
//     total: "2000",
//     price: "2000",
//   },
//   {
//     product: "61f1b68d373e0df24a8ef153fb",
//     quantity: "2",
//     total: "2002",
//     price: "2002",
//   },
// ];

// client.on("error", function error() {
//   console.log("error occured");
// });

// client.on("connect", function error() {
//   console.log("Connected");
// });

// client.hgetall("123", (err, reply) => {
//   let id = "61f1b68d3e0df24a8ef153fb";
//   let x = JSON.parse(reply.user);
//   let updatedProducts = x.filter((item) => item.product !== id);
//   console.log(updatedProducts);
//   client.hmset("123", "user", JSON.stringify(updatedProducts), (err, reply) => {
//     console.log("Deleted", reply);
//     client.hgetall("123", (err, reply) => {
//       console.log(JSON.parse(reply.user));
//     });
//   });
// });

// client.set("abcd", "xyz", (err, reply) => {});

// client.get("framework", (err, reply) => {});

// //storing hashes
// client.hmset(
//   "hash1",
//   ["javascript", "language", "abcd", "xyz", "1234", "5678"],
//   (err, message) => {}
// );
// const array = [];

// //get values from hash
// client.hgetall("hash1", (err, object) => {
//   array.push(object);
// });

// //store in list
// client.rpush(["frameworks", "angular", "django"], (err, message) => {
//   //
// });

// //get values from list
// client.lrange("frameworks", 0, -1, (err, listitem) => {
//   //
// });

// //checking the existing of the keys
// client.exists("framework", (err, message) => {
//   if (message === 0) {
//     //console.log("Not Exists");
//   } else {
//     //console.log("Exists");
//   }
// });

// // deleting and expiring keys
// client.del("framework", (err, message) => {
//   //console.log(message);
// });

// client.set("Abc", "Xyz");
// client.expire("Abc", 20);

// // Increment a key
// client.set("working_days", 5, function() {
//   client.incr("working_days", function(err, reply) {
//     //console.log(reply); // 6
//   });
// });

module.exports = client;
