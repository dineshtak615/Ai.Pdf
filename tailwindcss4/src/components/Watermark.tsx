import { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { 
  FaSpinner, 
  FaDownload, 
  FaCloudUploadAlt, 
  FaUpload 
} from 'react-icons/fa';

interface FileState {
  name: string;
  size: number;
  type: string;
  file: File; // Store the actual file object
}

interface StatusState {
  loading: boolean;
  error: string | null;
}

const Watermark = () => {
  const [pdfFile, setPdfFile] = useState<FileState | null>(null);
  const [watermarkFile, setWatermarkFile] = useState<FileState | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusState>({ loading: false, error: null });
  const pdfFileInputRef = useRef<HTMLInputElement>(null);
  const watermarkFileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (fileType: 'pdf' | 'watermark', selectedFile: File | null) => {
    if (!selectedFile) {
      setStatus({ loading: false, error: `Please select a ${fileType === 'pdf' ? 'PDF' : 'watermark'} file.` });
      if (fileType === 'pdf') setPdfFile(null);
      else setWatermarkFile(null);
      return;
    }

    const isPdf = selectedFile.type === 'application/pdf';
    const isImage = selectedFile.type.startsWith('image/');

    if (fileType === 'pdf' && !isPdf) {
      setStatus({ loading: false, error: "Please select a valid PDF file." });
      setPdfFile(null);
      return;
    }

    const isWaterMarkAllowed = isPdf || isImage;

    if (fileType === 'watermark' && !isWaterMarkAllowed) {
      setStatus({ loading: false, error: "Please select a valid image or PDF for the watermark." });
      setWatermarkFile(null);
      return;
    }

    const fileData = {
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type,
      file: selectedFile
    };

    if (fileType === 'pdf') setPdfFile(fileData);
    else setWatermarkFile(fileData);

    setStatus({ loading: false, error: null });
    setProcessedUrl(null);
  };

  // PDF Dropzone
  const { getRootProps: getPdfRootProps, getInputProps: getPdfInputProps, isDragActive: isPdfDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 52428800, // 50MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) validateAndSetFile('pdf', acceptedFiles[0]);
    },
    onDropRejected: () => {
      setStatus({ loading: false, error: "Please select a valid PDF file." });
      setPdfFile(null);
    }
  });

  // Watermark Dropzone
  const { getRootProps: getWatermarkRootProps, getInputProps: getWatermarkInputProps, isDragActive: isWatermarkDragActive } = useDropzone({
    accept: { 
      'application/pdf': ['.pdf'],
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    maxFiles: 1,
    maxSize: 52428800, // 50MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) validateAndSetFile('watermark', acceptedFiles[0]);
    },
    onDropRejected: () => {
      setStatus({ loading: false, error: "Please select a valid image or PDF for the watermark." });
      setWatermarkFile(null);
    }
  });

  const handleAddWatermark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile || !watermarkFile) {
      setStatus({ loading: false, error: "Please select both PDF and watermark files" });
      return;
    }

    const formData = new FormData();
    formData.append("file", pdfFile.file);
    formData.append("watermark", watermarkFile.file);

    try {
      setStatus({ loading: true, error: null });
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/watermark`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          responseType: "blob",
        }
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setProcessedUrl(url);
      setStatus({ loading: false, error: null });
    } catch (error) {
      console.error("Error adding watermark:", error);
      setStatus({ loading: false, error: "Failed to add watermark. Please try again." });
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        Add Watermark to PDF
      </h1>

      <form onSubmit={handleAddWatermark} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PDF Upload Section */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Select PDF File
            </label>
            <div {...getPdfRootProps()} className={`relative p-10 border-2 border-dashed rounded-xl text-center cursor-pointer ${
              isPdfDragActive ? 'border-blue-500 bg-blue-50' :
              pdfFile ? 'border-green-500' :
              'border-gray-300 hover:border-blue-400'
            }`}>
              <input {...getPdfInputProps()} ref={pdfFileInputRef} className="hidden" />
              <FaCloudUploadAlt className="text-4xl text-red-500 mx-auto mb-2" />
              <p>{isPdfDragActive ? "Drop PDF here" : "Drag & Drop PDF or Browse"}</p>
              <button
                type="button"
                onClick={() => pdfFileInputRef.current?.click()}
                className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center mx-auto"
              >
                <FaUpload className="mr-2" /> Upload PDF
              </button>
            </div>
            {pdfFile && <p className="mt-2 text-green-600">{pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)</p>}
          </div>

          {/* Watermark Upload Section */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Watermark (PDF/Image)
            </label>
            <div {...getWatermarkRootProps()} className={`relative p-10 border-2 border-dashed rounded-xl text-center cursor-pointer ${
              isWatermarkDragActive ? 'border-blue-500 bg-blue-50' :
              watermarkFile ? 'border-green-500' :
              'border-gray-300 hover:border-blue-400'
            }`}>
              <input {...getWatermarkInputProps()} ref={watermarkFileInputRef} className="hidden" />
              <FaCloudUploadAlt className="text-4xl text-green-500 mx-auto mb-2" />
              <p>{isWatermarkDragActive ? "Drop file here" : "Drag & Drop or Browse"}</p>
              <button
                type="button"
                onClick={() => watermarkFileInputRef.current?.click()}
                className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center mx-auto"
              >
                <FaUpload className="mr-2" /> Upload Watermark
              </button>
            </div>
            {watermarkFile && <p className="mt-2 text-green-600">{watermarkFile.name} ({(watermarkFile.size / 1024 / 1024).toFixed(2)} MB)</p>}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={status.loading || !pdfFile || !watermarkFile}
          className={`w-full py-3 rounded-lg text-white font-semibold ${
            status.loading || !pdfFile || !watermarkFile
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {status.loading ? <FaSpinner className="animate-spin mx-auto" /> : "Add Watermark"}
        </button>
      </form>

      {/* Error Message */}
      {status.error && <p className="mt-4 text-red-500">{status.error}</p>}

      {/* Download Link */}
      {processedUrl && (
        <div className="mt-6 text-center">
          <a
            href={processedUrl}
            download="watermarked.pdf"
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
            <FaDownload className="mr-2" /> Download Watermarked PDF
          </a>
        </div>
      )}
    </div>
  );
};

export default Watermark;