const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { db } = require("./utils/firebase");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Hello World!",
  });
});

app.get("/api/wisata", async (req, res) => {
  const { limit, city, category } = req.query;
  const limits = Number(limit) || 10; // Fixed variable name here

  let query = db.collection("tempat-wisata").limit(limits);

  // Check if the query parameter 'city' is provided
  if (city) {
    query = query.where("City", "==", city); // Fixed variable name here
  }

  if (category) {
    query = query.where("Category", "==", category);
  }

  const wisataAllSnapshot = await query.get();

  const wisata = wisataAllSnapshot.docs.map((doc) => {
    return {
      id: doc.id,
      ...doc.data(),
    };
  });
  res.status(200).json(wisata);
});



app.get("/api/wisata/:place_id", async (req, res) => {
  const limit = 10;
  const placeId = req.params.place_id;

  // Query to fetch documents with a specific place_id
  let query = db.collection("tempat-wisata").where("Place_Id", "==", placeId);

  const wisataAll = await query.limit(limit).get();

  const wisata = [];

  wisataAll.forEach((doc) => {
    wisata.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  res.status(200).json({
    wisata,
  });
});

app.listen(PORT, () => {
  console.log(`[⚡ server] Listening on url http://localhost:${PORT}`);
});
