# PDFAI
🧠 AI.PDF — Smart All-in-One PDF Toolkit

AI.PDF is an AI-powered document platform that combines all major PDF utilities — merge, split, convert, edit, OCR, compress, sign, and more — along with a Chat-with-PDF feature that lets users interact with documents using natural language.

Built with a Flask backend and a React frontend, AI.PDF brings the convenience of LightPDF-like tools to a self-hosted, privacy-focused environment.

🚀 Features
🗂️ PDF Utilities

Merge PDFs — Combine multiple PDFs into one file.

Split PDFs — Extract specific pages or split by range.

Compress PDFs — Reduce file size without losing quality.

Convert Files — Convert between PDF ↔ Word, Excel, PPT, Image, Text, etc.

Edit PDFs — Add/remove text, images, or annotations.

Secure PDFs — Add/remove password protection and watermarks.

Sign PDFs — Add eSignatures manually or via digital signature.

OCR (Text Recognition) — Extract text from scanned PDFs and images.

🤖 AI Features

Chat with PDF — Upload a PDF and ask questions about its contents.

Uses LangChain + FAISS for vector-based semantic search.

Supports local models (Ollama / GPT4All) for offline AI chat.

Smart Summary — Generate concise summaries of documents.

Keyword Extraction & Q&A — Find key info and generate answers instantly.

🧩 Architecture

Frontend: React + Tailwind CSS

Backend: Flask (Python)

AI Stack: LangChain, FAISS, PyMuPDF, PyPDF2, pdf2image

Optional Local Models: Ollama / GPT4All / Llama3

🛠️ Installation & Setup
1. Clone the repository
git clone https://github.com/yourusername/ai.pdf.git
cd ai.pdf

2. Backend Setup (Flask)
cd backend
python -m venv venv
source venv/bin/activate       # or venv\Scripts\activate on Windows
pip install -r requirements.txt


Run the Flask server:

python app.py


Your backend will start at:
👉 http://127.0.0.1:5000/

3. Frontend Setup (React)
cd frontend
npm install
npm start


Your frontend will run at:
👉 http://localhost:3000/

4. Connect Frontend & Backend

In your React .env file, set:

REACT_APP_API_URL=http://127.0.0.1:5000

🧠 Chat with PDF Setup
Option A: Local AI (Recommended)

Install Ollama and run a local model:

ollama pull llama3
ollama run llama3


Set the backend environment:

AI_MODE=local
AI_MODEL=llama3

Option B: OpenAI API

Set your API key in backend .env:

OPENAI_API_KEY=your_key_here
AI_MODE=openai

📦 Requirements

Python packages:

Flask
Flask-CORS
PyMuPDF
PyPDF2
pdf2image
LangChain
FAISS
fpdf
pytesseract
opencv-python


Node packages:

react
axios
react-router-dom
tailwindcss

📁 Project Structure
ai.pdf/
│
├── backend/
│   ├── app.py
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── models/
│
├── tailwincss4/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── assets/
│   │   └── App.js
│   └── public/
│
├── README.md
└── requirements.txt

🧩 API Endpoints (Sample)
Endpoint	Method	Description
/api/pdf/merge	POST	Merge multiple PDFs
/api/pdf/split	POST	Split PDF by pages
/api/pdf/compress	POST	Compress a PDF
/api/pdf/ocr	POST	Extract text using OCR
/api/pdf/chat	POST	Chat with uploaded PDF
/api/pdf/summary	POST	Get AI-based summary
🔒 Privacy & Security

AI.PDF runs locally, meaning:

No data leaves your machine.

You can use local AI models for complete privacy.

Ideal for sensitive documents and enterprise use.

🧰 Future Enhancements

✅ Multi-user accounts and history tracking

✅ Dark/light mode toggle

🔜 PDF translation (multi-language OCR + translation)

🔜 AI document classifier

🔜 Drag-and-drop PDF workspace

👨‍💻 Author

Dinesh Tak
🧩 AI Developer | Full Stack Engineer

