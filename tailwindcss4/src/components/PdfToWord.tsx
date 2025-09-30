import { useState, useRef,type ChangeEvent, type DragEvent } from "react";
import axios from "axios";
import { 
  FaFilePdf, 
  FaFileWord, 
  FaCloudUploadAlt, 
  FaExchangeAlt, 
  FaTimes,
  FaDownload
} from "react-icons/fa";

export default function PdfToWord() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection (click upload)
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  // Handle drag & drop
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File | null) => {
    if (!selectedFile) return;
    
    if (selectedFile.type !== "application/pdf") {
      setError("Please select a PDF file");
      setFile(null);
      return;
    }
    
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError("File size exceeds 50MB limit");
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
    setError("");
    // Clear previous download when a new file is selected
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
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
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // Clear download URL when file is removed
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
  };

  // Send file to Flask
  const convertToWord = async () => {
    if (!file) {
      setError("Please upload a PDF first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setError("");
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/pdf-to-word`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          responseType: "blob",
        }
      );

      // Create a download link for the Word file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const filename = `${file.name.replace('.pdf', '')}.docx`;
      
      setDownloadUrl(url);
      setDownloadFilename(filename);
      
    } catch (error) {
      console.error("Conversion failed:", error);
      setError("Conversion failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle download
  const handleDownload = () => {
    if (!downloadUrl) return;
    
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", downloadFilename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          PDF to Word Converter
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Convert your PDF documents to editable Word format. Perfect for editing, repurposing, and extracting content.
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`relative p-10 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-300 ${
          dragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 transform scale-[1.01]'
            : file
            ? 'border-green-500'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          id="fileInput"
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
          ref={fileInputRef}
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={`p-4 rounded-full ${dragging ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
            <FaCloudUploadAlt className={`text-4xl ${dragging ? 'text-blue-500' : 'text-gray-400'}`} />
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              {dragging ? 'Drop your PDF file here' : 'Upload PDF Document'}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              {dragging ? (
                'Release to upload your file'
              ) : (
                <>
                  Drag & drop a file or{' '}
                  <span className="text-blue-500 font-medium cursor-pointer">browse files</span>
                </>
              )}
            </p>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Supported format: PDF (Max size: 50MB)
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
          <div className="flex items-center text-red-700 dark:text-red-300">
            <div className="flex-shrink-0">
              <FaTimes className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}

      {file && (
        <div className="mt-8">
          <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <FaFilePdf className="mr-2 text-red-500" />
              Selected File
            </h3>
            
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <FaFilePdf className="text-red-500 text-2xl" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white truncate max-w-xs">{file.name}</p>
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

            {!downloadUrl ? (
              <div className="mt-6">
                <button
                  onClick={convertToWord}
                  disabled={loading}
                  className={`w-full flex items-center justify-center py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${
                    loading
                      ? 'bg-blue-400 dark:bg-blue-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Converting...
                    </>
                  ) : (
                    <>
                      <FaExchangeAlt className="mr-3" />
                      Convert to Word
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="mt-6">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4 border border-green-200 dark:border-green-800">
                  <p className="text-green-700 dark:text-green-300 text-center font-medium">
                    Conversion successful! Your file is ready to download.
                  </p>
                </div>
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center py-4 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  <FaDownload className="mr-3" />
                  Download Word Document
                </button>
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                  File: {downloadFilename}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Information Section */}
      <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30">
        <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-4 flex items-center">
          <FaFileWord className="mr-2" />
          Why convert PDF to Word?
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">1</span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Edit content that was previously locked in PDF format
            </p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">2</span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Reuse content from PDFs in new documents and projects
            </p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">3</span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Extract text from scanned documents (OCR capability required)
            </p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">4</span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Make updates to documents without needing the original source files
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}