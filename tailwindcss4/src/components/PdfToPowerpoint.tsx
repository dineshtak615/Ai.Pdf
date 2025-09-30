import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFilePdf, FaFilePowerpoint, FaSpinner, FaTimes, FaDownload } from 'react-icons/fa';
import axios from 'axios';

interface FileWithPreview extends File {
  preview: string;
}

const PdfToPowerpoint = () => {
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [isConverting, setIsConverting] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState('');
    const [error, setError] = useState('');

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
          'application/pdf': ['.pdf']
        },
        maxFiles: 1,
        onDrop: acceptedFiles => {
            setError('');
            setFiles(
                acceptedFiles.map(file => Object.assign(file, {
                    preview: URL.createObjectURL(file)
                }))
            );
            setDownloadUrl('');
        },
        onDropRejected: (fileRejections) => {
            if (fileRejections.length > 0 && fileRejections[0]?.errors[0]?.code === 'file-invalid-type') {
                setError('Please upload only PDF files');
            } else {
                setError('File upload failed. Please try again.');
            }
        }
    });

    const removeFile = () => {
        if (files[0]?.preview) URL.revokeObjectURL(files[0].preview);
        setFiles([]);
        setDownloadUrl('');
        setError('');
    };

    const convertToPowerpoint = async () => {
        if (files.length === 0) {
            setError('Please select a PDF file first');
            return;
        }

        setIsConverting(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append("file", files[0]);

            const response = await axios.post(
              `${import.meta.env.VITE_API_URL}/pdf-to-pptx`,
              formData,
              {
                responseType: "blob",
                headers: { "Content-Type": "multipart/form-data" },
                timeout: 120000,
              }
            );

            const blob = new Blob([response.data], {
                type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            });
            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);

        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                if (err.code === 'ECONNABORTED') {
                    setError('Request timeout. The conversion is taking too long.');
                } else if (err.response?.status === 500) {
                    setError('Server error during conversion. Please check the backend logs.');
                } else if (err.response?.status === 404) {
                    setError('Server endpoint not found. Please check Flask routes.');
                } else if (err.response?.status === 400) {
                    setError('Invalid file. Please upload a valid PDF.');
                } else {
                    setError('Conversion failed. Please try again.');
                }
            } else if (err instanceof Error) {
                if (err.message === 'Network Error') {
                    setError('Cannot connect to server. Please make sure the Flask server is running.');
                } else {
                    setError('Conversion failed. Please try again.');
                }
            } else {
                setError('Conversion failed. Please try again.');
            }
            console.error('Conversion error:', err);
        } finally {
            setIsConverting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-8 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    PDF to PowerPoint Converter
                </h1>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Convert your PDF files into editable PowerPoint presentations seamlessly.
                </p>
            </div>

            {/* File Drop */}
            <div
                {...getRootProps()}
                className={`relative p-10 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-300 ${
                    isDragActive
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 transform scale-[1.01]'
                        : files.length > 0
                            ? 'border-green-500'
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                }`}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className={`p-4 rounded-full ${isDragActive ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                        <FaFilePdf className={`text-4xl ${isDragActive ? 'text-blue-500' : 'text-red-500'}`} />
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
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
                </div>
            )}

            {files.length > 0 && (
                <div className="mt-8">
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                            Selected File
                        </h3>

                        <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                            <div className="flex items-center">
                                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg mr-4">
                                    <FaFilePdf className="text-red-500 text-2xl" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{files[0].name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {(files[0].size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={removeFile}
                                className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-full"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={convertToPowerpoint}
                                disabled={isConverting || !!downloadUrl}
                                className={`w-full flex items-center justify-center py-4 px-6 rounded-xl font-medium text-white transition-all duration-300 ${
                                    isConverting || downloadUrl
                                        ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                                }`}
                            >
                                {isConverting ? (
                                    <>
                                        <FaSpinner className="animate-spin mr-3" />
                                        Converting...
                                    </>
                                ) : (
                                    <>
                                        <FaFilePowerpoint className="mr-3" />
                                        Convert to PowerPoint
                                    </>
                                )}
                            </button>

                            {downloadUrl && (
                                <a
                                    href={downloadUrl}
                                    download={files[0].name.replace(/\.[^/.]+$/, '') + '.pptx'}
                                    className="w-full flex items-center justify-center py-4 px-6 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors shadow-md hover:shadow-lg"
                                >
                                    <FaDownload className="mr-3" />
                                    Download PowerPoint
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                <h2 className="font-semibold text-blue-800 dark:text-blue-300 mb-4">
                    How to Use
                </h2>
                <ol className="list-decimal list-inside space-y-2 text-blue-700 dark:text-blue-300">
                    <li>Upload your PDF file by dragging and dropping or browsing.</li>
                    <li>Click the "Convert to PowerPoint" button.</li>
                    <li>Once the conversion is complete, download the .pptx file.</li>
                </ol>
            </div>
        </div>
    );
};

export default PdfToPowerpoint;