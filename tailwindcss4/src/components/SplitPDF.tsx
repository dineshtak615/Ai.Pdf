import { useState, useEffect, useRef } from "react";
import type { ChangeEvent, FormEvent, DragEvent } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { FiUpload, FiFile, FiScissors, FiDownload, FiAlertCircle, FiCheck, FiX } from "react-icons/fi";

interface StatusState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

const SplitPDF = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fromPage, setFromPage] = useState<number>(1);
  const [toPage, setToPage] = useState<number>(1);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [splitUrl, setSplitUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusState>({
    loading: false,
    error: null,
    success: false,
  });
  const [dragOver, setDragOver] = useState<boolean>(false);
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Navigation logging
  useEffect(() => {
    console.log(`Navigated to ${location.pathname}.`);
    if (location.pathname === "/split") {
      console.warn("Ensure no GET requests are sent to http://localhost:5000/split.");
    }
    return () => console.log("Leaving /split route.");
  }, [location]);

  // Get page count
  useEffect(() => {
    if (!file) {
      setPageCount(null);
      return;
    }
    const getPageCount = async () => {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await axios.post<{ pageCount: number }>(
          `${import.meta.env.VITE_API_URL}/page-count`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            timeout: 10000,
          }
        );

        setPageCount(res.data.pageCount);
        setToPage(res.data.pageCount);
        console.log(`PDF has ${res.data.pageCount} pages`);
      } catch (err) {
        console.error("Failed to get page count:", err);
        setStatus({ loading: false, error: "Could not validate PDF page count", success: false });
      }
    };
    getPageCount();
  }, [file]);

  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    if (selectedFile.type !== "application/pdf") {
      setStatus({ loading: false, error: "Please select a PDF file", success: false });
      setFile(null);
      setPageCount(null);
      return;
    }
    if (selectedFile.size > 50 * 1024 * 1024) {
      setStatus({ loading: false, error: "File size exceeds 50MB limit", success: false });
      setFile(null);
      setPageCount(null);
      return;
    }
    setFile(selectedFile);
    setStatus({ loading: false, error: null, success: false });
    setSplitUrl(null);
    setFromPage(1);
  };

  // Handle drag and drop
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;
    
    if (droppedFile.type !== "application/pdf") {
      setStatus({ loading: false, error: "Please drop a PDF file", success: false });
      return;
    }
    if (droppedFile.size > 50 * 1024 * 1024) {
      setStatus({ loading: false, error: "File size exceeds 50MB limit", success: false });
      return;
    }
    setFile(droppedFile);
    setStatus({ loading: false, error: null, success: false });
    setSplitUrl(null);
    setFromPage(1);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeFile = () => {
    setFile(null);
    setPageCount(null);
    setFromPage(1);
    setToPage(1);
    setStatus({ loading: false, error: null, success: false });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle PDF split
  const handleSplit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setStatus({ loading: false, error: "Please select a PDF file", success: false });
      return;
    }
    if (fromPage <= 0 || toPage <= 0) {
      setStatus({ loading: false, error: "Page numbers must be greater than zero", success: false });
      return;
    }
    if (fromPage > toPage) {
      setStatus({ loading: false, error: "From page must be less than or equal to To page", success: false });
      return;
    }
    if (pageCount && (fromPage > pageCount || toPage > pageCount)) {
      setStatus({ loading: false, error: `Page range exceeds PDF length (${pageCount} pages)`, success: false });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("pages", `${fromPage}-${toPage}`);

    try {
      setStatus({ loading: true, error: null, success: false });
      console.log("Sending POST request to split endpoint", {
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(2) + " KB",
        pages: `${fromPage}-${toPage}`,
      });

      const res = await axios.post(`${import.meta.env.VITE_API_URL}/split`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob",
        timeout: 30000,
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      setSplitUrl(url);
      setStatus({ loading: false, error: null, success: true });
      console.log("Split successful, download URL created:", url);
    } catch (err) {
      console.error("Split failed:", err);
      let errorMessage = "Failed to split PDF. Please try again.";
      if (axios.isAxiosError(err) && err.response) {
        const errorData = err.response.data;
        let serverMessage: string | undefined;
        
        if (errorData instanceof Blob) {
          serverMessage = await new Response(errorData).text();
          try {
            serverMessage = JSON.parse(serverMessage).error || serverMessage;
          } catch (e) {
            // Not JSON
          }
        } else if (typeof errorData === 'object' && errorData !== null) {
          serverMessage = (errorData as any).error || (errorData as any).message;
        } else if (typeof errorData === 'string') {
          serverMessage = errorData;
        }
        
        console.log("Error response:", {
          status: err.response.status,
          headers: err.response.headers,
          data: serverMessage || "No data",
        });
        errorMessage = serverMessage || `Server error (${err.response.status}).`;
      } else if (axios.isAxiosError(err) && err.request) {
        errorMessage = "No response from server. Ensure backend is running.";
      } else if (err instanceof Error) {
        errorMessage = `Request error: ${err.message}`;
      }
      setStatus({ loading: false, error: errorMessage, success: false });
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Split PDF File
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Extract specific pages from your PDF document
        </p>
      </div>
      
      <form onSubmit={handleSplit} encType="multipart/form-data" className="space-y-6">
        {/* File Upload Area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select PDF File
          </label>
          
          <div 
            className={`relative p-6 border-2 border-dashed rounded-lg transition-all duration-200 ${
              dragOver 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : file
                ? 'border-green-500'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="flex flex-col items-center justify-center text-center">
              {file ? (
                <>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
                    <FiFile className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="mb-1 font-medium text-gray-800 dark:text-white truncate max-w-full">
                    {file.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {(file.size / 1024).toFixed(2)} KB
                    {pageCount && ` • ${pageCount} page${pageCount > 1 ? 's' : ''}`}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile();
                    }}
                    className="mt-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm flex items-center"
                  >
                    <FiX className="mr-1" /> Remove
                  </button>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
                    <FiUpload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    PDF up to 50MB
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Page Selection */}
        {file && pageCount && (
          <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 dark:text-white mb-3">Select Page Range</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label htmlFor="from-page" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  From Page
                </label>
                <input
                  id="from-page"
                  type="number"
                  min="1"
                  max={pageCount}
                  value={fromPage}
                  onChange={(e) => setFromPage(Math.max(1, Math.min(Number(e.target.value), pageCount)))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="to-page" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                  To Page
                </label>
                <input
                  id="to-page"
                  type="number"
                  min="1"
                  max={pageCount}
                  value={toPage}
                  onChange={(e) => setToPage(Math.max(1, Math.min(Number(e.target.value), pageCount)))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
              Extracting pages {fromPage} to {toPage} {toPage - fromPage + 1 > 1 ? `(${toPage - fromPage + 1} pages)` : ''}
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          type="submit"
          disabled={!!(status.loading || !file || fromPage <= 0 || toPage <= 0 || fromPage > toPage || (pageCount && (fromPage > pageCount || toPage > pageCount)))}
          className={`w-full py-3 rounded-lg text-white font-medium flex items-center justify-center transition-colors duration-200 ${
            status.loading 
              ? "bg-blue-400 cursor-not-allowed" 
              : "bg-blue-600 hover:bg-blue-700"
          } disabled:bg-gray-400 disabled:cursor-not-allowed`}
        >
          {status.loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <FiScissors className="mr-2" />
              Extract Pages
            </>
          )}
        </button>

        {/* Status Messages */}
        {status.error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center text-red-700 dark:text-red-300">
              <FiAlertCircle className="mr-2 flex-shrink-0" />
              <span className="text-sm">{status.error}</span>
            </div>
          </div>
        )}

        {status.success && splitUrl && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center text-green-700 dark:text-green-300 mb-2">
              <FiCheck className="mr-2 flex-shrink-0" />
              <span className="font-medium">PDF successfully split!</span>
            </div>
            
            <a
              href={splitUrl}
              download="extracted-pages.pdf"
              className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <FiDownload className="mr-2" />
              Download Extracted Pages
            </a>
          </div>
        )}
      </form>

      {/* Information Section */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center">
          <FiAlertCircle className="mr-2" />
          How it works
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• Upload a PDF file to extract pages from</li>
          <li>• Select the page range you want to extract</li>
          <li>• Download your new PDF with just the pages you need</li>
        </ul>
      </div>
    </div>
  );
};

export default SplitPDF;