// src/components/PDFToExcel.tsx
import { useState, useRef } from "react";
import type { ChangeEvent, DragEvent, FormEvent } from "react";
import axios from "axios";
import { FaFilePdf, FaFileExcel, FaCloudUploadAlt, FaExchangeAlt, FaTimes } from "react-icons/fa";

interface Status {
  loading: boolean;
  error: string | null;
}

const PDFToExcel = () => {
    const [file, setFile] = useState<File | null>(null);
    const [processedFile, setProcessedFile] = useState<string | null>(null);
    const [status, setStatus] = useState<Status>({ loading: false, error: null });
    const [dragging, setDragging] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            validateAndSetFile(selectedFile);
        }
    };

    const validateAndSetFile = (selectedFile: File) => {
        if (!selectedFile) return;

        if (selectedFile.type !== "application/pdf") {
            setStatus({ loading: false, error: "Please select a PDF file" });
            setFile(null);
            return;
        }

        if (selectedFile.size > 50 * 1024 * 1024) {
            setStatus({ loading: false, error: "File size exceeds 50MB limit" });
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
        setStatus({ loading: false, error: null });
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleConvert = async (e: FormEvent) => {
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
                `${import.meta.env.VITE_API_URL}/pdf-to-excel`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    responseType: "blob",
                }
            );

            const blob = new Blob([response.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            });
            const url = URL.createObjectURL(blob);
            setProcessedFile(url);
            setStatus({ loading: false, error: null });
        } catch (error) {
            console.error("Conversion failed:", error);
            setStatus({ loading: false, error: "Failed to convert PDF to Excel. Please try again." });
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-8 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    PDF to Excel Converter
                </h1>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Convert your PDF documents to editable Excel spreadsheets. Perfect for data extraction and analysis.
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

            {status.error && (
                <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
                    <div className="flex items-center text-red-700 dark:text-red-300">
                        <div className="flex-shrink-0">
                            <FaTimes className="h-5 w-5" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium">{status.error}</p>
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

                        <div className="mt-6">
                            <button
                                onClick={handleConvert}
                                disabled={status.loading || !file}
                                className={`w-full flex items-center justify-center py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${
                                    status.loading || !file
                                        ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
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
                                        Convert to Excel
                                    </>
                                )}
                            </button>
                        </div>

                        {processedFile && (
                            <div className="mt-6">
                                <a
                                    href={processedFile}
                                    download="converted.xlsx"
                                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    <FaFileExcel className="mr-2" />
                                    Download Excel File
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Information Section */}
            <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-4 flex items-center">
                    <FaFileExcel className="mr-2" />
                    Why convert PDF to Excel?
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                            <span className="text-blue-600 dark:text-blue-400 font-semibold">1</span>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            Extract data from PDF tables for analysis
                        </p>
                    </div>
                    <div className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                            <span className="text-blue-600 dark:text-blue-400 font-semibold">2</span>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            Easily edit and manipulate data in a spreadsheet format
                        </p>
                    </div>
                    <div className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                            <span className="text-blue-600 dark:text-blue-400 font-semibold">3</span>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            Import PDF data into other applications for further processing
                        </p>
                    </div>
                    <div className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                            <span className="text-blue-600 dark:text-blue-400 font-semibold">4</span>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            Save time by automating data extraction from PDFs
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PDFToExcel;