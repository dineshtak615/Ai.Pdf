import { useState, useRef } from "react";
import type { ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { FaFilePdf, FaImage, FaSpinner, FaDownload } from "react-icons/fa";

interface FileWithType extends File {
  type: string;
}

interface Status {
  loading: boolean;
  error: string | null;
}

const JPGToPDF = () => {
  const [files, setFiles] = useState<FileWithType[]>([]);
  const [processedFile, setProcessedFile] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>({ loading: false, error: null });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const selectedFiles = Array.from(e.target.files) as FileWithType[];

    // ✅ validate only JPG/PNG
    const validFiles = selectedFiles.filter((file) => {
      const fileType = file.type.toLowerCase();
      return fileType === "image/jpeg" || fileType === "image/png";
    });

    if (selectedFiles.length !== validFiles.length) {
      setStatus({
        loading: false,
        error: "Please select only JPG or PNG images",
      });
      return;
    }

    // ✅ sort files by name so PDF keeps order (1.jpg, 2.jpg, 3.jpg)
    validFiles.sort((a, b) => a.name.localeCompare(b.name));

    setFiles(validFiles);
    setProcessedFile(null);
    setStatus({ loading: false, error: null });
  };

  const handleConvert = async (e: FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      setStatus({
        loading: false,
        error: "Please select at least one image",
      });
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      setStatus({ loading: true, error: null });
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/jpg-to-pdf`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          responseType: "blob", // ✅ ensures we get a file back
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setProcessedFile(url);
      setStatus({ loading: false, error: null });
    } catch (error) {
      console.error("Conversion failed:", error);
      setStatus({
        loading: false,
        error: "Failed to convert JPG to PDF. Please try again.",
      });
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        JPG to PDF Converter
      </h1>

      <div className="space-y-6">
        {/* Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select JPG/PNG Images
          </label>
          <div
            className="relative rounded-md shadow-sm"
            onClick={handleBrowseClick}
          >
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              multiple
              onChange={handleFileChange}
              className="sr-only"
              ref={fileInputRef}
              id="upload-image"
            />
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500">
              <div className="space-y-1 text-center">
                <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 dark:text-gray-300">
                  <label
                    htmlFor="upload-image"
                    className="font-medium text-blue-500 hover:text-blue-700 cursor-pointer"
                  >
                    Upload images
                  </label>
                  <span className="pl-1">or drag and drop</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  JPG, JPEG, PNG
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Show selected files */}
        {files.length > 0 && (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Selected: {files.map((file) => file.name).join(", ")}
          </div>
        )}

        {/* Convert Button */}
        <button
          type="submit"
          onClick={handleConvert}
          disabled={status.loading || files.length === 0}
          className={`w-full flex items-center justify-center py-4 px-6 rounded-xl font-medium text-white transition-all duration-300 ${
            status.loading || files.length === 0
              ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          }`}
        >
          {status.loading ? (
            <>
              <FaSpinner className="animate-spin mr-3" />
              Converting...
            </>
          ) : (
            <>
              <FaFilePdf className="mr-3" />
              Convert to PDF
            </>
          )}
        </button>

        {/* Error */}
        {status.error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              {status.error}
            </p>
          </div>
        )}

        {/* Download PDF */}
        {processedFile && (
          <div className="mt-8 text-center">
            <a
              href={processedFile}
              download="converted.pdf"
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors shadow-md hover:shadow-lg"
            >
              <FaDownload className="mr-3" />
              Download PDF
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default JPGToPDF;