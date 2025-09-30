import { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFilePowerpoint, FaFilePdf, FaSpinner, FaTimes, FaDownload } from 'react-icons/fa';
import axios from 'axios';

// Define the type for our files with preview
interface FileWithPreview extends File {
  preview: string;
}

const PowerpointToPdf = () => {
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [isConverting, setIsConverting] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState('');
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            'application/vnd.ms-powerpoint': ['.ppt'],
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
        },
        maxFiles: 1,
        onDrop: (acceptedFiles: File[]) => {
            setError('');
            setFiles(acceptedFiles.map(file => Object.assign(file, {
                preview: URL.createObjectURL(file)
            }) as FileWithPreview));
        },
        onDropRejected: () => {
            setError('Please upload only PowerPoint files (.ppt or .pptx)');
        }
    });

    const removeFile = () => {
        // Revoke the object URL to avoid memory leaks
        if (files.length > 0) {
            URL.revokeObjectURL(files[0].preview);
        }
        setFiles([]);
        setDownloadUrl('');
        setError('');
    };

    const convertToPdf = async () => {
        if (files.length === 0) {
            setError('Please select a PowerPoint file first');
            return;
        }

        setIsConverting(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', files[0]);

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/pptx-to-pdf`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    responseType: 'blob', // backend returns the PDF file
                    timeout: 120000 // optional for large PPTX
                }
            );

            // Convert blob to URL for download
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);
        } catch (err) {
            setError('Conversion failed. Please try again.');
            console.error(err);
        } finally {
            setIsConverting(false);
        }
    };

    const handleBrowseClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-8 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">PowerPoint to PDF Converter</h1>

            <div
                {...getRootProps()}
                className={`relative p-10 border-2 border-dashed rounded-xl text-center transition-all duration-300 ${
                    isDragActive
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 transform scale-[1.01]'
                        : files.length > 0
                            ? 'border-green-500'
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                }`}
            >
                <input {...getInputProps()} ref={fileInputRef} />
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className={`p-4 rounded-full ${isDragActive ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                        <FaFilePowerpoint className={`text-4xl ${isDragActive ? 'text-blue-500' : 'text-orange-500'}`} />
                    </div>
                    <div>
                        <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                            {isDragActive ? 'Drop your PowerPoint file here' : 'Upload PowerPoint Document'}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                            {isDragActive ? (
                                'Release to upload your file'
                            ) : (
                                <>
                                    Drag & drop a file or{' '}
                                    <span className="text-blue-500 font-medium cursor-pointer" onClick={handleBrowseClick}>browse files</span>
                                </>
                            )}
                        </p>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Supported formats: .ppt, .pptx (Max size: 50MB)
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
                                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg mr-4">
                                    <FaFilePowerpoint className="text-orange-500 text-2xl" />
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
                                onClick={convertToPdf}
                                disabled={isConverting}
                                className={`w-full flex items-center justify-center py-4 px-6 rounded-xl font-medium text-white transition-all duration-300 ${
                                    isConverting
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
                                        <FaFilePdf className="mr-3" />
                                        Convert to PDF
                                    </>
                                )}
                            </button>

                            {downloadUrl && (
                                <a
                                    href={downloadUrl}
                                    download={files[0].name.replace(/\.[^/.]+$/, '') + '.pdf'}
                                    className="w-full flex items-center justify-center py-4 px-6 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors shadow-md hover:shadow-lg"
                                >
                                    <FaDownload className="mr-3" />
                                    Download PDF
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                <h2 className="font-semibold text-blue-800 dark:text-blue-300 mb-4">
                    How to Convert PowerPoint to PDF
                </h2>
                <ol className="list-decimal list-inside space-y-2 text-blue-700 dark:text-blue-300">
                    <li>Upload your PowerPoint file (.ppt or .pptx) by dragging and dropping it into the upload area or by browsing your files.</li>
                    <li>Click the "Convert to PDF" button.</li>
                    <li>Once the conversion is complete (this may take a few moments), a download link will appear. Click it to download your PDF file.</li>
                </ol>
            </div>
        </div>
    );
};

export default PowerpointToPdf;

