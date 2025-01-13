import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [unitCost, setUnitCost] = useState<string>("");
  const [bestGuessPrice, setBestGuessPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [responseData, setResponseData] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const validateInputs = () => {
    const unit = parseFloat(unitCost);
    const bestGuess = parseFloat(bestGuessPrice);
    const max = parseFloat(maxPrice);

    if (isNaN(unit) || isNaN(bestGuess) || isNaN(max)) {
      return "All inputs must be valid numbers.";
    }
    if (unit <= 0 || bestGuess <= 0 || max <= 0) {
      return "All values must be positive numbers.";
    }
    if (unit >= max) {
      return "Unit cost must be less than the maximum price.";
    }
    if (bestGuess < unit || bestGuess > max) {
      return "Best-guess price must be between unit cost and max price.";
    }
    if (!file) {
      return "Please upload a valid file.";
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    const formData = new FormData();
    formData.append("file", file!);
    formData.append("unitCost", parseFloat(unitCost).toFixed(2));
    formData.append("bestGuessPrice", parseFloat(bestGuessPrice).toFixed(2));
    formData.append("maxPrice", parseFloat(maxPrice).toFixed(2));

    try {
      const response = await fetch("http://localhost:4000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process file.");
      }

      const result = await response.json();
      setResponseData(result);
    } catch (error) {
      setError("An error occurred while submitting the form.");
      console.error(error);
    }
  };

  // Utility function for formatting currency
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD", // Change "USD" to the desired currency code if needed
    }).format(value);

  // Prepare data for the chart
  const chartData = responseData
    ? {
        labels: Object.keys(responseData.monthlyMetrics[0].monthlyVolumes),
        datasets: [
          {
            label: "Total Revenue",
            data: Object.values(responseData.monthlyMetrics[0].monthlyVolumes).map(
              (volume: number) => volume * responseData.optimalPrice
            ),
            backgroundColor: "rgba(75, 192, 192, 0.5)",
          },
          {
            label: "Total Profit",
            data: Object.values(responseData.monthlyMetrics[0].monthlyVolumes).map(
              (volume: number) => volume * (responseData.optimalPrice - parseFloat(unitCost))
            ),
            backgroundColor: "rgba(255, 99, 132, 0.5)",
          },
        ],
      }
    : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md" style={{ margin: 10 }}>
        <h1 className="text-xl font-bold mb-4">Upload CSV/Excel</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="file"
          accept=".csv, .xlsx"
          onChange={handleFileChange}
          className="mb-4 w-full px-3 py-2 border rounded-lg"
        />
        <input
          type="text"
          placeholder="Unit Cost"
          value={unitCost}
          onChange={(e) => setUnitCost(e.target.value)}
          className="mb-4 w-full px-3 py-2 border rounded-lg"
        />
        <input
          type="text"
          placeholder="Best-Guess Price"
          value={bestGuessPrice}
          onChange={(e) => setBestGuessPrice(e.target.value)}
          className="mb-4 w-full px-3 py-2 border rounded-lg"
        />
        <input
          type="text"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="mb-4 w-full px-3 py-2 border rounded-lg"
        />
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Submit
        </button>
      </div>

      {/* Display Results */}
      {responseData && (
        <div style={{ marginTop: "20px", width: "80%" }}>
          <h2 className="text-2xl font-bold text-center mb-4">Results</h2>
          <p className="text-lg text-center">
            <strong>Optimal Price:</strong> {formatCurrency(responseData.optimalPrice)}
          </p>
          <p className="text-lg text-center">
            <strong>Total Revenue:</strong>{" "}
            {formatCurrency(responseData.monthlyMetrics[0].totalRevenue)}
          </p>
          <p className="text-lg text-center">
            <strong>Total Profit:</strong>{" "}
            {formatCurrency(responseData.monthlyMetrics[0].totalProfit)}
          </p>

          {/* Bar Chart */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-center mb-4">Monthly Metrics</h2>
            {chartData && (
              <div>
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                      title: {
                        display: true,
                        text: "Total Revenue and Profit by Month",
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value: number) => formatCurrency(value),
                        },
                      },
                    },
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
