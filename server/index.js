const keys = require("./keys");

// ***** Express App Setup ****
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
// Allow cross-origin resource sharing
app.use(cors());
app.use(bodyParser.json());

// ****** Postgres Client Setup ******
const { Pool } = require("pg");
const pgClient = new Pool({
  user: keys.pgUser,
  password: keys.pgPassword,
  host: keys.pgHost,
  port: keys.pgPort,
  database: keys.pgDatabase,
  ssl:
    process.env.NODE_ENV !== "production"
      ? false
      : { rejectUnauthorized: false },
});

pgClient.on("connect", (client) => {
  client
    .query("CREATE TABLE IF NOT EXISTS values (number INT)")
    .catch((err) => console.error(err));
});

// ***** Redis Client Setup *****
const redis = require("redis");
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  // if connection is lost, attempt to reconnect every 1 second
  retry_strategy: () => 1000,
});

const redisPublisher = redisClient.duplicate();

// ***** Express route handlers *****
app.get("/", (req, res) => {
  res.send("Hi");
});

// Get all values from Postgres and return them
app.get("/values/all", async (req, res) => {
  const values = await pgClient.query("SELECT * FROM values");
  // values.rows is an array of objects
  res.send(values.rows);
});

app.get("/values/current", async (req, res) => {
  // get all key-value pairs from Redis
  redisClient.hgetall("values", (err, values) => {
    res.send(values);
  });
});

// Receive new values from React app
app.post("/values", async (req, res) => {
  // extract index from request body
  const index = req.body.index;
  // limit index to 40
  if (parseInt(index) > 40) {
    return res.status(422).send("Index too high");
  }

  // set value of index to 'Nothing yet!' in Redis
  redisClient.hset("values", index, "Nothing yet!");
  // publish insert event to worker
  redisPublisher.publish("insert", index);
  // insert index into Postgres
  pgClient.query("INSERT INTO values(number) VALUES($1)", [index]);

  res.send({ working: true });
});

// ***** Start server *****
app.listen(5000, (err) => {
  console.log("Listening");
});
