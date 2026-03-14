import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { placeOrder } from "../redux/slices/orderSlice";
import { clearCartState } from "../redux/slices/cartSlice";
import toast from "react-hot-toast";

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, subtotal } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.orders);

  const defaultAddr = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];

  const [address, setAddress] = useState({
    fullName: defaultAddr?.fullName || user?.name || "",
    phone: defaultAddr?.phone || "",
    addressLine1: defaultAddr?.addressLine1 || "",
    addressLine2: defaultAddr?.addressLine2 || "",
    city: defaultAddr?.city || "",
    state: defaultAddr?.state || "",
    postalCode: defaultAddr?.postalCode || "",
    country: "India",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");

  const shippingPrice = subtotal >= 999 ? 0 : 99;
  const taxPrice = Math.round(subtotal * 0.18);
  const totalAmount = subtotal + shippingPrice + taxPrice;

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const orderData = {
      items: items.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        image: item.product.images?.[0]?.url || "",
        price: item.product.discountPrice || item.product.price,
        quantity: item.quantity,
      })),
      shippingAddress: address,
      paymentInfo: {
        method: paymentMethod,
        status: paymentMethod === "cod" ? "pending" : "paid",
      },
      itemsPrice: subtotal,
      taxPrice,
      shippingPrice,
      totalAmount,
    };

    const result = await dispatch(placeOrder(orderData));
    if (result.meta.requestStatus === "fulfilled") {
      dispatch(clearCartState());
      toast.success("Order placed successfully!");
      navigate(`/order/${result.payload.order._id}`);
    } else {
      toast.error(result.payload || "Failed to place order");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>

      <form onSubmit={handlePlaceOrder}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Shipping Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-gray-800 mb-4">
                Shipping Address
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    name="fullName"
                    required
                    value={address.fullName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    name="phone"
                    required
                    value={address.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 1
                  </label>
                  <input
                    name="addressLine1"
                    required
                    value={address.addressLine1}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    name="addressLine2"
                    value={address.addressLine2}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    name="city"
                    required
                    value={address.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    name="state"
                    required
                    value={address.state}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    name="postalCode"
                    required
                    value={address.postalCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    name="country"
                    value={address.country}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50"
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-gray-800 mb-4">
                Payment Method
              </h3>
              <div className="space-y-3">
                {[
                  { value: "cod", label: "Cash on Delivery", desc: "Pay when you receive" },
                  { value: "card", label: "Credit/Debit Card", desc: "Secure card payment" },
                  { value: "upi", label: "UPI", desc: "Pay via UPI apps" },
                ].map((method) => (
                  <label
                    key={method.value}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
                      paymentMethod === method.value
                        ? "border-indigo-500 bg-indigo-50"
                        : "hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3 text-indigo-600"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {method.label}
                      </p>
                      <p className="text-xs text-gray-500">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-sm border p-6 h-fit sticky top-24">
            <h3 className="font-semibold text-gray-800 mb-4">Order Summary</h3>

            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item._id} className="flex items-center gap-3 text-sm">
                  <img
                    src={item.product.images?.[0]?.url || "https://via.placeholder.com/40"}
                    alt=""
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-gray-700">{item.product.name}</p>
                    <p className="text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-medium">₹{item.itemTotal}</span>
                </div>
              ))}
            </div>

            <hr className="my-3" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span>{shippingPrice === 0 ? "FREE" : `₹${shippingPrice}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tax (18%)</span>
                <span>₹{taxPrice}</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-indigo-700">₹{totalAmount}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || items.length === 0}
              className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
