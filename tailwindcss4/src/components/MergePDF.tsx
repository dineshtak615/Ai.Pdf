import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import type { DragEvent } from "react";
import type { ChangeEvent } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { FiUpload, FiFile, FiTrash2, FiDownload, FiAlertCircle, FiCheck } from "react-icons/fi";

interface FileStatus {
  loading: boolean;
  error: string | null;
  success: boolean;
}

const MergePDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<FileStatus>({
    loading: false,
    error: null,
    success: false,
  });
  const [dragOver, setDragOver] = useState<boolean>(false);
  const location = useLocation();

  // Log navigation to detect potential GET requests
  useEffect(() => {
    console.log(`Navigated to ${location.pathname}. This should render MergePDF component only.`);
    if (location.pathname === "/merge") {
      console.warn("Ensure no GET requests are sent to http://localhost:5000/merge.");
    }
    // Check for unexpected API calls
    return () => {
      console.log("Leaving /merge route.");
    };
  }, [location]);

  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    validateAndSetFiles(selectedFiles);
  };

  // Handle drag and drop
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (!e.dataTransfer.files) return;
    const droppedFiles = Array.from(e.dataTransfer.files);
    validateAndSetFiles(droppedFiles);
  };

  const validateAndSetFiles = (selectedFiles: File[]) => {
    if (selectedFiles.length < 2) {
      setStatus({ loading: false, error: "Please select at least two PDF files", success: false });
      return;
    }
    if (selectedFiles.some(file => file.type !== "application/pdf")) {
      setStatus({ loading: false, error: "All files must be PDFs", success: false });
      return;
    }
    if (selectedFiles.some(file => file.size > 50 * 1024 * 1024)) {
      setStatus({ loading: false, error: "One or more files exceed 50MB limit", success: false });
      return;
    }
    setFiles(selectedFiles);
    setStatus({ loading: false, error: null, success: false });
    setMergedUrl(null);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  // Remove a file from the list
  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    setStatus({ loading: false, error: null, success: false });
  };

  // Handle merge submission
  const handleMerge = async (e?: FormEvent) => {
    e?.preventDefault(); // Prevent default form submission
    if (files.length < 2) {
      setStatus({ loading: false, error: "Please select at least two PDF files", success: false });
      return;
    }

    const formData = new FormData();
    files.forEach(file => formData.append("files", file));

    try {
      setStatus({ loading: true, error: null, success: false });

      console.log(`Sending POST request to ${import.meta.env.VITE_API_URL}/merge`, {
        fileNames: files.map(f => f.name),
        fileSizes: files.map(f => (f.size / 1024).toFixed(2) + " KB"),
      });

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/merge`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          responseType: "blob",
        }
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      setMergedUrl(url);
      setStatus({ loading: false, error: null, success: true });
      console.log("Merge successful, download URL created:", url);
      
      const fileInput = document.getElementById("file-input") as HTMLInputElement;
      if (fileInput) {
        fileInput.value = ""; // Clear file input
      }
    } catch (err: any) {
      console.error("Merge failed:", err);
      let errorMessage = "Failed to merge PDFs. Please try again.";
      if (err.response) {
        console.log("Error response:", {
          status: err.response.status,
          headers: err.response.headers,
          data: err.response.data ? await new Response(err.response.data).text() : "No data",
        });
        if (err.response.status === 405) {
          errorMessage = `Method Not Allowed (405): ${err.response.data?.message || "Ensure no GET requests are sent to /merge. Check routing or API calls."}`;
        } else if (err.response.status === 400) {
          errorMessage = err.response.data?.message || "Invalid files provided.";
        } else {
          errorMessage = err.response.data?.message || `Server error (${err.response.status}).`;
        }
      } else if (err.request) {
        errorMessage = "No response from server. Ensure backend is running at http://localhost:5000.";
      } else {
        errorMessage = `Request error: ${err.message}`;
      }
      setStatus({ loading: false, error: errorMessage, success: false });
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Merge PDF Files
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Combine multiple PDF documents into a single file. Select at least two PDFs to merge.
        </p>
      </div>
      
      <form onSubmit={handleMerge} encType="multipart/form-data" className="space-y-8">
        {/* File Upload Area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Select PDF Files (at least two)
          </label>
          
          <div 
            className={`relative p-8 border-2 border-dashed rounded-xl transition-all duration-200 ${
              dragOver 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              id="file-input"
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                <FiUpload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="mb-1 font-medium text-gray-900 dark:text-white">
                Drop PDF files here or click to browse
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Select at least 2 PDF files (up to 50MB each)
              </p>
            </div>
          </div>
        </div>

        {/* Selected Files List */}
        {files.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <FiFile className="mr-2 text-blue-500" />
              Selected Files ({files.length})
            </h3>
            
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {files.map((file, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center truncate">
                    <FiFile className="mr-3 text-gray-500 flex-shrink-0" />
                    <div className="truncate">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {file.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {(file.size / 1024).toFixed(2)} KB
                      </div>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Remove file"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Files will be merged in the order shown above.
              {files.length > 1 && (
                <button
                  type="button"
                  onClick={() => setFiles([])}
                  className="ml-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 underline"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={status.loading || files.length < 2}
            className={`relative flex items-center justify-center px-8 py-4 rounded-xl text-white font-semibold text-lg shadow-lg transition-all duration-300 ${
              status.loading 
                ? "bg-blue-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transform hover:-translate-y-0.5"
            } disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none`}
          >
            {status.loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Merging Files...
              </>
            ) : (
              <>
                <FiDownload className="mr-2" />
                Merge PDFs
              </>
            )}
          </button>
        </div>

        {/* Status Messages */}
        {status.error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-center text-red-800 dark:text-red-200">
              <FiAlertCircle className="mr-2 flex-shrink-0" />
              <span>{status.error}</span>
            </div>
          </div>
        )}

        {status.success && mergedUrl && (
          <div className="p-5 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800/50">
            <div className="flex items-center text-green-800 dark:text-green-200 mb-3">
              <FiCheck className="mr-2 flex-shrink-0" />
              <span className="font-medium">PDFs merged successfully!</span>
            </div>
            
            <a
              href={mergedUrl}
              download="merged.pdf"
              className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiDownload className="mr-2" />
              Download Merged PDF
            </a>
            
            <div className="mt-3 text-xs text-green-700 dark:text-green-300">
              The download will start automatically. If it doesn't, click the button above.
            </div>
          </div>
        )}
      </form>

      {/* Information Section */}
      <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30">
        <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-4 flex items-center">
          <FiAlertCircle className="mr-2" />
          How PDF merging works
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">1</span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Select at least two PDF files to merge
            </p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">2</span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Files are combined in the order you select them
            </p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">3</span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Our system preserves the quality of your original documents
            </p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">4</span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Download your merged PDF with a single click
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MergePDF;