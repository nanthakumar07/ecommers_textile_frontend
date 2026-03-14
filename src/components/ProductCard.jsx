import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addItemToCart } from "../redux/slices/cartSlice";
import { FiShoppingCart, FiStar } from "react-icons/fi";
import toast from "react-hot-toast";

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      return;
    }
    dispatch(addItemToCart({ productId: product._id, quantity: 1 }));
    toast.success("Added to cart!");
  };

  const discountPercent =
    product.discountPrice && product.discountPrice < product.price
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : 0;

  return (
    <Link
      to={`/product/${product._id}`}
      className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-square bg-gray-100">
        <img
          src={product.images?.[0]?.url || "https://via.placeholder.com/400"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {discountPercent > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{discountPercent}%
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-4">
        <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
          {product.fabricType}
        </span>
        <h3 className="mt-1 text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center mt-2 space-x-1">
          {[...Array(5)].map((_, i) => (
            <FiStar
              key={i}
              size={12}
              className={
                i < Math.round(product.ratings)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }
            />
          ))}
          <span className="text-xs text-gray-500 ml-1">
            ({product.numReviews})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-lg font-bold text-gray-900">
              ₹{product.discountPrice || product.price}
            </span>
            {discountPercent > 0 && (
              <span className="text-sm text-gray-400 line-through ml-2">
                ₹{product.price}
              </span>
            )}
            <span className="text-xs text-gray-500 block">
              per {product.unit}
            </span>
          </div>
          {product.stock > 0 && (
            <button
              onClick={handleAddToCart}
              className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              <FiShoppingCart size={16} />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
