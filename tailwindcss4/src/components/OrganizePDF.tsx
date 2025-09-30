import { useState } from "react";
import type { FormEvent } from "react";
import { useRef } from "react";
import type { ChangeEvent } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { FaFilePdf, FaSpinner, FaTimes, FaDownload, FaCloudUploadAlt, FaListOl, FaExchangeAlt } from "react-icons/fa";

interface FileState {
  loading: boolean;
  error: string | null;
}

const OrganizePDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processedFile, setProcessedFile] = useState<string | null>(null);
  const [status, setStatus] = useState<FileState>({ loading: false, error: null });
  const [pageOrder, setPageOrder] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) return;
    if (selectedFile.type !== "application/pdf") {
      setStatus({ loading: false, error: "Please select a PDF file." });
      setFile(null);
      return;
    }
    setFile(selectedFile);
    setProcessedFile(null);
    setStatus({ loading: false, error: null });
    setPageOrder("");
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) handleFileSelect(acceptedFiles[0]);
    },
    onDropRejected: () => {
      setStatus({ loading: false, error: "Please select a valid PDF file." });
      setFile(null);
    },
    noClick: true, // Disable default click so we can use our own button
  });

  const openFileDialog = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const removeFile = () => {
    setFile(null);
    setProcessedFile(null);
    setPageOrder("");
    setStatus({ loading: false, error: null });
  };

  const handleOrganize = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setStatus({ loading: false, error: "Please select a PDF file" });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("pageOrder", pageOrder);

    try {
      setStatus({ loading: true, error: null });
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/organize-pdf`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      setProcessedFile(URL.createObjectURL(blob));
      setStatus({ loading: false, error: null });
    } catch (err) {
      console.error("PDF organization failed:", err);
      setStatus({ loading: false, error: "Failed to organize PDF. Please try again." });
    }
  };

  const handlePageOrderChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPageOrder(e.target.value);
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">Organize PDF Pages</h1>

      <form onSubmit={handleOrganize} className="space-y-6">
        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`relative p-10 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-300
          ${isDragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"}`}
        >
          <input {...getInputProps()} ref={fileInputRef} onClick={(e) => e.stopPropagation()} />
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className={`p-4 rounded-full ${isDragActive ? "bg-blue-100 dark:bg-blue-900/30" : "bg-gray-100 dark:bg-gray-800"}`}>
              <FaCloudUploadAlt className={`text-4xl ${isDragActive ? "text-blue-500" : "text-red-500"}`} />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">{isDragActive ? "Drop your PDF here" : "Upload PDF Document"}</p>
              <p className="text-gray-600 dark:text-gray-400">
                {isDragActive ? "Release to upload" : <>Drag & drop or <span onClick={openFileDialog} className="text-blue-500 font-medium cursor-pointer">browse files</span></>}
              </p>
            </div>
          </div>
        </div>

        {/* Selected File Preview */}
        {file && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <FaFilePdf className="text-red-500 text-2xl" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white truncate max-w-xs">{file.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
            <button type="button" onClick={removeFile} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400">
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Page Order Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FaListOl className="inline mr-1" /> Page Order (e.g., "1,3,5" or "1-3,5")
          </label>
          <input
            type="text"
            value={pageOrder}
            onChange={handlePageOrderChange}
            placeholder="Specify page order (leave empty to keep original)"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Organize Button */}
        <button
          type="submit"
          disabled={!file || status.loading}
          className={`w-full flex items-center justify-center py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300
          ${!file || status.loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"}`}
        >
          {status.loading ? <><FaSpinner className="animate-spin mr-3" /> Organizing PDF...</> : <><FaExchangeAlt className="mr-3" /> Organize PDF</>}
        </button>

        {/* Error Message */}
        {status.error && <p className="text-red-600 dark:text-red-300 mt-4">{status.error}</p>}

        {/* Download Link */}
        {processedFile && (
          <div className="mt-6 text-center">
            <a href={processedFile} download="organized.pdf" className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl">
              <FaDownload className="mr-2" /> Download Organized PDF
            </a>
          </div>
        )}
      </form>
    </div>
  );
};

export default OrganizePDF;