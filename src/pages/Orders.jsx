import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyOrders } from "../redux/slices/orderSlice";
import Loader from "../components/Loader";
import { FiPackage, FiChevronRight } from "react-icons/fi";

const statusColor = {
  placed: "bg-blue-100 text-blue-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  processing: "bg-yellow-100 text-yellow-700",
  shipped: "bg-purple-100 text-purple-700",
  out_for_delivery: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  returned: "bg-gray-100 text-gray-700",
};

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <FiPackage className="mx-auto text-gray-300" size={64} />
          <h2 className="text-xl font-bold text-gray-800 mt-4">No orders yet</h2>
          <p className="text-gray-500 mt-2">
            Start shopping to see your orders here
          </p>
          <Link
            to="/products"
            className="inline-block mt-6 bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-xl shadow-sm border p-5 hover:border-indigo-200 transition"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-500">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${
                    statusColor[order.orderStatus] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {order.orderStatus.replace(/_/g, " ")}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                {order.items.slice(0, 3).map((item, i) => (
                  <img
                    key={i}
                    src={item.image || item.product?.images?.[0]?.url || "https://via.placeholder.com/60"}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded-lg border"
                  />
                ))}
                {order.items.length > 3 && (
                  <span className="text-sm text-gray-500">
                    +{order.items.length - 3} more
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {order.items.length} item(s)
                  </p>
                  <p className="font-bold text-gray-900">₹{order.totalAmount}</p>
                </div>
                <Link
                  to={`/order/${order._id}`}
                  className="flex items-center text-indigo-600 text-sm font-medium hover:underline"
                >
                  View Details <FiChevronRight className="ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
