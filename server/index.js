// server/index.js
const express = require("express");
const multer = require("multer");
const Papa = require("papaparse");
const cors = require("cors");

const app = express();
const upload = multer();

app.use(cors());

app.post("/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send("No file uploaded");

  const csvData = file.buffer.toString("utf8");
  const parsedData = Papa.parse(csvData, { header: true });

  res.json({ data: parsedData.data });
});

app.listen(4000, () => console.log("Server running on http://localhost:4000"));
