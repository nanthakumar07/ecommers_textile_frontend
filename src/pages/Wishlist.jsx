import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addItemToCart } from "../redux/slices/cartSlice";
import * as api from "../services/api";
import Loader from "../components/Loader";
import { FiHeart, FiShoppingCart, FiTrash2, FiStar } from "react-icons/fi";
import toast from "react-hot-toast";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading]   = useState(true);
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.auth);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.getWishlist();
      setWishlist(data.wishlist);
    } catch { toast.error("Failed to load wishlist"); }
    finally  { setLoading(false); }
  };

  useEffect(() => { if (isAuthenticated) load(); }, [isAuthenticated]);

  const handleRemove = async (productId) => {
    try {
      const { data } = await api.toggleWishlist(productId);
      setWishlist(data.wishlist);
      toast.success("Removed from wishlist");
    } catch { toast.error("Failed"); }
  };

  const handleAddToCart = (product) => {
    dispatch(addItemToCart({ productId: product._id, quantity: 1 }));
    toast.success("Added to cart!");
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center space-x-3 mb-6">
        <FiHeart className="text-red-500" size={24} />
        <h1 className="text-2xl font-bold text-gray-800">My Wishlist</h1>
        <span className="text-sm text-gray-500">({wishlist.length} items)</span>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-20">
          <FiHeart className="mx-auto text-gray-200" size={72} />
          <h2 className="text-xl font-bold text-gray-700 mt-4">Your wishlist is empty</h2>
          <p className="text-gray-500 mt-2">Save products you love here</p>
          <Link to="/products" className="inline-block mt-6 bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {wishlist.map((product) => {
            const discountPercent = product.discountPrice && product.discountPrice < product.price
              ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;
            return (
              <div key={product._id} className="bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition group">
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <Link to={`/product/${product._id}`}>
                    <img src={product.images?.[0]?.url || "https://via.placeholder.com/300"}
                      alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  </Link>
                  {discountPercent > 0 && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                      -{discountPercent}%
                    </span>
                  )}
                  <button onClick={() => handleRemove(product._id)}
                    className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow text-red-500 hover:bg-red-50 transition">
                    <FiTrash2 size={14} />
                  </button>
                </div>
                <div className="p-3">
                  <span className="text-xs text-indigo-600 font-medium">{product.fabricType}</span>
                  <Link to={`/product/${product._id}`}>
                    <h3 className="text-sm font-semibold text-gray-800 mt-0.5 line-clamp-2 hover:text-indigo-600">{product.name}</h3>
                  </Link>
                  <div className="flex items-center mt-1 space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} size={11} className={i < Math.round(product.ratings) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                    ))}
                    <span className="text-xs text-gray-400">({product.numReviews})</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <span className="font-bold text-gray-900">₹{product.discountPrice || product.price}</span>
                      {discountPercent > 0 && <span className="text-xs text-gray-400 line-through ml-1">₹{product.price}</span>}
                    </div>
                    {product.stock > 0 ? (
                      <button onClick={() => handleAddToCart(product)}
                        className="flex items-center space-x-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-indigo-700 transition">
                        <FiShoppingCart size={12} /> <span>Add</span>
                      </button>
                    ) : (
                      <span className="text-xs text-red-500 font-medium">Out of stock</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
