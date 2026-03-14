import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrderDetails } from "../redux/slices/orderSlice";
import { cancelOrder } from "../services/api";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import { FiChevronRight, FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiClock } from "react-icons/fi";

const STATUS_STEPS = ["placed","confirmed","processing","shipped","out_for_delivery","delivered"];

const STATUS_ICONS = {
  placed: FiClock, confirmed: FiCheckCircle, processing: FiPackage,
  shipped: FiTruck, out_for_delivery: FiTruck, delivered: FiCheckCircle, cancelled: FiXCircle,
};

const OrderDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { order, loading } = useSelector((s) => s.orders);

  useEffect(() => { dispatch(fetchOrderDetails(id)); }, [dispatch, id]);

  const handleCancel = async () => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      await cancelOrder(id, { reason: "Cancelled by customer" });
      toast.success("Order cancelled");
      dispatch(fetchOrderDetails(id));
    } catch {
      toast.error("Cannot cancel this order");
    }
  };

  if (loading || !order) return <Loader />;

  const stepIdx = STATUS_STEPS.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === "cancelled";
  const canCancel = !["shipped","out_for_delivery","delivered","cancelled","returned"].includes(order.orderStatus);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-indigo-600">Home</Link>
        <FiChevronRight size={14} />
        <Link to="/orders" className="hover:text-indigo-600">My Orders</Link>
        <FiChevronRight size={14} />
        <span className="text-gray-800 font-medium">#{id.slice(-8).toUpperCase()}</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Order Details</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })}
          </p>
        </div>
        {canCancel && (
          <button onClick={handleCancel} className="text-sm text-red-600 border border-red-300 px-4 py-2 rounded-lg hover:bg-red-50 transition">
            Cancel Order
          </button>
        )}
      </div>

      {/* Progress tracker */}
      {!isCancelled && (
        <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-5">Order Tracking</h3>
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-5 h-1 bg-gray-200 z-0" />
            <div
              className="absolute left-0 top-5 h-1 bg-indigo-500 z-0 transition-all duration-500"
              style={{ width: stepIdx >= 0 ? `${(stepIdx / (STATUS_STEPS.length - 1)) * 100}%` : "0%" }}
            />
            {STATUS_STEPS.map((step, i) => {
              const done   = i <= stepIdx;
              const active = i === stepIdx;
              return (
                <div key={step} className="flex flex-col items-center relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition ${
                    done ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-gray-300 text-gray-400"
                  } ${active ? "ring-4 ring-indigo-100" : ""}`}>
                    {done ? <FiCheckCircle size={18} /> : <span className="text-xs font-bold">{i + 1}</span>}
                  </div>
                  <p className="text-xs text-center mt-2 font-medium capitalize text-gray-600 max-w-16">
                    {step.replace(/_/g, " ")}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center space-x-3">
          <FiXCircle className="text-red-500 flex-shrink-0" size={22} />
          <div>
            <p className="font-semibold text-red-700">Order Cancelled</p>
            <p className="text-sm text-red-500">{order.statusHistory?.find(s => s.status === "cancelled")?.note || ""}</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Items */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Ordered Items</h3>
            <div className="space-y-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <img src={item.image || item.product?.images?.[0]?.url || "https://via.placeholder.com/60"}
                    alt={item.name} className="w-16 h-16 object-cover rounded-lg border" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                  </div>
                  <p className="font-bold text-gray-900">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl border shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-3">Delivery Address</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-semibold text-gray-800">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}{order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country}</p>
              <p className="text-indigo-600">📞 {order.shippingAddress.phone}</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{order.itemsPrice}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{order.shippingPrice === 0 ? "FREE" : `₹${order.shippingPrice}`}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tax (GST)</span><span>₹{order.taxPrice}</span></div>
              {order.discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{order.discountAmount}</span></div>}
              <hr />
              <div className="flex justify-between text-base font-bold"><span>Total</span><span className="text-indigo-700">₹{order.totalAmount}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-3">Payment Info</h3>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="font-medium capitalize">{order.paymentInfo?.method || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`font-medium capitalize px-2 py-0.5 rounded-full text-xs ${
                  order.paymentInfo?.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}>
                  {order.paymentInfo?.status || "pending"}
                </span>
              </div>
              {order.trackingNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Tracking</span>
                  <span className="font-mono text-xs">{order.trackingNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Status History */}
          {order.statusHistory?.length > 0 && (
            <div className="bg-white rounded-xl border shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Status History</h3>
              <div className="space-y-3">
                {[...order.statusHistory].reverse().map((h, i) => (
                  <div key={i} className="flex items-start space-x-3 text-sm">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium capitalize">{h.status.replace(/_/g," ")}</p>
                      <p className="text-gray-400 text-xs">{new Date(h.date).toLocaleString()}</p>
                      {h.note && <p className="text-gray-500">{h.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
