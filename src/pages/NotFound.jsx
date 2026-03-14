import { Link } from "react-router-dom";
import { FiHome, FiSearch } from "react-icons/fi";

const NotFound = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
    <p className="text-9xl font-black text-indigo-100">404</p>
    <h1 className="text-3xl font-bold text-gray-800 -mt-4">Page Not Found</h1>
    <p className="text-gray-500 mt-3 max-w-md">
      Oops! The page you're looking for doesn't exist or has been moved.
    </p>
    <div className="flex flex-wrap gap-4 mt-8 justify-center">
      <Link to="/" className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
        <FiHome /> <span>Back to Home</span>
      </Link>
      <Link to="/products" className="flex items-center space-x-2 border px-6 py-3 rounded-lg font-semibold text-gray-600 hover:bg-gray-50 transition">
        <FiSearch /> <span>Browse Products</span>
      </Link>
    </div>
  </div>
);

export default NotFound;
