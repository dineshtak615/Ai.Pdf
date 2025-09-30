import { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { FaFilePdf, FaSpinner, FaTimes, FaDownload, FaCloudUploadAlt, FaInfoCircle, FaLock, FaUnlock } from 'react-icons/fa';

interface FileStatus {
  loading: boolean;
  error: string | null;
}

const LockUnlockPDF = () => {
    const [file, setFile] = useState<File | null>(null);
    const [password, setPassword] = useState<string>("");
    const [action, setAction] = useState<"encrypt" | "decrypt">("encrypt");
    const [processedFile, setProcessedFile] = useState<string | null>(null);
    const [status, setStatus] = useState<FileStatus>({ loading: false, error: null });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateAndSetFile = (selectedFile: File | null) => {
        if (!selectedFile) {
            setStatus({ loading: false, error: "Please select a PDF file." });
            setFile(null);
            return;
        }

        if (selectedFile.type !== 'application/pdf') {
            setStatus({ loading: false, error: "Please select a PDF file." });
            setFile(null);
            return;
        }

        setFile(selectedFile);
        setStatus({ loading: false, error: null });
        setProcessedFile(null);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
          'application/pdf': ['.pdf']
        },
        maxFiles: 1,
        onDrop: (acceptedFiles: File[]) => {
            if (acceptedFiles.length > 0) {
                validateAndSetFile(acceptedFiles[0]);
            }
        },
        onDropRejected: () => {
            setStatus({ loading: false, error: "Please select a valid PDF file." });
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
        setProcessedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setStatus({ loading: false, error: "Please select a PDF file" });
            return;
        }
        if (!password) {
            setStatus({ loading: false, error: "Please enter a password" });
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("password", password);

        try {
            setStatus({ loading: true, error: null });
            const endpoint = action === "encrypt" ? "encrypt-pdf" : "decrypt-pdf";
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/${endpoint}`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    responseType: "blob",
                }
            );

            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            setProcessedFile(url);
            setStatus({ loading: false, error: null });
        } catch (error: any) {
            console.error(`${action} failed:`, error);
            setStatus({
                loading: false,
                error: `Failed to ${action} PDF. ${error.response?.data?.message || ''}`
            });
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-8 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">{action === "encrypt" ? "Lock" : "Unlock"} PDF</h1>

            <div className="text-gray-600 dark:text-gray-300 mb-8 text-center">
                {action === "encrypt" ? "Encrypt your PDF file with a password to protect its content." : "Remove the password from your PDF file to unlock it."}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* File Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select PDF File
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
                                    {isDragActive ? 'Drop your PDF file here' : 'Upload PDF Document'}
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
                                Supported format: PDF (Max size: 50MB)
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
                                        onClick={() => removeFile()}
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

                {/* Action Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Action
                    </label>
                    <div className="flex space-x-4">
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                className="rounded-full  h-5 w-5 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                name="action"
                                value="encrypt"
                                checked={action === "encrypt"}
                                onChange={() => setAction("encrypt")}
                            />
                            <span className="ml-2 text-gray-900 dark:text-gray-300">Encrypt/Lock</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                className="rounded-full h-5 w-5 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                name="action"
                                value="decrypt"
                                checked={action === "decrypt"}
                                onChange={() => setAction("decrypt")}
                            />
                            <span className="ml-2 text-gray-900 dark:text-gray-300">Decrypt/Unlock</span>
                        </label>
                    </div>
                </div>

                {/* Password Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {action === "encrypt" ? "Encryption" : "Decryption"} Password
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <input
                        type="password"
                        value={password}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        className="block w-full pl-3 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                        placeholder={`Enter ${action === "encrypt" ? "encryption" : "decryption"} password`}
                    />
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={status.loading || !file || !password}
                    className={`w-full flex items-center justify-center py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${
                        status.loading || !file || !password
                            ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    }`}
                >
                    {status.loading ? (
                        <>
                            <FaSpinner className="animate-spin mr-3" />
                            Processing...
                        </>
                    ) : (
                        <>
                            {action === "encrypt" ? <FaLock className="mr-3" /> : <FaUnlock className="mr-3" />}
                            {action === "encrypt" ? "Encrypt PDF" : "Decrypt PDF"}
                        </>
                    )}
                </button>

                {/* Error Message */}
                {status.error && (
                    <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
                        <p className="text-sm font-medium text-red-700 dark:text-red-300">{status.error}</p>
                    </div>
                )}

                {/* Processed File */}
                {processedFile && (
                    <div className="mt-8 text-center">
                        <a
                            href={processedFile}
                            download={action === "encrypt" ? "encrypted.pdf" : "decrypted.pdf"}
                            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors shadow-md hover:shadow-lg"
                        >
                            <FaDownload className="mr-3" />
                            Download {action === "encrypt" ? "Encrypted" : "Decrypted"} PDF
                        </a>
                    </div>
                )}
            </form>

            {/* Instructions */}
            <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                <h2 className="font-semibold text-blue-800 dark:text-blue-300 mb-4 flex items-center">
                    <FaInfoCircle className="mr-2" />
                    How to {action === "encrypt" ? "Lock" : "Unlock"} PDF
                </h2>
                <ol className="list-decimal list-inside space-y-2 text-blue-700 dark:text-blue-300">
                    <li>Upload your PDF file by dragging and dropping it into the upload area or by browsing your files.</li>
                    <li>Select whether you want to encrypt or decrypt the PDF.</li>
                    <li>Enter the password.</li>
                    <li>Click the "{action === "encrypt" ? "Encrypt" : "Decrypt"} PDF" button.</li>
                    <li>Once the process is complete, a download link will appear. Click it to download your processed PDF file.</li>
                </ol>
            </div>
        </div>
    );
};

export default LockUnlockPDF;