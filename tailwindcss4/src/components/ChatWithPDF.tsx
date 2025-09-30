import { useState, useRef, useEffect } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import {
  FaFilePdf,
  FaPaperPlane,
  FaSpinner,
  FaUpload,
  FaTimes,
  FaPlus,
  FaExchangeAlt,
  FaCompressAlt,
  FaEdit,
  FaSearch,
  FaMagic,
} from "react-icons/fa";
import {
  MdMerge,
  MdOutlineWaterDrop,
} from "react-icons/md";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useNavigate } from "react-router-dom";

interface Message {
  sender: "user" | "bot";
  text: string;
  documentText?: string;
}

interface Tool {
  path: string;
  label: string;
  icon: React.ReactElement;
  desc: string;
}

interface Features {
  [key: string]: Tool[];
}

export default function ChatWithPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text:
        "👋 **I'm AI PDF  Agent, your ultimate PDF assistant!**\n\nConvert, edit, merge, compress, organize PDFs, and so much more - all in one simple AI chat. No more switching tools!\n\nClick below or type in your prompt to start.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isUploaded, setIsUploaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [showToolsModal, setShowToolsModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Feature categories data
  const features: Features = {
    "Convert from PDF": [
      {
        path: "/pdf-to-word",
        label: "PDF to Word",
        icon: <FaExchangeAlt className="text-blue-500 text-xl" />,
        desc: "Convert PDF to editable Word",
      },
      {
        path: "/pdf-to-excel",
        label: "PDF to Excel",
        icon: <FaExchangeAlt className="text-green-500 text-xl" />,
        desc: "Convert PDF tables to Excel",
      },
      {
        path: "/pdf-to-powerpoint",
        label: "PDF to PPT",
        icon: <FaExchangeAlt className="text-orange-500 text-xl" />,
        desc: "Convert PDF to PowerPoint",
      },
      {
        path: "/pdf-to-jpg",
        label: "PDF to JPG",
        icon: <FaExchangeAlt className="text-yellow-500 text-xl" />,
        desc: "Extract images from PDF",
      },
    ],
    "Convert to PDF": [
      {
        path: "/word-to-pdf",
        label: "Word to PDF",
        icon: <FaFilePdf className="text-blue-500 text-xl" />,
        desc: "Convert Word documents to PDF",
      },
      {
        path: "/excel-to-pdf",
        label: "Excel to PDF",
        icon: <FaFilePdf className="text-green-500 text-xl" />,
        desc: "Convert Excel spreadsheets to PDF",
      },
      {
        path: "/ppt-to-pdf",
        label: "PPT to PDF",
        icon: <FaFilePdf className="text-orange-500 text-xl" />,
        desc: "Convert PowerPoint to PDF",
      },
      {
        path: "/image-to-pdf",
        label: "JPG to PDF",
        icon: <FaFilePdf className="text-yellow-500 text-xl" />,
        desc: "Convert images to PDF",
      },
    ],
    "Edit & Tools": [
      {
        path: "/merge",
        label: "Merge PDF",
        icon: <MdMerge className="text-purple-500 text-xl" />,
        desc: "Combine multiple PDFs into one",
      },
      {
        path: "/compress",
        label: "Compress PDF",
        icon: <FaCompressAlt className="text-red-500 text-xl" />,
        desc: "Reduce PDF file size",
      },
      {
        path: "/edit-pdf",
        label: "Edit PDF",
        icon: <FaEdit className="text-pink-500 text-xl" />,
        desc: "Edit PDF content directly",
      },
      {
        path: "/ocr-pdf",
        label: "OCR PDF",
        icon: <FaSearch className="text-teal-500 text-xl" />,
        desc: "Recognize text in scanned PDFs",
      },
    ],
  };

  // Main tools to display (as per the screenshot)
  const mainTools: Tool[] = [
    {
      path: "/pdf-to-word",
      label: "Convert from PDF",
      icon: <FaExchangeAlt className="text-blue-500 text-xl" />,
      desc: "Convert from PDF",
    },
    {
      path: "/word-to-pdf",
      label: "Convert to PDF",
      icon: <FaFilePdf className="text-green-500 text-xl" />,
      desc: "Convert to PDF",
    },
    {
      path: "/watermark",
      label: "PDF Watermark Remover",
      icon: <MdOutlineWaterDrop className="text-red-500 text-xl" />,
      desc: "Remove Watermark",
    },
    {
      path: "/compress",
      label: "Compress PDF",
      icon: <FaCompressAlt className="text-orange-500 text-xl" />,
      desc: "Reduce file Size",
    },
  ];

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle PDF Upload
  const handleUpload = async () => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "❌ File size exceeds 10MB. Please upload a smaller PDF.",
        },
      ]);
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/upload-pdf`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setIsUploaded(true);
      setFileName(file.name);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `✅ PDF "${file.name}" uploaded successfully. Ask me anything about it!`,
          documentText: uploadResponse.data.text,
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "❌ Failed to upload and process the PDF. Try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Send Message
  const handleSend = async () => {
    const now = Date.now();
    if (now - lastRequestTime < 1000) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⏳ Please wait a moment before sending another question.",
        },
      ]);
      return;
    }
    setLastRequestTime(now);

    if (!input.trim()) return;

    const userMsg: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    setInput("");
    setIsLoading(true);

    try {
      // Look for document text from last PDF upload
      const documentText = messages.find(
        (m) => m.sender === "bot" && m.documentText
      )?.documentText;

      let res;
      if (documentText) {
        // If PDF is uploaded → use /chat-pdf
        res = await axios.post(`${import.meta.env.VITE_API_URL}/chat-pdf`, {
          text: documentText,
          question: input,
          model: "gemini-flash",
        });
      } else {
        // Else general chat → /chat
        res = await axios.post(`${import.meta.env.VITE_API_URL}/chat`, {
          message: input,
          model: "gemini-flash",
        });
      }

      console.log("Backend says:", res.data);

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: res.data.response },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "❌ Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleToolClick = (tool: Tool) => {
    navigate(tool.path);
    setShowToolsModal(false);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
      setIsUploaded(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-lg p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg mr-3">
              <FaFilePdf className="text-white text-xl" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-800 dark:text-white">
                 PDF.AI Agent
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your ultimate PDF assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {file && (
              <div className="hidden md:flex items-center bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                <span className="text-sm text-blue-600 dark:text-blue-300 truncate max-w-xs">
                  {fileName}
                </span>
                <button
                  onClick={() => {
                    setFile(null);
                    setFileName("");
                    setIsUploaded(false);
                  }}
                  className="ml-2 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                >
                  <FaTimes />
                </button>
              </div>
            )}

            <div className="relative">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
              >
                <FaUpload />
                <span className="hidden sm:inline">
                  {file ? "Change PDF" : "Upload PDF"}
                </span>
              </label>
            </div>

            {file && !isUploaded && (
              <button
                onClick={handleUpload}
                disabled={isLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all shadow-md ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                }`}
              >
                {isLoading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaMagic />
                )}
                <span className="hidden sm:inline">Process</span>
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 lg:mx-40">
          {/* Tools Section - only once, after intro bot message */}
          {messages.length > 0 && messages[0].sender === "bot" && (
            <div className="flex justify-center">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 max-w-3xl w-full">
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                  I'm{" "}
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    PDF.AI Agent
                  </span>
                  , your ultimate PDF assistant! 🚀
                  <br />
                  Convert, edit, merge, compress, organize PDFs, and so much
                  more — all in one simple AI chat.
                  <br />
                  No more switching tools!
                  <br />
                  <br />
                  Click below or type in your prompt to start:
                </p>

                {/* Tools Buttons */}
                <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                  {mainTools.map((tool, index) => (
                    <button
                      key={index}
                      onClick={() => handleToolClick(tool)}
                      className="bg-blue-50 hover:bg-blue-100 dark:bg-gray-700 dark:hover:bg-gray-600 
                         text-blue-700 dark:text-blue-300 font-medium rounded-full 
                         px-2 py-1 sm:px-3 sm:py-1.5 text-xs flex items-center gap-1 sm:gap-2 transition-colors"
                    >
                      <span className="text-base">{tool.icon}</span>
                      <span>{tool.label}</span>
                    </button>
                  ))}

                  {/* More Tools */}
                  <button
                    onClick={() => setShowToolsModal(true)}
                    className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 
                       text-gray-700 dark:text-gray-300 font-medium rounded-full 
                       px-2 py-1 sm:px-3 sm:py-1.5 text-xs flex items-center gap-1 sm:gap-2 transition-colors"
                  >
                    <FaPlus className="text-xs" />
                    <span>More Tools</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loop through messages (excluding the first intro message) */}
          {messages.slice(1).map((msg, idx) => (
            <div
              key={idx + 1}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              } mt-4`}
            >
              <div
                className={`max-w-2xl px-3 py-2 rounded-xl shadow-md text-sm md:text-base ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700"
                }`}
              >
                {msg.sender === "bot" ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({
                        node,
                        inline,
                        className,
                        children,
                        ...props
                      }: any) {
                        const match = (className || "").match(
                          /language-(?<lang>.*)/
                        );
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={dark}
                            language={match.groups.lang}
                            PreTag="div"
                            children={String(children).replace(/\n$/, "")}
                            {...props}
                          />
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                ) : (
                  <p>{msg.text}</p>
                )}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto flex gap-3 items-center flex-col sm:flex-row">
            {/* PDF Upload Icon on Left */}
            <div className="relative order-1 sm:order-none">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
                id="file-input-left"
              />
              <label
                htmlFor="file-input-left"
                className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
                title="Upload PDF"
              >
                <FaUpload />
              </label>
            </div>

            <div className="flex-1 relative order-2 sm:order-none w-full">
              <input
                type="text"
                placeholder="Ask me anything about PDFs or type /help for options..."
                value={input}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setInput(e.target.value)
                }
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full ${
                  !input.trim() || isLoading
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-500 hover:text-blue-600 bg-blue-50 hover:bg-blue-100"
                }`}
              >
                {isLoading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaPaperPlane />
                )}
              </button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto mt-3 flex flex-wrap gap-2 justify-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Try:
            </span>
            {[
              "Ask questions about my PDF",
              "Analyze PDF content",
              "Summarize PDF content",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInput(suggestion)}
                className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tools Modal */}
      {showToolsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl text-gray-800 dark:text-white">
                All PDF Tools
              </h3>
              <button
                onClick={() => setShowToolsModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(features).map(([category, tools]) => (
                <div key={category} className="space-y-3">
                  <h4 className="font-semibold text-gray-800 dark:text-white border-b pb-2">
                    {category}
                  </h4>
                  <div className="space-y-2">
                    {tools.map((tool, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          handleToolClick(tool);
                          setShowToolsModal(false);
                        }}
                        className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                      >
                        <span className="text-gray-500 dark:text-gray-400">
                          {tool.icon}
                        </span>
                        <div className="flex-1">
                          <div className="font-medium text-gray-800 dark:text-white">
                            {tool.label}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {tool.desc}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}