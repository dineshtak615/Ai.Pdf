import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaFilePdf,
  FaExchangeAlt,
  FaCompressAlt,
  FaFileWord,
  FaFilePowerpoint,
  FaFileImage,
  FaFileAlt,
  FaEdit,
  FaLock,
  FaSignature,
  FaSearch,
  FaArrowsAlt,
} from "react-icons/fa";
import {
  MdMerge,
  MdOutlineWaterDrop,
  MdCrop,
  MdOutlineNumbers,
} from "react-icons/md";

interface Feature {
  path: string;
  label: string;
  icon: React.ReactElement;
  desc: string;
}

interface FeaturesCollection {
  [key: string]: Feature[];
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Feature categories data
  const features: FeaturesCollection = {
    "Popular Tools": [
      {
        path: "/merge",
        label: "Merge PDF",
        icon: <MdMerge className="text-blue-500" />,
        desc: "Combine multiple PDFs into one",
      },
      {
        path: "/split",
        label: "Split PDF",
        icon: <FaCompressAlt className="text-green-500" />,
        desc: "Divide PDF into multiple files",
      },
      {
        path: "/compress",
        label: "Compress PDF",
        icon: <FaCompressAlt className="text-orange-500" />,
        desc: "Reduce PDF file size",
      },
      {
        path: "/word-to-pdf",
        label: "Word to PDF",
        icon: <FaFileWord className="text-blue-600" />,
        desc: "Convert Word documents to PDF",
      },
      {
        path: "/pdf-to-word",
        label: "PDF to Word",
        icon: <FaExchangeAlt className="text-purple-500" />,
        desc: "Convert PDF to editable Word",
      },
    ],
    Converters: [
      {
        path: "/excel-to-pdf",
        label: "Excel to PDF",
        icon: <FaFilePdf className="text-green-600" />,
        desc: "Convert Excel spreadsheets to PDF",
      },
      {
        path: "/pdf-to-excel",
        label: "PDF to Excel",
        icon: <FaExchangeAlt className="text-blue-600" />,
        desc: "Convert PDF tables to Excel",
      },
      {
        path: "/html-to-pdf",
        label: "HTML to PDF",
        icon: <FaFileAlt className="text-red-600" />,
        desc: "Convert HTML pages to PDF",
      },
      {
        path: "/pdf-to-powerpoint",
        label: "PDF to PPT",
        icon: <FaFilePowerpoint className="text-orange-600" />,
        desc: "Convert PDF to PowerPoint",
      },
      {
        path: "/powerpoint-to-pdf",
        label: "PPT to PDF",
        icon: <FaExchangeAlt className="text-red-600" />,
        desc: "Convert PowerPoint to PDF",
      },
      {
        path: "/jpg-to-pdf",
        label: "JPG to PDF",
        icon: <FaFileImage className="text-green-600" />,
        desc: "Convert images to PDF",
      },
      {
        path: "/pdf-to-jpg",
        label: "PDF to JPG",
        icon: <FaExchangeAlt className="text-yellow-600" />,
        desc: "Extract images from PDF",
      },
      {
        path: "/compare",
        label: "Compare Pdf",
        icon: <FaExchangeAlt className="text-yellow-600" />,
        desc: "Compare two pdf's ",
      },
    ],
    "Editing Tools": [
      {
        path: "/edit-pdf",
        label: "Edit PDF",
        icon: <FaEdit className="text-purple-400" />,
        desc: "Edit PDF content directly",
      },
      {
        path: "/ocr-pdf",
        label: "OCR PDF",
        icon: <FaSearch className="text-yellow-400" />,
        desc: "Recognize text in scanned PDFs",
      },
      {
        path: "/compare-pdf",
        label: "Compare PDF",
        icon: <FaArrowsAlt className="text-orange-400" />,
        desc: "Compare two PDF files for differences",
      },
      {
        path: "/organize-pdf",
        label: "Organize PDF",
        icon: <MdOutlineNumbers className="text-blue-400" />,
        desc: "Rearrange, delete, or add pages to PDF",
      },
      {
        path: "/remove-pages",
        label: "Remove Pages",
        icon: <FaEdit className="text-red-400" />,
        desc: "Delete pages from PDF",
      },
      {
        path: "/extract-pages",
        label: "Extract Pages",
        icon: <FaSearch className="text-blue-400" />,
        desc: "Extract specific pages",
      },
      {
        path: "/rotate",
        label: "Rotate PDF",
        icon: <FaArrowsAlt className="text-green-400" />,
        desc: "Rotate PDF pages",
      },
      {
        path: "/watermark",
        label: "Watermark",
        icon: <MdOutlineWaterDrop className="text-purple-400" />,
        desc: "Add watermark to PDF",
      },
      {
        path: "/page-numbers",
        label: "Page Numbers",
        icon: <MdOutlineNumbers className="text-orange-400" />,
        desc: "Add page numbers",
      },
      {
        path: "/crop",
        label: "Crop PDF",
        icon: <MdCrop className="text-teal-400" />,
        desc: "Crop PDF pages",
      },
    ],
    "Security Tools": [
      {
        path: "/lock-unlock",
        label: "Lock/Unlock",
        icon: <FaLock className="text-gray-600" />,
        desc: "Password protect PDF",
      },
      {
        path: "/sign",
        label: "Sign PDF",
        icon: <FaSignature className="text-blue-500" />,
        desc: "Add digital signatures",
      },
      {
        path: "/redact",
        label: "Redact",
        icon: <FaEdit className="text-red-500" />,
        desc: "Permanently remove content",
      },
      {
        path: "/optimize",
        label: "Optimize",
        icon: <FaCompressAlt className="text-green-500" />,
        desc: "Optimize PDF quality",
      },
    ],
  };

  // Flatten all features for search
  const allFeatures: Feature[] = Object.values(features).flat();

  // Filter features based on search
  const filteredFeatures: Feature[] = searchQuery
    ? allFeatures.filter(
        (feature) =>
          feature.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          feature.desc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activeTab === "all"
    ? allFeatures
    : features[activeTab];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section
        className="py-20 px-4 text-center text-white relative bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: "url('https://i.pinimg.com/1200x/18/11/8e/18118ef0cc8d2bdabd3cab6619a900bf.jpg')" 
        }}
      >
        {/* Overlay for better readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-indigo-900/80"></div>

        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Your Ultimate PDF Solution
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Convert, edit, compress, and secure PDFs with our powerful AI tools
          </p>

          <div className="relative max-w-xl mx-auto mb-8">
            <input
              type="text"
              placeholder="Search for tools (merge, convert, compress...)"
              className="w-full py-4 px-6 rounded-full shadow-lg
                         bg-white bg-opacity-90 text-gray-900 placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <button className="absolute right-2 top-2 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
            <Link
              to="/upload"
              className="px-8 py-3 bg-white text-blue-700 rounded-full font-semibold shadow-lg 
                         hover:bg-gray-100 hover:scale-105 transition transform"
            >
              Get Started Free
            </Link>

            <Link
              to="/chat"
              className="px-8 py-3 border-2 border-white text-white rounded-full font-semibold
                         hover:bg-white hover:text-blue-700 hover:scale-105 transition transform"
            >
              Chat with PDF AI
            </Link>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              activeTab === "all"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
            }`}
          >
            All Tools
          </button>
          {Object.keys(features).map((category) => (
            <button
              key={category}
              onClick={() => setActiveTab(category)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                activeTab === category
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              <Link to={feature.path} className="block h-full">
                <div className="p-6">
                  <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-gray-700 mb-4 text-2xl group-hover:bg-blue-100 dark:group-hover:bg-gray-600 transition">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                    {feature.label}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.desc}
                  </p>
                </div>
                <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    Try Now
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    ></path>
                  </svg>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {filteredFeatures.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-5xl mb-4">
              🔍
            </div>
            <h3 className="text-xl font-medium text-gray-600 dark:text-gray-300">
              No tools found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try a different search term
            </p>
          </div>
        )}
      </div>

      {/* CTA Section */}
     
    </div>
  );
}