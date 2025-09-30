import { useState, useRef, type ChangeEvent } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { FaFilePdf, FaSpinner, FaTimes, FaDownload, FaCloudUploadAlt, FaInfoCircle, FaLock, FaCertificate } from 'react-icons/fa';

interface FileState {
  loading: boolean;
  error: string | null;
}

const SignPDF = () => {
    const [file, setFile] = useState<File | null>(null);
    const [certFile, setCertFile] = useState<File | null>(null);
    const [password, setPassword] = useState<string>("");
    const [signMode, setSignMode] = useState<"basic" | "certificate">("basic");
    const [processedFile, setProcessedFile] = useState<string | null>(null);
    const [status, setStatus] = useState<FileState>({ loading: false, error: null });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const certInputRef = useRef<HTMLInputElement>(null);

    const validateAndSetFile = (fileType: 'pdf' | 'cert', selectedFile: File | null) => {
        if (!selectedFile) {
            setStatus({ loading: false, error: `Please select a ${fileType === 'pdf' ? 'PDF' : 'certificate'} file.` });
            if (fileType === 'pdf') setFile(null);
            else setCertFile(null);
            return;
        }

        const isPdf = selectedFile.type === 'application/pdf';
        const fileExtension = selectedFile.name.slice((Math.max(0, selectedFile.name.lastIndexOf(".")) || Infinity) + 1);
        const isCertificate = ['pfx', 'p12'].includes(fileExtension.toLowerCase());

        if (fileType === 'pdf' && !isPdf) {
            setStatus({ loading: false, error: "Please select a valid PDF file." });
            setFile(null);
            return;
        }

        if (fileType === 'cert' && !isCertificate) {
            setStatus({ loading: false, error: "Please select a valid certificate file (.pfx or .p12)." });
            setCertFile(null);
            return;
        }

        if (fileType === 'pdf') {
            setFile(selectedFile);
        } else {
            setCertFile(selectedFile);
        }
        setStatus({ loading: false, error: null });
        setProcessedFile(null);
    };

    const { getRootProps: getPdfRootProps, getInputProps: getPdfInputProps, isDragActive: isPdfDragActive } = useDropzone({
        accept: {
            'application/pdf': ['.pdf']
        },
        maxFiles: 1,
        onDrop: (acceptedFiles: File[]) => {
            if (acceptedFiles.length > 0) {
                validateAndSetFile('pdf', acceptedFiles[0]);
            }
        },
        onDropRejected: () => {
            setStatus({ loading: false, error: "Please select a valid PDF file." });
            setFile(null);
        }
    });

    const { getRootProps: getCertRootProps, getInputProps: getCertInputProps, isDragActive: isCertDragActive } = useDropzone({
        accept: {
            'application/x-pkcs12': ['.pfx', '.p12']
        },
        maxFiles: 1,
        onDrop: (acceptedFiles: File[]) => {
            if (acceptedFiles.length > 0) {
                validateAndSetFile('cert', acceptedFiles[0]);
            }
        },
        onDropRejected: () => {
            setStatus({ loading: false, error: "Please select a valid certificate file (.pfx or .p12)." });
            setCertFile(null);
        }
    });

    const handleBrowseClick = (fileType: 'pdf' | 'cert') => {
        if (fileType === 'pdf' && fileInputRef.current) {
            fileInputRef.current.click();
        } else if (fileType === 'cert' && certInputRef.current) {
            certInputRef.current.click();
        }
    };

    const handleFileChange = (fileType: 'pdf' | 'cert', e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(fileType, e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setStatus({ loading: false, error: "Please select a PDF file" });
            return;
        }
        if (signMode === "certificate" && !certFile) {
            setStatus({ loading: false, error: "Please select a certificate file" });
            return;
        }
        if (signMode === "certificate" && !password) {
            setStatus({ loading: false, error: "Please enter the certificate password" });
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        if (signMode === "certificate" && certFile) {
            formData.append("cert", certFile);
            formData.append("password", password);
        }

        try {
            setStatus({ loading: true, error: null });
            const endpoint = signMode === "basic" ? "sign-pdf" : "sign-with-cert";
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
        } catch (error) {
            console.error("Signing failed:", error);
            setStatus({ loading: false, error: "Failed to sign PDF. Please try again." });
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-8 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">Sign PDF</h1>

            <div className="text-gray-600 dark:text-gray-300 mb-8 text-center">
                Digitally sign your PDF to ensure its authenticity and integrity.
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* PDF File Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Select PDF File
                        </label>
                        <div
                            {...getPdfRootProps()}
                            className={`relative p-10 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-300 ${
                                isPdfDragActive
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 transform scale-[1.01]'
                                    : file
                                        ? 'border-green-500'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                            }`}
                        >
                            <input {...getPdfInputProps()} ref={fileInputRef} className="hidden" onChange={(e) => handleFileChange('pdf', e)} />
                            <div className="flex flex-col items-center justify-center space-y-4">
                                <div className={`p-4 rounded-full ${isPdfDragActive ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                    <FaCloudUploadAlt className={`text-4xl ${isPdfDragActive ? 'text-blue-500' : 'text-red-500'}`} />
                                </div>
                                <div>
                                    <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                                        {isPdfDragActive ? 'Drop your PDF file here' : 'Upload PDF Document'}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {isPdfDragActive ? (
                                            'Release to upload your file'
                                        ) : (
                                            <>
                                                Drag & drop a file or <span className="text-blue-500 font-medium cursor-pointer" onClick={() => handleBrowseClick('pdf')}>browse files</span>
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
                                            onClick={() => setFile(null)}
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

                    {/* Certificate File Upload */}
                    {signMode === "certificate" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Select Certificate File (.pfx/.p12)
                            </label>
                            <div
                                {...getCertRootProps()}
                                className={`relative p-10 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-300 ${
                                    isCertDragActive
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 transform scale-[1.01]'
                                        : certFile
                                            ? 'border-green-500'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                                }`}
                            >
                                <input {...getCertInputProps()} ref={certInputRef} className="hidden" onChange={(e) => handleFileChange('cert', e)} />
                                <div className="flex flex-col items-center justify-center space-y-4">
                                    <div className={`p-4 rounded-full ${isCertDragActive ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                        <FaCloudUploadAlt className={`text-4xl ${isCertDragActive ? 'text-blue-500' : 'text-yellow-500'}`} />
                                    </div>
                                    <div>
                                        <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                                            {isCertDragActive ? 'Drop your certificate file here' : 'Upload Certificate File'}
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {isCertDragActive ? (
                                                'Release to upload your file'
                                            ) : (
                                                <>
                                                    Drag & drop a file or <span className="text-blue-500 font-medium cursor-pointer" onClick={() => handleBrowseClick('cert')}>browse files</span>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Supported formats: .pfx, .p12 (Max size: 50MB)
                                    </p>
                                </div>
                            </div>
                            {certFile && (
                                <div className="mt-8">
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                                        <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                                            <FaCertificate className="mr-2 text-yellow-500" />
                                            Selected Certificate
                                        </h3>

                                        <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                                            <div className="flex items-center space-x-4">
                                                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                                    <FaCertificate className="text-yellow-500 text-2xl" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white truncate max-w-xs">{certFile.name}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {(certFile.size / 1024).toFixed(2)} KB
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setCertFile(null)}
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
                    )}
                </div>

                {/* Signature Mode */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Signature Type</label>
                    <div className="flex space-x-4">
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                className="rounded-full h-5 w-5 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                name="signMode"
                                value="basic"
                                checked={signMode === "basic"}
                                onChange={() => setSignMode("basic")}
                            />
                            <span className="ml-2 text-gray-900 dark:text-gray-300">Basic Signature</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                className="rounded-full h-5 w-5 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                name="signMode"
                                value="certificate"
                                checked={signMode === "certificate"}
                                onChange={() => setSignMode("certificate")}
                            />
                            <span className="ml-2 text-gray-900 dark:text-gray-300">Digital Certificate</span>
                        </label>
                    </div>
                </div>

                {/* Certificate Mode Options */}
                {signMode === "certificate" && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Certificate Password
                        </label>
                        <div className="relative rounded-md shadow-sm">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-3 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                                placeholder="Enter certificate password"
                            />
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={
                        status.loading ||
                        !file ||
                        (signMode === "certificate" && (!certFile || !password))
                    }
                    className={`w-full flex items-center justify-center py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${
                        status.loading ||
                        !file ||
                        (signMode === "certificate" && (!certFile || !password))
                            ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    }`}
                >
                    {status.loading ? (
                        <>
                            <FaSpinner className="animate-spin mr-3" />
                            Signing...
                        </>
                    ) : (
                        <>
                            <FaLock className="mr-3" />
                            Sign PDF
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
                            download="signed.pdf"
                            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors shadow-md hover:shadow-lg"
                        >
                            <FaDownload className="mr-3" />
                            Download Signed PDF
                        </a>
                    </div>
                )}
            </form>

            {/* Instructions */}
            <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                <h2 className="font-semibold text-blue-800 dark:text-blue-300 mb-4 flex items-center">
                    <FaInfoCircle className="mr-2" />
                    How to Sign PDF
                </h2>
                <ol className="list-decimal list-inside space-y-2 text-blue-700 dark:text-blue-300">
                    <li>Upload your PDF file by dragging and dropping it into the upload area or by browsing your files.</li>
                    <li>Choose the signature type: Basic or Digital Certificate.</li>
                    {/* Conditionally render certificate instructions based on selected signMode */}
                    {signMode === "certificate" && (
                        <>
                            <li>Upload your Digital Certificate file (.pfx or .p12).</li>
                            <li>Enter the certificate password.</li>
                        </>
                    )}
                    <li>Click the "Sign PDF" button.</li>
                    <li>Once the signing is complete, a download link will appear. Click it to download your signed PDF file.</li>
                </ol>
            </div>
        </div>
    );
};

export default SignPDF;