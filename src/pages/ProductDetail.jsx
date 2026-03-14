import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductDetails, clearProductDetails } from "../redux/slices/productSlice";
import { addItemToCart } from "../redux/slices/cartSlice";
import { loadUser } from "../redux/slices/authSlice";
import Loader from "../components/Loader";
import * as api from "../services/api";
import toast from "react-hot-toast";
import {
  FiStar, FiShoppingCart, FiMinus, FiPlus, FiChevronRight,
  FiHeart, FiShare2, FiCheck,
} from "react-icons/fi";

// ── Star selector ─────────────────────────────────────────────────────
function StarSelector({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex space-x-1">
      {[1,2,3,4,5].map((s) => (
        <button key={s} type="button"
          onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}>
          <FiStar size={22} className={(hover || value) >= s ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
        </button>
      ))}
    </div>
  );
}

// ── Reviews ───────────────────────────────────────────────────────────
function Reviews({ productId }) {
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  const [reviews, setReviews]   = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ rating: 5, title: "", comment: "" });
  const [saving, setSaving]     = useState(false);

  const load = async () => {
    try { const { data } = await api.getProductReviews(productId); setReviews(data.reviews); } catch {}
  };
  useEffect(() => { load(); }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createReview({ productId, ...form });
      toast.success("Review submitted!"); setShowForm(false);
      setForm({ rating: 5, title: "", comment: "" }); load();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await api.deleteReview(id); toast.success("Review deleted"); load(); }
    catch { toast.error("Failed"); }
  };

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-bold text-gray-800">Customer Reviews ({reviews.length})</h3>
        {isAuthenticated && !showForm && (
          <button onClick={() => setShowForm(true)}
            className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
            Write a Review
          </button>
        )}
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-indigo-50 rounded-xl p-5 mb-6 border border-indigo-100">
          <h4 className="font-semibold text-gray-800 mb-4">Your Review</h4>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <StarSelector value={form.rating} onChange={(r) => setForm({ ...form, rating: r })} />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Summarise your experience" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Comment *</label>
            <textarea required rows={3} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
              placeholder="Share your experience..." />
          </div>
          <div className="flex space-x-3">
            <button type="submit" disabled={saving}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50">
              {saving ? "Submitting..." : "Submit Review"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="border px-6 py-2 rounded-lg">Cancel</button>
          </div>
        </form>
      )}
      {reviews.length === 0 ? (
        <p className="text-gray-400 text-sm py-6 text-center">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="bg-white rounded-xl border p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                    {r.user?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{r.user?.name || "Customer"}</p>
                    <div className="flex items-center space-x-1 mt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} size={12}
                          className={i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                      ))}
                      {r.isVerifiedPurchase && (
                        <span className="text-xs text-green-600 ml-2 flex items-center space-x-0.5">
                          <FiCheck size={10} /><span>Verified</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                  {(user?._id === r.user?._id || user?.role === "admin") && (
                    <button onClick={() => handleDelete(r._id)} className="text-red-400 hover:text-red-600 text-xs">Delete</button>
                  )}
                </div>
              </div>
              {r.title && <p className="font-semibold text-gray-800 mt-3">{r.title}</p>}
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main ProductDetail ────────────────────────────────────────────────
const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { product, loading }      = useSelector((s) => s.products);
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const [quantity, setQuantity]       = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [inWishlist, setInWishlist]   = useState(false);
  const [wishLoading, setWishLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchProductDetails(id));
    return () => dispatch(clearProductDetails());
  }, [dispatch, id]);

  useEffect(() => {
    if (user?.wishlist && product) {
      setInWishlist(user.wishlist.some((w) => (w._id || w) === product._id));
    }
  }, [user, product]);

  const handleAddToCart = () => {
    if (!isAuthenticated) { toast.error("Please login to add to cart"); return; }
    dispatch(addItemToCart({ productId: product._id, quantity }));
    toast.success(`${quantity} item(s) added to cart!`);
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.error("Please login"); return; }
    setWishLoading(true);
    try {
      await api.toggleWishlist(product._id);
      await dispatch(loadUser());
      setInWishlist((prev) => !prev);
      toast.success(inWishlist ? "Removed from wishlist" : "Added to wishlist");
    } catch { toast.error("Failed"); }
    finally { setWishLoading(false); }
  };

  if (loading || !product) return <Loader />;

  const discountPercent = product.discountPrice && product.discountPrice < product.price
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6 flex-wrap">
        <Link to="/" className="hover:text-indigo-600">Home</Link>
        <FiChevronRight size={14} />
        <Link to="/products" className="hover:text-indigo-600">Products</Link>
        <FiChevronRight size={14} />
        <span className="text-gray-800 font-medium">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="bg-gray-100 rounded-2xl overflow-hidden aspect-square mb-3 relative">
            <img src={product.images?.[activeImage]?.url || "https://via.placeholder.com/600"}
              alt={product.name} className="w-full h-full object-cover" />
            {discountPercent > 0 && (
              <span className="absolute top-3 left-3 bg-red-500 text-white font-bold text-sm px-3 py-1 rounded-full">
                -{discountPercent}% OFF
              </span>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition ${
                    activeImage === i ? "border-indigo-600" : "border-gray-200 hover:border-gray-400"
                  }`}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">
                {product.fabricType} · {product.pattern}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1 leading-tight">{product.name}</h1>
            </div>
            <div className="flex space-x-2 flex-shrink-0">
              <button onClick={handleWishlist} disabled={wishLoading}
                className={`p-2.5 rounded-xl border transition ${
                  inWishlist ? "bg-red-50 border-red-300 text-red-500" : "bg-white border-gray-200 text-gray-400 hover:text-red-400"
                }`}>
                <FiHeart size={20} className={inWishlist ? "fill-red-500" : ""} />
              </button>
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}
                className="p-2.5 rounded-xl border bg-white border-gray-200 text-gray-400 hover:text-indigo-500 transition">
                <FiShare2 size={20} />
              </button>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center mt-3 space-x-2">
            <div className="flex space-x-0.5">
              {[...Array(5)].map((_, i) => (
                <FiStar key={i} size={16}
                  className={i < Math.round(product.ratings) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-800">{product.ratings}</span>
            <span className="text-sm text-gray-400">({product.numReviews} reviews)</span>
          </div>

          {/* Price */}
          <div className="mt-4 flex items-baseline space-x-3 flex-wrap gap-y-1">
            <span className="text-3xl font-bold text-gray-900">₹{product.discountPrice || product.price}</span>
            {discountPercent > 0 && (
              <>
                <span className="text-xl text-gray-400 line-through">₹{product.price}</span>
                <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  {discountPercent}% OFF
                </span>
              </>
            )}
            <span className="text-sm text-gray-500">per {product.unit}</span>
          </div>

          {/* Specs */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              ["Fabric", product.fabricType], ["Color", product.color], ["Pattern", product.pattern],
              ["GSM", product.gsm ? `${product.gsm}` : "—"], ["Width", product.width || "—"],
              ["Min Order", `${product.minOrderQty || 1} ${product.unit}`],
            ].map(([l, v]) => (
              <div key={l} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 uppercase">{l}</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{v}</p>
              </div>
            ))}
          </div>

          {/* Stock */}
          <div className="mt-5">
            {product.stock > 10 ? (
              <span className="text-green-600 font-medium text-sm">✓ In Stock ({product.stock} available)</span>
            ) : product.stock > 0 ? (
              <span className="text-orange-500 font-medium text-sm">⚠ Only {product.stock} left!</span>
            ) : (
              <span className="text-red-600 font-medium text-sm">✕ Out of Stock</span>
            )}
          </div>

          {/* Qty + Cart */}
          {product.stock > 0 && (
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <div className="flex items-center border rounded-xl overflow-hidden">
                <button onClick={() => setQuantity((q) => Math.max(product.minOrderQty || 1, q - 1))}
                  className="px-4 py-3 hover:bg-gray-100 transition"><FiMinus size={16} /></button>
                <span className="px-5 font-bold text-gray-800">{quantity}</span>
                <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="px-4 py-3 hover:bg-gray-100 transition"><FiPlus size={16} /></button>
              </div>
              <button onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center space-x-2 bg-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-md shadow-indigo-100">
                <FiShoppingCart size={18} /> <span>Add to Cart</span>
              </button>
            </div>
          )}

          {/* Description */}
          <div className="mt-6 border-t pt-5">
            <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Link key={tag} to={`/products?keyword=${tag}`}
                  className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full hover:bg-indigo-100 hover:text-indigo-600 transition">
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-12 border-t pt-8">
        <Reviews productId={id} />
      </div>
    </div>
  );
};

export default ProductDetail;
