import { useState, useRef } from "react";
import type { ChangeEvent, DragEvent } from "react";
import axios from "axios";
import { FiUpload, FiFile, FiDownload, FiAlertCircle, FiCheck, FiX } from "react-icons/fi";
import { AiOutlineCompress } from 'react-icons/ai';

const CompressPDF = () => {
    const [file, setFile] = useState<File | null>(null);
    const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
    const [originalSize, setOriginalSize] = useState<number>(0);
    const [compressedSize, setCompressedSize] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [dragOver, setDragOver] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        validateAndSetFile(selectedFile);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        validateAndSetFile(droppedFile);
    };

    const validateAndSetFile = (selectedFile: File | null) => {
        if (!selectedFile) return;

        if (selectedFile.type !== "application/pdf") {
            setError("Please select a PDF file");
            setFile(null);
            return;
        }

        if (selectedFile.size > 100 * 1024 * 1024) {
            setError("File size exceeds 100MB limit");
            setFile(null);
            return;
        }

        setFile(selectedFile);
        setOriginalSize(selectedFile.size);
        setCompressedUrl(null);
        setCompressedSize(0);
        setError("");
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
        setCompressedUrl(null);
        setError("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleCompress = async () => {
        if (!file) {
            setError("Please select a PDF file first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);
            setError("");
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/compress`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    responseType: "blob",
                }
            );

            const blob = new Blob([res.data], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            setCompressedUrl(url);
            setCompressedSize(blob.size);

            // Check if we got a valid PDF (simple validation)
            if (blob.size < 100) {
                const text = await blob.text();
                if (text.includes("error") || text.includes("Error")) {
                    setError("Compression failed. The server returned an error.");
                    setCompressedUrl(null);
                }
            }
        } catch (err) {
            setError("Compression failed. Please try again.");
            console.error("Compression failed", err);
        } finally {
            setLoading(false);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + " bytes";
        else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
        else return (bytes / 1048576).toFixed(2) + " MB";
    };

    const calculateReduction = (): string => {
        if (!originalSize || !compressedSize) return "0";
        return ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
    };

    return (
        <div className="max-w-2xl mx-auto mt-8 p-6  rounded-xl shadow-lg">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    Compress PDF File
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                    Reduce your PDF file size without losing quality
                </p>
            </div>

            <div className="space-y-6">
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
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileChange}
                            ref={fileInputRef}
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
                                        {formatFileSize(file.size)}
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
                                        PDF up to 100MB
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={handleCompress}
                    disabled={loading || !file}
                    className={`w-full py-3 rounded-lg text-white font-medium flex items-center justify-center transition-colors duration-200 ${
                        loading
                            ? "bg-blue-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                    } disabled:bg-gray-400 disabled:cursor-not-allowed`}
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Compressing...
                        </>
                    ) : (
                        <>
                            <AiOutlineCompress className="mr-2" />
                            Compress PDF
                        </>
                    )}
                </button>

                {/* Status Messages */}
                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center text-red-700 dark:text-red-300">
                            <FiAlertCircle className="mr-2 flex-shrink-0" />
                            <span className="text-sm">{error}</span>
                        </div>
                    </div>
                )}

                {/* Results */}
                {compressedUrl && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center text-green-700 dark:text-green-300 mb-3">
                            <FiCheck className="mr-2 flex-shrink-0" />
                            <span className="font-medium">PDF compressed successfully!</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="p-3 bg-white dark:bg-gray-700 rounded-md text-center">
                                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Original Size</div>
                                <div className="font-medium text-gray-800 dark:text-white">{formatFileSize(originalSize)}</div>
                            </div>
                            <div className="p-3 bg-white dark:bg-gray-700 rounded-md text-center">
                                <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">Compressed Size</div>
                                <div className="font-medium text-green-600 dark:text-green-400">{formatFileSize(compressedSize)}</div>
                            </div>
                        </div>

                        {compressedSize > 0 && originalSize > compressedSize && (
                            <div className="mb-4 text-center">
                                <div className="text-sm font-medium text-gray-800 dark:text-white">
                                    Size reduced by {calculateReduction()}%
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                                    <div
                                        className="bg-green-500 h-2 rounded-full"
                                        style={{ width: `${100 - (compressedSize / originalSize * 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        <a
                            href={compressedUrl}
                            download="compressed.pdf"
                            className="w-full inline-flex items-center justify-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                        >
                            <FiDownload className="mr-2" />
                            Download Compressed PDF
                        </a>
                    </div>
                )}
            </div>

            {/* Information Section */}
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center">
                    <FiAlertCircle className="mr-2" />
                    How PDF compression works
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Reduces file size while maintaining quality</li>
                    <li>• Optimizes images and removes unnecessary data</li>
                    <li>• Makes PDFs easier to share and store</li>
                    <li>• Preserves text and vector elements</li>
                </ul>
            </div>
        </div>
    );
};

export default CompressPDF;