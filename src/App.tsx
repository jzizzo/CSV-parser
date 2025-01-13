import React, { useState } from "react";

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [unitCost, setUnitCost] = useState<string>("");
  const [bestGuessPrice, setBestGuessPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [error, setError] = useState<string>("");

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

    // Format inputs to two decimal places
    const formattedUnitCost = parseFloat(unitCost).toFixed(2);
    const formattedBestGuessPrice = parseFloat(bestGuessPrice).toFixed(2);
    const formattedMaxPrice = parseFloat(maxPrice).toFixed(2);

    const formData = new FormData();
    formData.append("file", file!);
    formData.append("unitCost", formattedUnitCost);
    formData.append("bestGuessPrice", formattedBestGuessPrice);
    formData.append("maxPrice", formattedMaxPrice);

    try {
      const response = await fetch("http://localhost:4000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process file.");
      }

      const result = await response.json();
      console.log("Response from backend:", result);
    } catch (error) {
      setError("An error occurred while submitting the form.");
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md" style={{ margin: 10}}>
        <h1 className="text-xl font-bold mb-4">Upload CSV/Excel</h1>
        {error && <p className="text-red-500 mb-4" style={{ color: "red" }}>{error}</p>}
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
          style={{ marginLeft: 10 }}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default App;
