import React, { useState } from "react";

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [unitCost, setUnitCost] = useState("");
  const [bestGuessPrice, setBestGuessPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file || !unitCost || !bestGuessPrice || !maxPrice) {
      alert("Please fill in all fields and upload a file!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("unitCost", unitCost);
    formData.append("bestGuessPrice", bestGuessPrice);
    formData.append("maxPrice", maxPrice);

    try {
      const response = await fetch("http://localhost:4000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file.");
      }

      const result = await response.json();
      console.log("Backend response:", result);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Upload CSV/Excel</h1>
      <input
        type="file"
        accept=".csv, .xlsx"
        onChange={handleFileChange}
        style={{ display: "block", marginBottom: "10px" }}
      />
      <input
        type="text"
        placeholder="Unit Cost"
        value={unitCost}
        onChange={(e) => setUnitCost(e.target.value)}
        style={{ display: "block", marginBottom: "10px" }}
      />
      <input
        type="text"
        placeholder="Best-Guess Price"
        value={bestGuessPrice}
        onChange={(e) => setBestGuessPrice(e.target.value)}
        style={{ display: "block", marginBottom: "10px" }}
      />
      <input
        type="text"
        placeholder="Max Price"
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
        style={{ display: "block", marginBottom: "10px" }}
      />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default App;
