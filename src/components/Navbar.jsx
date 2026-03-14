import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { clearCartState } from "../redux/slices/cartSlice";
import {
  FiShoppingCart,
  FiUser,
  FiSearch,
  FiMenu,
  FiX,
  FiLogOut,
  FiPackage,
  FiHeart,
  FiSettings,
} from "react-icons/fi";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { itemCount } = useSelector((state) => state.cart);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?keyword=${searchQuery}`);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCartState());
    setProfileOpen(false);
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-indigo-700">Textile</span>
            <span className="text-2xl font-light text-gray-600">Store</span>
          </Link>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center flex-1 max-w-lg mx-8"
          >
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search fabrics, garments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600"
              >
                <FiSearch size={20} />
              </button>
            </div>
          </form>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/products"
              className="text-gray-600 hover:text-indigo-600 font-medium transition"
            >
              Products
            </Link>

            <Link to="/cart" className="relative text-gray-600 hover:text-indigo-600 transition">
              <FiShoppingCart size={22} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {itemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition"
                >
                  <FiUser size={22} />
                  <span className="font-medium text-sm">
                    {user?.name?.split(" ")[0]}
                  </span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50">
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                    >
                      <FiUser className="mr-2" /> My Profile
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                    >
                      <FiPackage className="mr-2" /> My Orders
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                    >
                      <FiHeart className="mr-2" /> Wishlist
                    </Link>
                    {user?.role === "admin" && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50"
                      >
                        <FiSettings className="mr-2" /> Admin Panel
                      </Link>
                    )}
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <FiLogOut className="mr-2" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-gray-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t">
            <form onSubmit={handleSearch} className="mt-3 mb-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2">
                  <FiSearch size={20} />
                </button>
              </div>
            </form>
            <Link
              to="/products"
              className="block py-2 text-gray-600 hover:text-indigo-600"
              onClick={() => setMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              to="/cart"
              className="block py-2 text-gray-600 hover:text-indigo-600"
              onClick={() => setMenuOpen(false)}
            >
              Cart ({itemCount})
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="block py-2 text-gray-600" onClick={() => setMenuOpen(false)}>
                  Profile
                </Link>
                <Link to="/orders" className="block py-2 text-gray-600" onClick={() => setMenuOpen(false)}>
                  Orders
                </Link>
                <Link to="/wishlist" className="block py-2 text-gray-600" onClick={() => setMenuOpen(false)}>
                  Wishlist
                </Link>
                {user?.role === "admin" && (
                  <Link
                    to="/admin/dashboard"
                    className="block py-2 text-indigo-600 font-medium"
                    onClick={() => setMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                <button onClick={handleLogout} className="block py-2 text-red-600">
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block py-2 text-indigo-600 font-medium"
                onClick={() => setMenuOpen(false)}
              >
                Login / Register
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
