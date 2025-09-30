import { useState,  } from "react";
import type { FormEvent } from "react";
import type { ChangeEvent } from "react";
import axios from "axios";

const RepairPDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processedFile, setProcessedFile] = useState<string | null>(null);
  const [status, setStatus] = useState<{ 
    loading: boolean; 
    error: string | null 
  }>({ loading: false, error: null });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setProcessedFile(null);
      setStatus({ loading: false, error: null });
    }
  };

  const handleRepair = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setStatus({ loading: false, error: "Please select a PDF file" });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setStatus({ loading: true, error: null });
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/repair-pdf`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setProcessedFile(url);
      setStatus({ loading: false, error: null });
    } catch (error) {
      console.error("Repair failed:", error);
      setStatus({ 
        loading: false, 
        error: "Failed to repair PDF. Please try again." 
      });
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Repair PDF</h2>
      <form onSubmit={handleRepair} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Corrupted PDF File
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {file && (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </div>
        )}

        <button
          type="submit"
          disabled={status.loading || !file}
          className={`w-full px-4 py-2 rounded text-white font-medium ${
            status.loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
          } disabled:bg-gray-400 disabled:cursor-not-allowed`}
        >
          {status.loading ? "Repairing..." : "Repair PDF"}
        </button>

        {status.error && (
          <div className="text-red-600 text-sm p-3 bg-red-50 dark:bg-red-900/50 rounded">
            {status.error}
          </div>
        )}

        {processedFile && (
          <div className="mt-6">
            <a
              href={processedFile}
              download="repaired.pdf"
              className="inline-block text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
            >
              Download Repaired PDF
            </a>
          </div>
        )}
      </form>
    </div>
  );
};

export default RepairPDF;