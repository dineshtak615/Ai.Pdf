// src/components/ExcelToPDF.tsx
import { useState, useRef, useEffect } from "react";
import type { ChangeEvent, DragEvent, FormEvent } from "react";
import axios from "axios";
import {
  FaFileExcel,
  FaFilePdf,
  FaCloudUploadAlt,
  FaExchangeAlt,
  FaTimes,
} from "react-icons/fa";


interface ProcessedFile {
  url: string;
  name: string;
}

interface StatusState {
  loading: boolean;
  error: string | null;
}

const ExcelToPDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processedFile, setProcessedFile] = useState<ProcessedFile | null>(null);
  const [status, setStatus] = useState<StatusState>({ loading: false, error: null });
  const [dragging, setDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup blob URL when component unmounts or new file is processed
  useEffect(() => {
    return () => {
      if (processedFile?.url) {
        URL.revokeObjectURL(processedFile.url);
      }
    };
  }, [processedFile]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile: File | null) => {
    if (!selectedFile) return;

    const allowedTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      setStatus({
        loading: false,
        error: "Please select an Excel file (.xlsx or .xls)",
      });
      setFile(null);
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setStatus({
        loading: false,
        error: "File size exceeds 50MB limit",
      });
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setStatus({ loading: false, error: null });
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const removeFile = () => {
    setFile(null);
    setProcessedFile(null);
    setStatus({ loading: false, error: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConvert = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setStatus({ loading: false, error: "Please select an Excel file" });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setStatus({ loading: true, error: null });

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/excel-to-pdf`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          responseType: "blob",
        }
      );

      // Try to get filename from backend
      const disposition = response.headers["content-disposition"];
      let filename = "converted.pdf";
      if (disposition && disposition.includes("filename=")) {
        filename = disposition.split("filename=")[1].replace(/"/g, "");
      }

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setProcessedFile({ url, name: filename });
      setStatus({ loading: false, error: null });
    } catch (error) {
      console.error("Conversion failed:", error);
      let backendError = "Failed to convert Excel to PDF. Please try again.";
      
      if (axios.isAxiosError(error) && error.response?.data) {
        // Handle different types of error responses
        if (error.response.data instanceof Blob) {
          // If the error response is a blob, we might need to read it
          backendError = "Server returned an error. Please try again.";
        } else if (typeof error.response.data === 'object' && error.response.data.error) {
          backendError = error.response.data.error;
        } else if (typeof error.response.data === 'string') {
          backendError = error.response.data;
        }
      }
      
      setStatus({ loading: false, error: backendError });
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Excel to PDF Converter
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Convert your Excel spreadsheets to PDF documents. Maintain formatting
          and easily share your data.
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`relative p-10 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-300 ${
          dragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 transform scale-[1.01]"
            : file
            ? "border-green-500"
            : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          id="fileInput"
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleFileChange}
          ref={fileInputRef}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div
            className={`p-4 rounded-full ${
              dragging
                ? "bg-blue-100 dark:bg-blue-900/30"
                : "bg-gray-100 dark:bg-gray-800"
            }`}
          >
            <FaCloudUploadAlt
              className={`text-4xl ${
                dragging ? "text-blue-500" : "text-gray-400"
              }`}
            />
          </div>

          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              {dragging ? "Drop your Excel file here" : "Upload Excel Document"}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              {dragging ? (
                "Release to upload your file"
              ) : (
                <>
                  Drag & drop a file or{" "}
                  <span className="text-blue-500 font-medium cursor-pointer">
                    browse files
                  </span>
                </>
              )}
            </p>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Supported formats: .xlsx, .xls (Max size: 50MB)
          </p>
        </div>
      </div>

      {status.error && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
          <div className="flex items-center text-red-700 dark:text-red-300">
            <FaTimes className="h-5 w-5 mr-2" />
            <p className="text-sm font-medium">{status.error}</p>
          </div>
        </div>
      )}

      {file && (
        <div className="mt-8">
          <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <FaFileExcel className="mr-2 text-green-500" />
              Selected File
            </h3>

            <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <FaFileExcel className="text-green-500 text-2xl" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white truncate max-w-xs">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Remove file"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-6">
              <button
                onClick={handleConvert}
                disabled={status.loading || !file}
                className={`w-full flex items-center justify-center py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${
                  status.loading || !file
                    ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                }`}
              >
                {status.loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Converting...
                  </>
                ) : (
                  <>
                    <FaExchangeAlt className="mr-3" />
                    Convert to PDF
                  </>
                )}
              </button>
            </div>

            {processedFile && (
              <div className="mt-6">
                <a
                  href={processedFile.url}
                  download={processedFile.name}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  <FaFilePdf className="mr-2" />
                  Download {processedFile.name}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelToPDF;