import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCart,
  updateCartQuantity,
  removeCartItem,
} from "../redux/slices/cartSlice";
import Loader from "../components/Loader";
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag } from "react-icons/fi";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, subtotal, loading } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <FiShoppingBag className="mx-auto text-gray-300" size={64} />
        <h2 className="text-2xl font-bold text-gray-800 mt-4">
          Please login to view your cart
        </h2>
        <Link
          to="/login"
          className="inline-block mt-6 bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700"
        >
          Login
        </Link>
      </div>
    );
  }

  if (loading) return <Loader />;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <FiShoppingBag className="mx-auto text-gray-300" size={64} />
        <h2 className="text-2xl font-bold text-gray-800 mt-4">
          Your cart is empty
        </h2>
        <p className="text-gray-500 mt-2">
          Explore our products and add items to your cart
        </p>
        <Link
          to="/products"
          className="inline-block mt-6 bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const shippingPrice = subtotal >= 999 ? 0 : 99;
  const taxPrice = Math.round(subtotal * 0.18);
  const totalAmount = subtotal + shippingPrice + taxPrice;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Shopping Cart ({items.length} items)
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item._id}
              className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border"
            >
              <Link to={`/product/${item.product._id}`}>
                <img
                  src={item.product.images?.[0]?.url || "https://via.placeholder.com/100"}
                  alt={item.product.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link
                  to={`/product/${item.product._id}`}
                  className="font-semibold text-gray-800 hover:text-indigo-600 text-sm line-clamp-2"
                >
                  {item.product.name}
                </Link>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  ₹{item.product.discountPrice || item.product.price}{" "}
                  <span className="text-xs text-gray-500 font-normal">
                    / {item.product.unit}
                  </span>
                </p>
                <div className="flex items-center mt-2 space-x-3">
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() =>
                        dispatch(
                          updateCartQuantity({
                            itemId: item._id,
                            quantity: Math.max(1, item.quantity - 1),
                          })
                        )
                      }
                      className="p-1.5 hover:bg-gray-100"
                    >
                      <FiMinus size={14} />
                    </button>
                    <span className="px-3 text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        dispatch(
                          updateCartQuantity({
                            itemId: item._id,
                            quantity: item.quantity + 1,
                          })
                        )
                      }
                      className="p-1.5 hover:bg-gray-100"
                    >
                      <FiPlus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => dispatch(removeCartItem(item._id))}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">₹{item.itemTotal}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm border h-fit sticky top-24">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Order Summary
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium">₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span className="font-medium">
                {shippingPrice === 0 ? (
                  <span className="text-green-600">FREE</span>
                ) : (
                  `₹${shippingPrice}`
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tax (GST 18%)</span>
              <span className="font-medium">₹{taxPrice}</span>
            </div>
            <hr />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-indigo-700">₹{totalAmount}</span>
            </div>
          </div>
          {shippingPrice > 0 && (
            <p className="text-xs text-green-600 mt-3">
              Add ₹{999 - subtotal} more for free shipping!
            </p>
          )}
          <button
            onClick={() => navigate("/checkout")}
            className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Proceed to Checkout
          </button>
          <Link
            to="/products"
            className="block text-center mt-3 text-sm text-indigo-600 hover:underline"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
