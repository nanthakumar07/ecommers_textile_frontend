import axios from "axios";

// Dev: VITE_API_URL is empty → Vite proxy forwards /api → localhost:5000
// Prod: VITE_API_URL = https://ecommers-textile-backend.onrender.com/api
const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ── Auth ──────────────────────────────────────────────────────────────
export const registerUser   = (data) => API.post("/auth/register", data);
export const loginUser      = (data) => API.post("/auth/login", data);
export const logoutUser     = ()     => API.get("/auth/logout");
export const getProfile     = ()     => API.get("/auth/me");
export const updateProfile  = (data) => API.put("/auth/me", data);
export const updatePassword = (data) => API.put("/auth/password", data);
export const addAddress     = (data) => API.post("/auth/address", data);
export const updateAddress  = (id, data) => API.put(`/auth/address/${id}`, data);
export const deleteAddress  = (id)   => API.delete(`/auth/address/${id}`);

// ── Products ──────────────────────────────────────────────────────────
export const getAllProducts        = (params = "") => API.get(`/products?${params}`);
export const getProduct            = (id)         => API.get(`/products/${id}`);
export const getFeaturedProducts   = ()           => API.get("/products/featured");
export const getProductsByCategory = (cid, p="") => API.get(`/products/category/${cid}?${p}`);
// Admin
export const createProduct    = (data)      => API.post("/products", data);
export const updateProduct    = (id, data)  => API.put(`/products/${id}`, data);
export const deleteProduct    = (id)        => API.delete(`/products/${id}`);
export const getAdminProducts = ()          => API.get("/products/admin/all");

// ── Image Upload ──────────────────────────────────────────────────────
export const uploadImage = (formData) =>
  API.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
export const uploadImages = (formData) =>
  API.post("/upload/multiple", formData, { headers: { "Content-Type": "multipart/form-data" } });
export const deleteUploadedImage = (filename) => API.delete(`/upload/${filename}`);

// ── Categories ────────────────────────────────────────────────────────
export const getAllCategories = ()          => API.get("/categories");
export const getCategory      = (id)        => API.get(`/categories/${id}`);
export const createCategory   = (data)      => API.post("/categories", data);
export const updateCategory   = (id, data)  => API.put(`/categories/${id}`, data);
export const deleteCategory   = (id)        => API.delete(`/categories/${id}`);

// ── Cart ──────────────────────────────────────────────────────────────
export const getCart        = ()              => API.get("/cart");
export const addToCart      = (data)          => API.post("/cart", data);
export const updateCartItem = (itemId, data)  => API.put(`/cart/${itemId}`, data);
export const removeFromCart = (itemId)        => API.delete(`/cart/${itemId}`);
export const clearCart      = ()              => API.delete("/cart");

// ── Orders ────────────────────────────────────────────────────────────
export const createOrder      = (data)      => API.post("/orders", data);
export const getMyOrders      = ()          => API.get("/orders/me");
export const getOrder         = (id)        => API.get(`/orders/${id}`);
export const cancelOrder      = (id, data)  => API.put(`/orders/${id}/cancel`, data);
// Admin
export const getAllOrders      = ()          => API.get("/orders/admin/all");
export const updateOrderStatus = (id, data) => API.put(`/orders/${id}/status`, data);

// ── Reviews ───────────────────────────────────────────────────────────
export const getProductReviews = (productId) => API.get(`/reviews/${productId}`);
export const createReview      = (data)      => API.post("/reviews", data);
export const deleteReview      = (id)        => API.delete(`/reviews/${id}`);

// ── Wishlist ──────────────────────────────────────────────────────────
export const getWishlist    = ()   => API.get("/auth/wishlist");
export const toggleWishlist = (id) => API.post(`/auth/wishlist/${id}`);

// ── Admin Users ───────────────────────────────────────────────────────
export const getAllUsers     = ()          => API.get("/auth/admin/users");
export const updateUserRole  = (id, data) => API.put(`/auth/admin/users/${id}`, data);
export const deleteUser      = (id)       => API.delete(`/auth/admin/users/${id}`);

export default API;
