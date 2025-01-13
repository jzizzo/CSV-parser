const express = require("express");
const multer = require("multer");
const Papa = require("papaparse");
const xlsx = require("xlsx");
const cors = require("cors");

const app = express();
const upload = multer();

app.use(cors());

app.post("/upload", upload.single("file"), (req, res) => {
  const { unitCost, bestGuessPrice, maxPrice } = req.body;
  const file = req.file;

  if (!file || !unitCost || !bestGuessPrice || !maxPrice) {
    return res.status(400).json({ error: "All fields and file are required." });
  }

  let parsedData;

  if (file.mimetype === "text/csv") {
    const csvData = file.buffer.toString("utf8");
    parsedData = Papa.parse(csvData, { header: true }).data;
  } else if (
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.mimetype === "application/vnd.ms-excel"
  ) {
    const workbook = xlsx.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    parsedData = xlsx.utils.sheet_to_json(sheet);
  } else {
    return res.status(400).json({ error: "Unsupported file type." });
  }

  console.log("Parsed Data:", parsedData);
  res.json({
    message: "File processed successfully",
    data: parsedData,
    inputs: { unitCost, bestGuessPrice, maxPrice },
  });
});

app.listen(4000, () => console.log("Server running on http://localhost:4000"));
