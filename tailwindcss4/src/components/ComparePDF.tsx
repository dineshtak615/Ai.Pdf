// src/components/ComparePDF.tsx
import { useState, useRef } from "react";
import type { FormEvent } from "react";
import type { DragEvent } from "react";
import type { ChangeEvent } from "react";
import axios from "axios";

interface FileState {
  file1: File | null;
  file2: File | null;
}

interface StatusState {
  loading: boolean;
  error: string | null;
}

interface IsDraggingState {
  file1: boolean;
  file2: boolean;
}

interface ComparisonResult {
  file1Pages?: number;
  file2Pages?: number;
  differences?: string[];
  similarity?: number;
  [key: string]: any; // Allow for additional properties
}

const ComparePDF = () => {
  const [files, setFiles] = useState<FileState>({ file1: null, file2: null });
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [status, setStatus] = useState<StatusState>({ loading: false, error: null });
  const [isDragging, setIsDragging] = useState<IsDraggingState>({ file1: false, file2: false });
  const fileInput1Ref = useRef<HTMLInputElement>(null);
  const fileInput2Ref = useRef<HTMLInputElement>(null);

  const handleFileChange = (fileNumber: number, e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({
        ...prev,
        [`file${fileNumber}`]: e.target.files![0]
      }));
      setComparisonResult(null);
      setStatus({ loading: false, error: null });
    }
  };

  const handleDragOver = (fileNumber: number, e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(prev => ({ ...prev, [`file${fileNumber}`]: true }));
  };

  const handleDragLeave = (fileNumber: number, e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(prev => ({ ...prev, [`file${fileNumber}`]: false }));
  };

  const handleDrop = (fileNumber: number, e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(prev => ({ ...prev, [`file${fileNumber}`]: false }));
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setFiles(prev => ({
          ...prev,
          [`file${fileNumber}`]: file
        }));
        setComparisonResult(null);
        setStatus({ loading: false, error: null });
      } else {
        setStatus({ loading: false, error: "Please select a PDF file" });
      }
    }
  };

  const handleCompare = async (e: FormEvent) => {
    e.preventDefault();
    if (!files.file1 || !files.file2) {
      setStatus({ loading: false, error: "Please select two PDF files to compare" });
      return;
    }

    const formData = new FormData();
    formData.append("file1", files.file1);
    formData.append("file2", files.file2);

    try {
      setStatus({ loading: true, error: null });
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/compare-pdf`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setComparisonResult(response.data);
      setStatus({ loading: false, error: null });
    } catch (error) {
      console.error("PDF comparison failed:", error);
      setStatus({ loading: false, error: "Failed to compare PDFs. Please try again." });
    }
  };

  const removeFile = (fileNumber: number) => {
    setFiles(prev => ({ ...prev, [`file${fileNumber}`]: null }));
    if (fileNumber === 1 && fileInput1Ref.current) fileInput1Ref.current.value = "";
    if (fileNumber === 2 && fileInput2Ref.current) fileInput2Ref.current.value = "";
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Compare PDF Files</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Upload two PDF files to compare their content and find differences
        </p>
      </div>
      
      <form onSubmit={handleCompare} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* File 1 Input */}
          <div 
            className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
              isDragging.file1 
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
            }`}
            onDragOver={(e) => handleDragOver(1, e)}
            onDragLeave={(e) => handleDragLeave(1, e)}
            onDrop={(e) => handleDrop(1, e)}
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-200">First PDF File</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Drag & drop or click to upload</p>
              </div>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange(1, e)}
                ref={fileInput1Ref}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            
            {files.file1 && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-xs">
                    {files.file1.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({(files.file1.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
                <button 
                  type="button" 
                  onClick={() => removeFile(1)}
                  className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* File 2 Input */}
          <div 
            className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
              isDragging.file2 
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
            }`}
            onDragOver={(e) => handleDragOver(2, e)}
            onDragLeave={(e) => handleDragLeave(2, e)}
            onDrop={(e) => handleDrop(2, e)}
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-700 dark:text-gray-200">Second PDF File</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Drag & drop or click to upload</p>
              </div>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange(2, e)}
                ref={fileInput2Ref}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            
            {files.file2 && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-xs">
                    {files.file2.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({(files.file2.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
                <button 
                  type="button" 
                  onClick={() => removeFile(2)}
                  className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="text-center">
          <button
            type="submit"
            disabled={status.loading || !files.file1 || !files.file2}
            className={`relative px-8 py-3 rounded-full text-white font-medium text-lg transition-all duration-300 transform ${
              status.loading 
                ? "bg-blue-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            } disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none shadow-md`}
          >
            {status.loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Comparing PDFs...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                Compare PDFs
              </span>
            )}
          </button>
        </div>

        {status.error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
              </svg>
            </div>
            <p className="text-red-700 dark:text-red-300">{status.error}</p>
          </div>
        )}

        {comparisonResult && (
          <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 transition-all duration-300">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Comparison Results
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-800 dark:text-white mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  File 1: {files.file1?.name}
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <p>Pages: {comparisonResult.file1Pages || 'N/A'}</p>
                  <p>Size: {files.file1 ? `${(files.file1.size / 1024).toFixed(2)} KB` : 'N/A'}</p>
                </div>
              </div>
              
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-800 dark:text-white mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  File 2: {files.file2?.name}
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <p>Pages: {comparisonResult.file2Pages || 'N/A'}</p>
                  <p>Size: {files.file2 ? `${(files.file2.size / 1024).toFixed(2)} KB` : 'N/A'}</p>
                </div>
              </div>
            </div>
            
            {comparisonResult.differences && comparisonResult.differences.length > 0 ? (
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 dark:text-white mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                  Differences Found:
                </h4>
                <ul className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg p-4 space-y-2">
                  {comparisonResult.differences.map((diff, index) => (
                    <li key={index} className="text-red-700 dark:text-red-300 text-sm flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 mr-2 flex-shrink-0"></span>
                      {diff}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <p className="text-green-700 dark:text-green-300 font-medium">
                  No differences found. The PDF files appear to be identical.
                </p>
              </div>
            )}
            
            {comparisonResult.similarity && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center">
                <svg className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
                <p className="text-blue-700 dark:text-blue-300">
                  Similarity: <span className="font-semibold">{comparisonResult.similarity}%</span>
                </p>
              </div>
            )}
          </div>
        )}
      </form>

      <div className="mt-10 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
        <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          How it works:
        </h4>
        <ul className="text-blue-700 dark:text-blue-300 space-y-2">
          <li className="flex items-start">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2 flex-shrink-0"></span>
            Upload two PDF files to compare using drag & drop or file selection
          </li>
          <li className="flex items-start">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2 flex-shrink-0"></span>
            Our system analyzes text content, metadata, and structure
          </li>
          <li className="flex items-start">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2 flex-shrink-0"></span>
            Get a detailed report of differences between the files
          </li>
          <li className="flex items-start">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2 flex-shrink-0"></span>
            See visual highlights of changes (if supported by backend)
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ComparePDF;