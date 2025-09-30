import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layout Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Page Components
import Home from "./components/Home";
import ChatWithPDF from "./components/ChatWithPDF";

// PDF Tools
import MergePDF from "./components/MergePDF";
import SplitPDF from "./components/SplitPDF";
import CompressPDF from "./components/CompressPDF";
import OptimizePDF from "./components/OptimizePDF";
// import OCRTool from "./components/OCRTool";
// import ImageToPDF from "./components/ImageToPDF";
import PDFToJPG from "./components/PDFToJPG";
import JPGToPDF from "./components/JPGToPDF";
// import OfficeToPDF from "./components/OfficeToPDF";
// import PDFToOffice from "./components/PDFToOffice";
import RemovePages from "./components/RemovePages";
import ExtractPages from "./components/ExtractPages";
import Rotate from "./components/Rotate";
import Watermark from "./components/Watermark";
import LockUnlockPDF from "./components/LockUnlockPDF";
import SignPDF from "./components/SignPDF";
import RedactPDF from "./components/RedactPDF";
import CropPDF from "./components/CropPDF";
import ComparePDF from "./components/ComparePDF";
import RepairPDF from "./components/RepairPDF";
import WordToPdf from "./components/WordToPdf";
import PdfToWord from "./components/PdfToWord";
import PowerpointToPdf from "./components/PowerpointToPdf";
import PdfToPowerpoint from "./components/PdfToPowerpoint";
import PdfSecurity from "./components/PdfSecurity";
import PageNumbers from "./components/PageNumbers";

// New Components for the missing routes
import ExcelToPDF from "./components/ExcelToPDF";
import PDFToExcel from "./components/PDFToExcel";
import HTMLToPDF from "./components/HTMLToPDF";
import EditPDF from "./components/EditPDF";
import OCRPDF from "./components/OCRPDF";
import OrganizePDF from "./components/OrganizePDF";


function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 max-w-screen">
        <Navbar />

        <Routes>
          {/* Main Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<ChatWithPDF />} />

          {/* PDF Tools */}
          <Route path="/merge" element={<MergePDF />} />
          <Route path="/split" element={<SplitPDF />} />
          <Route path="/compress" element={<CompressPDF />} />
          <Route path="/optimize" element={<OptimizePDF />} />
          {/* <Route path="/ocr" element={<OCRTool />} /> */}
          {/* <Route path="/image-to-pdf" element={<ImageToPDF />} /> */}
          <Route path="/pdf-to-jpg" element={<PDFToJPG />} />
          <Route path="/jpg-to-pdf" element={<JPGToPDF />} />
          {/* <Route path="/office-to-pdf" element={<OfficeToPDF />} /> */}
          {/* <Route path="/pdf-to-office" element={<PDFToOffice />} /> */}
          <Route path="/remove-pages" element={<RemovePages />} />
          <Route path="/extract-pages" element={<ExtractPages />} />
          <Route path="/rotate" element={<Rotate />} />
          <Route path="/watermark" element={<Watermark />} />
          <Route path="/lock-unlock" element={<LockUnlockPDF />} />
          <Route path="/sign" element={<SignPDF />} />
          <Route path="/redact" element={<RedactPDF />} />
          <Route path="/crop" element={<CropPDF />} />
          <Route path="/compare" element={<ComparePDF />} />
          <Route path="/repair" element={<RepairPDF />} />
          <Route path="/word-to-pdf" element={<WordToPdf />} />
          <Route path="/pdf-to-word" element={<PdfToWord />} />
          <Route path="/powerpoint-to-pdf" element={<PowerpointToPdf />} />
          <Route path="/pdf-to-powerpoint" element={<PdfToPowerpoint />} />
          <Route path="/pdf-security" element={<PdfSecurity />} />
          <Route path="/page-numbers" element={<PageNumbers />} />

          {/* New Routes for the missing components */}
          <Route path="/excel-to-pdf" element={<ExcelToPDF />} />
          <Route path="/pdf-to-excel" element={<PDFToExcel />} />
          <Route path="/html-to-pdf" element={<HTMLToPDF />} />
          <Route path="/edit-pdf" element={<EditPDF />} />
          <Route path="/ocr-pdf" element={<OCRPDF />} />
          <Route path="/compare-pdf" element={<ComparePDF />} />
          <Route path="/organize-pdf" element={<OrganizePDF />} />

          {/* 404 Fallback */}
          <Route
            path="*"
            element={<div className="p-8 text-center text-xl">404 - Page Not Found</div>}
          />
        </Routes>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;