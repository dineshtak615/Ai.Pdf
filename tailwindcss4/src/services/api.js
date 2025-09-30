import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000", // Update if Flask backend is hosted elsewhere
});

// 🔁 PDF Operations
export const uploadFile = (formData) =>
  API.post("/upload", formData);

export const mergePDF = (formData) =>
  API.post("/merge", formData, { responseType: "blob" });

export const splitPDF = (formData) =>
  API.post("/split", formData, { responseType: "blob" });

export const compressPDF = (formData) =>
  API.post("/compress", formData, { responseType: "blob" });

export const ocrImage = (formData) =>
  API.post("/ocr", formData);

export const WordToPDF = (formData) =>
  API.post("/word-to-pdf", formData, { responseType: "blob" });

export const PdfToPowerpoint = (formData) =>
  API.post("/pdf-to-pptx", formData, { responseType: "blob" });

// 🖼️ Images → PDF
export const convertImagesToPDF = (formData) =>
  API.post("/image-to-pdf", formData, { responseType: "blob" });

// 💬 Chat with PDF
export const uploadChatPDF = (formData) =>
  API.post("/upload-chat-pdf", formData);

export const askPDF = (query) =>
  API.post("/ask", { query });
