require("dotenv").config();
const app = require("./app");
const connectWithDB = require("./Config/db");
const cloudinary = require("cloudinary");
const redis = require("redis");

// Connecting with database
connectWithDB();

//connecting with redis
// Create Redis Client
var redisClient = redis.createClient({ host: "localhost", port: 6379 });

redisClient.on("ready", function () {
  console.log("Redis is ready");
});

redisClient.on("error", function () {
  console.log("Error in Redis");
});

//cloudinary config goes here
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

app.listen(process.env.PORT, () => {
  console.log(`App is running at port ${process.env.PORT}`);
});

module.exports = redisClient;
