const express = require("express");
const handler = require("express-async-handler");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get(
  "/",
  handler(async (req, res) => {
    res.send("Hello World").header("X-Hello", "World");
  }),
);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
