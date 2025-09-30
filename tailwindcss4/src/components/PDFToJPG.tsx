import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { FaFilePdf, FaImage, FaSpinner, FaTimes, FaCloudUploadAlt, FaDownload } from 'react-icons/fa';

interface FileWithPath extends File {
  path?: string;
}

const PdfToImages = () => {
    const [file, setFile] = useState<FileWithPath | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [downloadFilename, setDownloadFilename] = useState("");

    const validateAndSetFile = (selectedFile: FileWithPath) => {
        if (!selectedFile) return;

        if (selectedFile.type !== 'application/pdf') {
            setError("Please select a valid PDF file.");
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

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { "application/pdf": [".pdf"] },
        maxFiles: 1,
        onDrop: (acceptedFiles: FileWithPath[]) => {
            if (acceptedFiles.length > 0) {
                validateAndSetFile(acceptedFiles[0]);
            }
        },
        onDropRejected: () => {
            setError('Please upload only a PDF file.');
        }
    });

    const removeFile = () => {
        setFile(null);
        setError("");
        // Clear download URL when file is removed
        if (downloadUrl) {
            URL.revokeObjectURL(downloadUrl);
            setDownloadUrl(null);
        }
    };

    const handleConvert = async () => {
        if (!file) {
            setError("Please select a PDF file first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);
            setError("");
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/pdf-to-images`,
                formData,
                {
                    responseType: "blob", // backend returns zip file
                }
            );

            // Create a download link for the ZIP
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const filename = `${file.name.replace('.pdf', '')}_images.zip`;
            
            setDownloadUrl(url);
            setDownloadFilename(filename);
        } catch (err) {
            console.error(err);
            setError("Conversion failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                PDF to JPG Converter
            </h1>

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
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className={`p-4 rounded-full ${isDragActive ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                        <FaCloudUploadAlt className={`text-4xl ${isDragActive ? 'text-blue-500' : 'text-red-500'}`} />
                    </div>
                    <div>
                        <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                            {isDragActive ? 'Drop your PDF file here' : 'Upload PDF Document'}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                            {isDragActive ? 'Release to upload your file' : <>Drag & drop or <span className="text-blue-500 font-medium cursor-pointer">browse files</span></>}
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

            {file && (
                <div className="mt-8">
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-3">Selected File</h3>
                        <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                            <div className="flex items-center">
                                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg mr-4">
                                    <FaFilePdf className="text-red-500 text-2xl" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {(file.size / 1024).toFixed(2)} KB
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

                        {!downloadUrl ? (
                            <div className="mt-6">
                                <button
                                    onClick={handleConvert}
                                    disabled={loading || !file}
                                    className={`w-full flex items-center justify-center py-4 px-6 rounded-xl font-medium text-white transition-all duration-300 ${
                                        loading || !file
                                            ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                                    }`}
                                >
                                    {loading ? (
                                        <>
                                            <FaSpinner className="animate-spin mr-3" />
                                            Converting...
                                        </>
                                    ) : (
                                        <>
                                            <FaImage className="mr-3" />
                                            Convert to JPG (ZIP)
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="mt-6">
                                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4 border border-green-200 dark:border-green-800">
                                    <p className="text-green-700 dark:text-green-300 text-center font-medium">
                                        Conversion successful! Your images are ready to download.
                                    </p>
                                </div>
                                <button
                                    onClick={handleDownload}
                                    className="w-full flex items-center justify-center py-4 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    <FaDownload className="mr-3" />
                                    Download Images (ZIP)
                                </button>
                                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    File: {downloadFilename}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PdfToImages;