import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <>
      {/* CTA Section */}
      <section className="mt-10 py-10 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center">
        <div className="max-w-4xl mx-auto my-5">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to transform your PDF workflow?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of professionals using our tools daily
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/upload"
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100 transition shadow-lg hover:shadow-xl"
            >
              Get Started Free
            </Link>
            <Link
              to="/chat"
              className="px-8 py-3 border-2 border-white text-white rounded-lg font-bold hover:bg-white hover:bg-opacity-10 transition"
            >
              Chat with PDF AI
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-lg font-bold mb-4">PDF Tools</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-white transition">Home</Link></li>
              <li><Link to="/upload" className="hover:text-white transition">All Tools</Link></li>
              <li><Link to="/chat" className="hover:text-white transition">AI Assistant</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Features</h3>
            <ul className="space-y-2">
              <li><Link to="/merge" className="hover:text-white transition">PDF Merge</Link></li>
              <li><Link to="/compress" className="hover:text-white transition">PDF Compress</Link></li>
              <li><Link to="/word-to-pdf" className="hover:text-white transition">Word to PDF</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition">Pricing</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition">Terms of Service</Link></li>
              <li><Link to="/security" className="hover:text-white transition">Security</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-gray-700 text-center">
          <p>© {new Date().getFullYear()} PDFMagic. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
};

export default Footer;
