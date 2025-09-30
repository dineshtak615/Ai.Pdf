// src/components/HTMLToPDF.tsx
import { useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { FaFilePdf, FaGlobe, FaCode, FaExchangeAlt, FaTimes } from "react-icons/fa";

const HTMLToPDF = () => {
    const [inputType, setInputType] = useState<"url" | "html">("url");
    const [url, setUrl] = useState<string>("");
    const [htmlContent, setHtmlContent] = useState<string>("");
    const [processedFile, setProcessedFile] = useState<string | null>(null);
    const [status, setStatus] = useState<{ loading: boolean; error: string | null }>({ 
        loading: false, 
        error: null 
    });

    const handleConvert = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (inputType === "url" && !url) {
            setStatus({ loading: false, error: "Please enter a URL" });
            return;
        }

        if (inputType === "html" && !htmlContent) {
            setStatus({ loading: false, error: "Please enter HTML content" });
            return;
        }

        const formData = new FormData();

        if (inputType === "url") {
            formData.append("url", url);
        } else {
            formData.append("html", htmlContent);
        }

        try {
            setStatus({ loading: true, error: null });

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/html-to-pdf`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    responseType: "blob",
                }
            );

            const blob = new Blob([response.data], { type: "application/pdf" });
            const pdfUrl = URL.createObjectURL(blob);
            setProcessedFile(pdfUrl);
            setStatus({ loading: false, error: null });
        } catch (error) {
            console.error("HTML to PDF conversion failed:", error);
            setStatus({ loading: false, error: "Failed to convert to PDF. Please try again." });
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-8 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    HTML to PDF Converter
                </h1>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Convert web pages or HTML content to PDF documents. Choose between URL or direct HTML input.
                </p>
            </div>

            <form onSubmit={handleConvert} className="space-y-6">
                {/* Input Type Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Input Type
                    </label>
                    <div className="flex space-x-4">
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                value="url"
                                checked={inputType === "url"}
                                onChange={() => setInputType("url")}
                                className="form-radio h-5 w-5 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <span className="ml-2 text-gray-900 dark:text-gray-300">URL</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                value="html"
                                checked={inputType === "html"}
                                onChange={() => setInputType("html")}
                                className="form-radio h-5 w-5 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <span className="ml-2 text-gray-900 dark:text-gray-300">HTML Content</span>
                        </label>
                    </div>
                </div>

                {/* URL Input */}
                {inputType === "url" && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Website URL
                        </label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaGlobe className="text-gray-400" />
                            </div>
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                            />
                        </div>
                    </div>
                )}

                {/* HTML Content Input */}
                {inputType === "html" && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            HTML Content
                        </label>
                        <div className="relative rounded-md shadow-sm">
                            <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                                <FaCode className="text-gray-400 mt-1" />
                            </div>
                            <textarea
                                value={htmlContent}
                                onChange={(e) => setHtmlContent(e.target.value)}
                                placeholder="Paste your HTML content here"
                                rows={8}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white resize-none"
                            />
                        </div>
                    </div>
                )}

                {/* Convert Button */}
                <button
                    type="submit"
                    disabled={status.loading || (inputType === "url" && !url) || (inputType === "html" && !htmlContent)}
                    className={`w-full flex items-center justify-center py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${
                        status.loading
                            ? 'bg-blue-400 dark:bg-blue-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    }`}
                >
                    {status.loading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                            Converting to PDF...
                        </>
                    ) : (
                        <>
                            <FaExchangeAlt className="mr-3" />
                            Convert to PDF
                        </>
                    )}
                </button>

                {/* Error Message */}
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

                {/* PDF Preview and Download */}
                {processedFile && (
                    <div className="mt-8">
                        <div className="flex justify-center mb-4">
                            <a
                                href={processedFile}
                                download="converted.pdf"
                                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-200"
                            >
                                <FaFilePdf className="mr-2" />
                                Download PDF
                            </a>
                        </div>
                        <iframe
                            src={processedFile}
                            className="w-full h-96 border border-gray-300 dark:border-gray-700 rounded-xl"
                            title="PDF preview"
                        />
                    </div>
                )}
            </form>

            {/* Features Section */}
            <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-4 flex items-center">
                    <FaFilePdf className="mr-2" />
                    Key Features
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 list-disc pl-5 space-y-2">
                    <li>Convert any website URL to PDF</li>
                    <li>Paste HTML content directly for conversion</li>
                    <li>Preserve styling and layout</li>
                    <li>Customize page size, margins, and orientation (if supported by backend)</li>
                    <li>Include background images and colors</li>
                </ul>
            </div>
        </div>
    );
};

export default HTMLToPDF;