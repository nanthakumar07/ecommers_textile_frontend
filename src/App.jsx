import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import { Toaster } from "react-hot-toast";
import store from "./redux/store";
import { loadUser } from "./redux/slices/authSlice";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home          from "./pages/Home";
import Products      from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart          from "./pages/Cart";
import Checkout      from "./pages/Checkout";
import Login         from "./pages/Login";
import Register      from "./pages/Register";
import Profile       from "./pages/Profile";
import Orders        from "./pages/Orders";
import OrderDetail   from "./pages/OrderDetail";
import Wishlist      from "./pages/Wishlist";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound      from "./pages/NotFound";

function AppContent() {
  const dispatch = useDispatch();
  useEffect(() => { dispatch(loadUser()); }, [dispatch]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public */}
            <Route path="/"             element={<Home />} />
            <Route path="/products"     element={<Products />} />
            <Route path="/product/:id"  element={<ProductDetail />} />
            <Route path="/login"        element={<Login />} />
            <Route path="/register"     element={<Register />} />
            <Route path="/cart"         element={<Cart />} />

            {/* Protected – Customer */}
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/profile"  element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/orders"   element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/order/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />

            {/* Protected – Admin */}
            <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
