import { Link } from "react-router-dom";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">
              Aadhav<span className="font-light text-indigo-400">Trend</span>
            </h3>
            <p className="text-sm leading-relaxed">
              Your one-stop destination for premium quality fabrics, garments,
              and textile accessories. From raw materials to finished products.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products" className="hover:text-indigo-400 transition">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/products?fabricType=Cotton" className="hover:text-indigo-400 transition">
                  Cotton Fabrics
                </Link>
              </li>
              <li>
                <Link to="/products?fabricType=Silk" className="hover:text-indigo-400 transition">
                  Silk Collection
                </Link>
              </li>
              <li>
                <Link to="/products?fabricType=Linen" className="hover:text-indigo-400 transition">
                  Linen Range
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/orders" className="hover:text-indigo-400 transition">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-indigo-400 transition">
                  My Account
                </Link>
              </li>
              <li>
                <span className="hover:text-indigo-400 transition cursor-pointer">
                  Return Policy
                </span>
              </li>
              <li>
                <span className="hover:text-indigo-400 transition cursor-pointer">
                  FAQs
                </span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <FiMapPin className="text-indigo-400 flex-shrink-0" />
                <span>123 Textile Market, Mumbai, India</span>
              </li>
              <li className="flex items-center space-x-2">
                <FiPhone className="text-indigo-400 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-2">
                <FiMail className="text-indigo-400 flex-shrink-0" />
                <span>support@textilestore.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} AadhavTrend. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
