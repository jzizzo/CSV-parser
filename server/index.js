const express = require("express");
const multer = require("multer");
const Papa = require("papaparse");
const xlsx = require("xlsx");
const cors = require("cors");

const app = express();
const upload = multer(); // Multer configuration for in-memory storage

app.use(cors());
app.use(express.json());

// Helper function to calculate optimal price
function calculateOptimalPrice(data, unitCost, bestGuessPrice, maxPrice) {
  // Compute the average monthly sales volume across all products
  const monthlyAverages = {};
  const months = Object.keys(data[0]).filter((key) => key !== "Product Name");

  months.forEach((month) => {
    const totalVolume = data.reduce((sum, product) => {
      const sales = parseFloat(product[month]);
      return sum + (isNaN(sales) ? 0 : sales);
    }, 0);
    monthlyAverages[month] = totalVolume / data.length;
  });

  let optimalPrice = null;
  let maxProfit = -Infinity;
  const monthlyMetrics = [];

  // Iterate through possible prices
  for (
    let price = parseInt(bestGuessPrice);
    price <= parseInt(maxPrice);
    price++
  ) {
    let totalRevenue = 0;
    let totalProfit = 0;
    const monthlyVolumes = {};

    // Calculate metrics for each month based on the average sales volume
    months.forEach((month) => {
      const baseVolume = monthlyAverages[month];
      const volume =
        baseVolume *
        (1 - (price - bestGuessPrice) / (maxPrice - bestGuessPrice));
      const revenue = volume * price;
      const profit = revenue - volume * unitCost;

      monthlyVolumes[month] = volume;
      totalRevenue += revenue;
      totalProfit += profit;
    });

    // Track the optimal price
    if (totalProfit > maxProfit) {
      maxProfit = totalProfit;
      optimalPrice = price;
    }

    monthlyMetrics.push({
      price,
      totalRevenue,
      totalProfit,
      monthlyVolumes,
    });
  }

  return {
    optimalPrice,
    maxProfit,
    monthlyMetrics,
  };
}

// Upload and parse endpoint
app.post("/upload", upload.single("file"), (req, res) => {
  const { unitCost, bestGuessPrice, maxPrice } = req.body;
  const file = req.file;

  // Validate inputs
  if (!file || !unitCost || !bestGuessPrice || !maxPrice) {
    return res
      .status(400)
      .json({ error: "All fields and a valid file are required." });
  }

  let parsedData;

  // Parse file
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

  // Perform pricing calculations
  const result = calculateOptimalPrice(
    parsedData,
    parseFloat(unitCost),
    parseInt(bestGuessPrice),
    parseInt(maxPrice)
  );

  res.status(200).json({
    message: "File processed successfully",
    optimalPrice: result.optimalPrice,
    maxProfit: result.maxProfit,
    monthlyMetrics: result.monthlyMetrics,
  });
});

// Start the server
app.listen(4000, () => console.log("Server running on http://localhost:4000"));
