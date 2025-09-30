import { useState, useRef } from 'react';
import type { ChangeEvent } from 'react'; 
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { FaFilePdf, FaSpinner, FaTimes, FaCloudUploadAlt, FaInfoCircle, FaFont, FaCopy } from 'react-icons/fa';

interface FileStatus {
  loading: boolean;
  error: string | null;
}

const OCRPDF = () => {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<FileStatus>({ loading: false, error: null });
    const [ocrText, setOcrText] = useState<string>("");
    const [showText, setShowText] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateAndSetFile = (selectedFile: File | null) => {
        if (!selectedFile) return;

        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff', 'image/bmp'];
        if (!allowedTypes.includes(selectedFile.type)) {
            setStatus({ loading: false, error: "Please select a PDF or image file (jpg, jpeg, png, tiff, bmp)" });
            setFile(null);
            return;
        }

        setFile(selectedFile);
        setStatus({ loading: false, error: null });
        setOcrText("");
        setShowText(false);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
          'application/pdf': ['.pdf'],
          'image/jpeg': ['.jpg', '.jpeg'],
          'image/png': ['.png'],
          'image/tiff': ['.tiff', '.tif'],
          'image/bmp': ['.bmp']
        },
        maxFiles: 1,
        onDrop: (acceptedFiles: File[]) => {
            if (acceptedFiles.length > 0) {
                validateAndSetFile(acceptedFiles[0]);
            }
        },
        onDropRejected: () => {
            setStatus({ loading: false, error: "Please select a valid PDF or image file (jpg, jpeg, png, tiff, bmp)" });
            setFile(null);
        }
    });

    const handleBrowseClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const removeFile = () => {
        setFile(null);
        setStatus({ loading: false, error: null });
        setOcrText("");
        setShowText(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleOCR = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setStatus({ loading: false, error: "Please select a PDF or image file" });
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setStatus({ loading: true, error: null });

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/ocr-pdf`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    responseType: "blob",
                }
            );

            // Always read OCR result as text
            const text = await new Response(response.data).text();
            setOcrText(text || "No text could be extracted");
            setShowText(true);

            setStatus({ loading: false, error: null });
        } catch (error) {
            console.error("OCR failed:", error);
            setStatus({ loading: false, error: "Failed to process OCR. Please try again." });
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-8 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">OCR PDF Tool</h1>

            <div className="text-gray-600 dark:text-gray-300 mb-8 text-center">
                Extract text from scanned PDFs and images using Optical Character Recognition.
            </div>

            <form onSubmit={handleOCR} className="space-y-6">
                {/* File Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select PDF or Image File
                    </label>
                    <div
                        {...getRootProps()}
                        className={`relative p-10 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-300 ${
                            isDragActive
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 transform scale-[1.01]'
                                : file
                                    ? 'border-green-500'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                        }`}
                    >
                        <input {...getInputProps()} ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className={`p-4 rounded-full ${isDragActive ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                <FaCloudUploadAlt className={`text-4xl ${isDragActive ? 'text-blue-500' : 'text-red-500'}`} />
                            </div>
                            <div>
                                <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                                    {isDragActive ? 'Drop your file here' : 'Upload PDF or Image'}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {isDragActive ? (
                                        'Release to upload your file'
                                    ) : (
                                        <>
                                            Drag & drop a file or <span className="text-blue-500 font-medium cursor-pointer" onClick={handleBrowseClick}>browse files</span>
                                        </>
                                    )}
                                </p>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Supported formats: PDF, JPG, JPEG, PNG, TIFF, BMP (Max size: 50MB)
                            </p>
                        </div>
                    </div>
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
                                        type="button"
                                    >
                                        <FaTimes className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* OCR Button */}
                <button
                    type="submit"
                    disabled={status.loading || !file}
                    className={`w-full flex items-center justify-center py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${
                        status.loading || !file
                            ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    }`}
                >
                    {status.loading ? (
                        <>
                            <FaSpinner className="animate-spin mr-3" />
                            Processing OCR...
                        </>
                    ) : (
                        <>
                            <FaFont className="mr-3" />
                            Extract Text
                        </>
                    )}
                </button>

                {/* Error Message */}
                {status.error && (
                    <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
                        <p className="text-sm font-medium text-red-700 dark:text-red-300">{status.error}</p>
                    </div>
                )}

                {/* Extracted Text */}
                {showText && ocrText && (
                    <div className="mt-8">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Extracted Text:</h3>
                        <div className="relative">
                            <textarea
                                readOnly
                                value={ocrText}
                                className="w-full h-64 p-4 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white resize-none"
                            />
                            <button
                                type="button"
                                onClick={() => navigator.clipboard.writeText(ocrText)}
                                className="absolute top-3 right-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-xl transition-colors flex items-center"
                            >
                                <FaCopy className="mr-2" />
                                Copy Text
                            </button>
                        </div>
                    </div>
                )}
            </form>

            {/* Instructions */}
            <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                <h2 className="font-semibold text-blue-800 dark:text-blue-300 mb-4 flex items-center">
                    <FaInfoCircle className="mr-2" />
                    How it works
                </h2>
                <ol className="list-decimal list-inside space-y-2 text-blue-700 dark:text-blue-300">
                    <li>Upload a scanned PDF or image file (JPG, JPEG, PNG, TIFF, BMP).</li>
                    <li>Our OCR technology will analyze the text in your document.</li>
                    <li>Extracted text will appear below.</li>
                    <li>You can copy the text for further use.</li>
                </ol>
            </div>
        </div>
    );
};

export default OCRPDF;