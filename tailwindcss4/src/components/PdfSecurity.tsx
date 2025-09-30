import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFilePdf, FaLock, FaUnlock, FaSpinner } from 'react-icons/fa';

interface FileWithPreview extends File {
  preview: string;
}

const PdfSecurity = () => {
  const [file, setFile] = useState<FileWithPreview | null>(null);
  const [password, setPassword] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [action, setAction] = useState<'lock' | 'unlock'>('lock');
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError('');
    if (acceptedFiles.length > 0) {
      const fileWithPreview = Object.assign(acceptedFiles[0], {
        preview: URL.createObjectURL(acceptedFiles[0])
      }) as FileWithPreview;
      setFile(fileWithPreview);
    }
  }, []);

  const onDropRejected = useCallback(() => {
    setError('Please upload only PDF files');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    onDrop,
    onDropRejected
  });

  const handleSecurityAction = async () => {
    if (!file) {
      setError('Please select a PDF file first');
      return;
    }

    if (action === 'lock' && !password) {
      setError('Please enter a password');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real app, this would call your backend API
      const resultContent = `Processed PDF (${action === 'lock' ? 'locked' : 'unlocked'})`;
      const blob = new Blob([resultContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      setError(`${action === 'lock' ? 'Locking' : 'Unlocking'} failed. Please try again.`);
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">PDF Security</h1>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setAction('lock')}
          className={`px-4 py-2 rounded-lg font-medium ${
            action === 'lock'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
          }`}
        >
          <FaLock className="inline mr-2" />
          Lock PDF
        </button>
        <button
          onClick={() => setAction('unlock')}
          className={`px-4 py-2 rounded-lg font-medium ${
            action === 'unlock'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
          }`}
        >
          <FaUnlock className="inline mr-2" />
          Unlock PDF
        </button>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-3">
          <FaFilePdf className="text-red-500 text-4xl" />
          <p className="text-gray-700 dark:text-gray-300">
            {isDragActive ? (
              'Drop your PDF file here'
            ) : (
              <>
                Drag & drop a PDF file here, or <span className="text-blue-500 font-medium">click to browse</span>
              </>
            )}
          </p>
        </div>
      </div>

      {file && (
        <div className="mt-4 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaFilePdf className="text-red-500 text-2xl" />
              <span className="font-medium text-gray-800 dark:text-gray-200">{file.name}</span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {(file.size / 1024).toFixed(2)} KB
            </span>
          </div>
        </div>
      )}

      {action === 'lock' && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Set Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter password"
          />
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
          {error}
        </div>
      )}

      <button
        onClick={handleSecurityAction}
        disabled={isProcessing || !file}
        className={`mt-6 w-full py-3 px-4 rounded-lg font-medium ${
          isProcessing || !file
            ? 'bg-blue-400 dark:bg-blue-600 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
        } text-white transition-colors`}
      >
        {isProcessing ? (
          <>
            <FaSpinner className="animate-spin inline mr-2" />
            Processing...
          </>
        ) : (
          <>
            {action === 'lock' ? (
              <>
                <FaLock className="inline mr-2" />
                Lock PDF
              </>
            ) : (
              <>
                <FaUnlock className="inline mr-2" />
                Unlock PDF
              </>
            )}
          </>
        )}
      </button>

      {downloadUrl && file && (
        <a
          href={downloadUrl}
          download={`${file.name.replace(/\.[^/.]+$/, '')}_${action === 'lock' ? 'locked' : 'unlocked'}.pdf`}
          className="mt-4 w-full block py-3 px-4 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white rounded-lg font-medium text-center transition-colors"
        >
          Download {action === 'lock' ? 'Locked' : 'Unlocked'} PDF
        </a>
      )}
    </div>
  );
};

export default PdfSecurity;






























































































































































































































































































