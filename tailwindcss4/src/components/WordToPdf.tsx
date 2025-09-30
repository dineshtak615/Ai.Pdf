import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFileWord, FaFilePdf, FaSpinner, FaTimes, FaDownload, FaCloudUploadAlt, FaExchangeAlt } from 'react-icons/fa';

interface FileWithPreview extends File {
  preview?: string;
}

const WordToPdf = () => {
  const [file, setFile] = useState<FileWithPreview | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [error, setError] = useState('');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles: FileWithPreview[]) => {
      setError('');
      setDownloadUrl('');
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
      }
    },
    onDropRejected: () => {
      setError('Please upload only Word documents (.doc or .docx)');
    }
  });

  const removeFile = () => {
    setFile(null);
    setDownloadUrl('');
    setError('');
  };

  const convertToPdf = async () => {
    if (!file) {
      setError('Please select a Word document first');
      return;
    }

    setIsConverting(true);
    setError('');
    setDownloadUrl('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/word-to-pdf`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to convert file');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      setError(`Conversion failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error(err);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Word to PDF Converter
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Convert your Word documents to PDF format with just one click. Perfect for sharing, printing, and archiving.
        </p>
      </div>

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
            <FaCloudUploadAlt className={`text-4xl ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              {isDragActive ? 'Drop your Word file here' : 'Upload Word Document'}
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
            Supported formats: .doc, .docx (Max size: 50MB)
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
          <div className="flex items-center text-red-700 dark:text-red-300">
            <div className="flex-shrink-0">
              <FaTimes className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}

      {file && (
        <div className="mt-8">
          <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
              <FaFileWord className="mr-2 text-blue-500" />
              Selected File
            </h3>
            
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FaFileWord className="text-blue-500 text-2xl" />
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

            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <button
                onClick={convertToPdf}
                disabled={isConverting}
                className={`flex-1 flex items-center justify-center py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${
                  isConverting
                    ? 'bg-blue-400 dark:bg-blue-600 cursor-not-allowed'
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
                    <FaExchangeAlt className="mr-3" />
                    Convert to PDF
                  </>
                )}
              </button>

              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download={file.name.replace(/\.[^/.]+$/, '') + '.pdf'}
                  className="flex-1 flex items-center justify-center py-4 px-6 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  <FaDownload className="mr-3" />
                  Download PDF
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Information Section */}
      <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800/30">
        <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-4 flex items-center">
          <FaFilePdf className="mr-2" />
          Why convert Word to PDF?
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">1</span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              PDF files maintain formatting across all devices and platforms
            </p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">2</span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              PDFs are ideal for sharing documents that shouldn't be easily edited
            </p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">3</span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Professional appearance for business documents and reports
            </p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">4</span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Smaller file sizes compared to some Word documents with images
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordToPdf;