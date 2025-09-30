import React from "react";

interface PDFViewerProps {
  fileUrl: string | null;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl }) => {
  if (!fileUrl) {
    return <p className="text-gray-500">No PDF file selected or generated yet.</p>;
  }

  return (
    <div className="w-full h-[80vh] border mt-4">
      <iframe
        src={fileUrl}
        title="PDF Viewer"
        width="100%"
        height="100%"
        frameBorder="0"
      />
    </div>
  );
};

export default PDFViewer;