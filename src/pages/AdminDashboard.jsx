import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import * as api from "../services/api";
import Loader from "../components/Loader";
import {
  FiHome, FiShoppingBag, FiPackage, FiGrid, FiUsers,
  FiPlus, FiEdit2, FiTrash2, FiX, FiUpload, FiCheck,
  FiDollarSign, FiAlertCircle, FiImage,
} from "react-icons/fi";
import toast from "react-hot-toast";

// ── constants ──────────────────────────────────────────────────────────
const FABRIC_TYPES = ["Cotton","Silk","Polyester","Linen","Wool","Denim","Chiffon","Satin","Velvet","Nylon","Rayon","Jute","Organza","Georgette","Crepe","Other"];
const PATTERNS     = ["Solid","Striped","Checked","Printed","Embroidered","Woven","Floral","Geometric","Abstract","Plain","Other"];
const UNITS        = ["meter","yard","piece","kg","set"];
const ORDER_STATUSES = ["placed","confirmed","processing","shipped","out_for_delivery","delivered","cancelled","returned"];

const STATUS_COLORS = {
  placed: "bg-blue-100 text-blue-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  processing: "bg-yellow-100 text-yellow-700",
  shipped: "bg-purple-100 text-purple-700",
  out_for_delivery: "bg-orange-100 text-orange-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  returned: "bg-gray-100 text-gray-700",
};

const emptyProduct = {
  name: "", description: "", price: "", discountPrice: "",
  category: "", fabricType: "Cotton", gsm: "", color: "",
  pattern: "Solid", stock: "", unit: "meter", minOrderQty: 1,
  isFeatured: false, tags: "", images: [],
};

// ── ImageUploader component ───────────────────────────────────────────
function ImageUploader({ images, onChange }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files) => {
    if (!files.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("images", f));
      const { data } = await api.uploadImages(fd);
      onChange([...images, ...data.images]);
      toast.success(`${data.images.length} image(s) uploaded`);
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (img, idx) => {
    try {
      await api.deleteUploadedImage(img.public_id);
    } catch {}
    onChange(images.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-3">
        {images.map((img, i) => (
          <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border">
            <img src={img.url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(img, i)}
              className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5"
            >
              <FiX size={10} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current.click()}
          disabled={uploading}
          className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-indigo-400 hover:text-indigo-500 transition disabled:opacity-50"
        >
          {uploading ? <FiUpload className="animate-bounce" size={20} /> : <><FiImage size={20} /><span className="text-xs mt-1">Add</span></>}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}

// ── ProductForm modal ─────────────────────────────────────────────────
function ProductModal({ product, categories, onClose, onSaved }) {
  const isEdit = !!product?._id;
  const [form, setForm] = useState(() =>
    isEdit
      ? { ...product, tags: (product.tags || []).join(", "), discountPrice: product.discountPrice || "" }
      : { ...emptyProduct }
  );
  const [saving, setSaving] = useState(false);

  const set = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : 0,
        gsm: form.gsm ? Number(form.gsm) : 0,
        stock: Number(form.stock),
        minOrderQty: Number(form.minOrderQty) || 1,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      };
      if (isEdit) {
        await api.updateProduct(product._id, payload);
        toast.success("Product updated successfully");
      } else {
        await api.createProduct(payload);
        toast.success("Product created successfully");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-auto">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold text-gray-800">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX size={22} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Images */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product Images <span className="text-red-500">*</span>
            </label>
            <ImageUploader images={form.images} onChange={(imgs) => set("images", imgs)} />
          </div>

          {/* Name + Category */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name <span className="text-red-500">*</span></label>
              <input required value={form.name} onChange={(e) => set("name", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="e.g. Premium Cotton Fabric" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
              <select required value={form.category?._id || form.category} onChange={(e) => set("category", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                <option value="">Select category</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
            <textarea required rows={3} value={form.description} onChange={(e) => set("description", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none" />
          </div>

          {/* Price + Discount */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Price (₹) <span className="text-red-500">*</span></label>
              <input required type="number" min="0" value={form.price} onChange={(e) => set("price", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="e.g. 500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Discount Price (₹)</label>
              <input type="number" min="0" value={form.discountPrice} onChange={(e) => set("discountPrice", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="e.g. 399" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Stock <span className="text-red-500">*</span></label>
              <input required type="number" min="0" value={form.stock} onChange={(e) => set("stock", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="e.g. 100" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Min Order Qty</label>
              <input type="number" min="1" value={form.minOrderQty} onChange={(e) => set("minOrderQty", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>
          </div>

          {/* Fabric / Color / Pattern / Unit / GSM */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Fabric Type <span className="text-red-500">*</span></label>
              <select required value={form.fabricType} onChange={(e) => set("fabricType", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                {FABRIC_TYPES.map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Color <span className="text-red-500">*</span></label>
              <input required value={form.color} onChange={(e) => set("color", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="e.g. White" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Pattern</label>
              <select value={form.pattern} onChange={(e) => set("pattern", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                {PATTERNS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Unit</label>
              <select value={form.unit} onChange={(e) => set("unit", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
                {UNITS.map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">GSM</label>
              <input type="number" min="0" value={form.gsm} onChange={(e) => set("gsm", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="e.g. 120" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Width</label>
              <input value={form.width || ""} onChange={(e) => set("width", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="e.g. 44 inches" />
            </div>
          </div>

          {/* Tags + Featured */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tags (comma separated)</label>
              <input value={form.tags} onChange={(e) => set("tags", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="cotton, summer, breathable" />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded" />
                <span className="text-sm font-semibold text-gray-700">Featured Product</span>
              </label>
            </div>
          </div>

          {/* Discount preview */}
          {form.price && form.discountPrice && Number(form.discountPrice) < Number(form.price) && (
            <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-700">
              <FiCheck />
              <span>
                Discount: {Math.round(((form.price - form.discountPrice) / form.price) * 100)}% OFF
                — Customer pays <strong>₹{form.discountPrice}</strong> instead of ₹{form.price}
              </span>
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50">
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 border text-gray-600 py-2.5 rounded-lg font-semibold hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── CategoryModal ──────────────────────────────────────────────────────
function CategoryModal({ cat, onClose, onSaved }) {
  const isEdit = !!cat?._id;
  const [form, setForm] = useState({ name: cat?.name || "", description: cat?.description || "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) { await api.updateCategory(cat._id, form); toast.success("Category updated"); }
      else        { await api.createCategory(form);           toast.success("Category created"); }
      onSaved(); onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold">{isEdit ? "Edit Category" : "Add Category"}</h2>
          <button onClick={onClose}><FiX size={22} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none" />
          </div>
          <div className="flex space-x-3">
            <button type="submit" disabled={saving}
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-semibold disabled:opacity-50">
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Create"}
            </button>
            <button type="button" onClick={onClose} className="flex-1 border rounded-lg py-2.5">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main AdminDashboard ────────────────────────────────────────────────
const AdminDashboard = () => {
  const { user } = useSelector((s) => s.auth);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ orders: [], products: [], users: [], categories: [], stats: null });

  // Modals
  const [productModal, setProductModal] = useState(null); // null | "new" | product object
  const [catModal, setCatModal]         = useState(null); // null | "new" | category object

  const load = async () => {
    setLoading(true);
    try {
      const [o, p, u, c] = await Promise.all([
        api.getAllOrders(), api.getAdminProducts(), api.getAllUsers(), api.getAllCategories(),
      ]);
      const orders    = o.data.orders;
      const products  = p.data.products;
      const users     = u.data.users;
      const categories = c.data.categories;
      const totalRevenue = orders.reduce((s, x) => x.orderStatus !== "cancelled" ? s + x.totalAmount : s, 0);
      setData({ orders, products, users, categories, stats: {
        totalOrders: orders.length, totalRevenue,
        totalProducts: products.length, totalUsers: users.length,
      }});
    } catch { toast.error("Failed to load data"); }
    finally  { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try { await api.deleteProduct(id); toast.success("Product deleted"); load(); }
    catch { toast.error("Failed to delete product"); }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try { await api.deleteCategory(id); toast.success("Category deleted"); load(); }
    catch { toast.error("Failed to delete category"); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try { await api.deleteUser(id); toast.success("User deleted"); load(); }
    catch { toast.error("Failed to delete user"); }
  };

  const updateRole = async (id, role) => {
    try { await api.updateUserRole?.(id, { role }); toast.success("Role updated"); load(); }
    catch { toast.error("Failed to update role"); }
  };

  const updateStatus = async (id, status) => {
    try { await api.updateOrderStatus(id, { status }); toast.success("Status updated"); load(); }
    catch { toast.error("Failed to update status"); }
  };

  if (loading) return <Loader />;

  const navItems = [
    { id: "overview",   icon: FiHome,      label: "Overview" },
    { id: "products",   icon: FiShoppingBag, label: "Products" },
    { id: "orders",     icon: FiPackage,   label: "Orders" },
    { id: "categories", icon: FiGrid,      label: "Categories" },
    { id: "users",      icon: FiUsers,     label: "Users" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-white shadow-sm border-r sticky top-0 h-screen">
        <div className="p-5 border-b">
          <p className="text-xs text-gray-500">Logged in as</p>
          <p className="font-bold text-gray-800 truncate">{user?.name}</p>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Admin</span>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map((n) => (
            <button key={n.id} onClick={() => setTab(n.id)}
              className={`flex items-center w-full space-x-3 px-5 py-3 text-sm font-medium transition ${
                tab === n.id ? "bg-indigo-50 text-indigo-700 border-r-2 border-indigo-600" : "text-gray-600 hover:bg-gray-50"
              }`}>
              <n.icon size={18} /> <span>{n.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile tab bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex z-40">
        {navItems.map((n) => (
          <button key={n.id} onClick={() => setTab(n.id)}
            className={`flex-1 flex flex-col items-center py-2 text-xs font-medium ${
              tab === n.id ? "text-indigo-600" : "text-gray-500"
            }`}>
            <n.icon size={20} />
            <span className="mt-0.5">{n.label}</span>
          </button>
        ))}
      </div>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-auto">
        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div>
            <h1 className="text-xl font-bold text-gray-800 mb-5">Dashboard Overview</h1>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { icon: FiDollarSign, label: "Total Revenue", value: `₹${data.stats.totalRevenue.toLocaleString()}`, color: "bg-green-500" },
                { icon: FiPackage,    label: "Total Orders",  value: data.stats.totalOrders, color: "bg-blue-500" },
                { icon: FiShoppingBag, label: "Products",     value: data.stats.totalProducts, color: "bg-purple-500" },
                { icon: FiUsers,      label: "Customers",     value: data.stats.totalUsers, color: "bg-orange-500" },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-xl p-5 shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">{s.label}</p>
                      <p className="text-2xl font-bold text-gray-800 mt-1">{s.value}</p>
                    </div>
                    <div className={`${s.color} p-3 rounded-xl text-white`}><s.icon size={20} /></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Recent Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-3 font-medium">Order ID</th>
                      <th className="pb-3 font-medium">Customer</th>
                      <th className="pb-3 font-medium">Amount</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orders.slice(0, 8).map((o) => (
                      <tr key={o._id} className="border-b last:border-0">
                        <td className="py-3 font-mono text-xs">#{o._id.slice(-8).toUpperCase()}</td>
                        <td className="py-3">{o.user?.name || "N/A"}</td>
                        <td className="py-3 font-semibold">₹{o.totalAmount}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${STATUS_COLORS[o.orderStatus] || ""}`}>
                            {o.orderStatus.replace(/_/g," ")}
                          </span>
                        </td>
                        <td className="py-3 text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── PRODUCTS ── */}
        {tab === "products" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h1 className="text-xl font-bold text-gray-800">Products ({data.products.length})</h1>
              <button onClick={() => setProductModal("new")}
                className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium">
                <FiPlus /> <span>Add Product</span>
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left text-gray-500">
                      <th className="p-4 font-medium">Product</th>
                      <th className="p-4 font-medium">Price</th>
                      <th className="p-4 font-medium">Discount</th>
                      <th className="p-4 font-medium">Stock</th>
                      <th className="p-4 font-medium">Category</th>
                      <th className="p-4 font-medium">Featured</th>
                      <th className="p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.products.map((p) => (
                      <tr key={p._id} className="border-t hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={p.images?.[0]?.url || "https://via.placeholder.com/40"}
                              alt="" className="w-12 h-12 rounded-lg object-cover border" />
                            <div>
                              <p className="font-medium text-gray-800 max-w-xs truncate">{p.name}</p>
                              <p className="text-xs text-gray-400">{p.fabricType} · {p.color}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-semibold">₹{p.price}</td>
                        <td className="p-4">
                          {p.discountPrice && p.discountPrice < p.price ? (
                            <span className="text-green-600 font-semibold">₹{p.discountPrice}
                              <span className="text-xs text-gray-400 ml-1">
                                ({Math.round(((p.price - p.discountPrice)/p.price)*100)}% off)
                              </span>
                            </span>
                          ) : <span className="text-gray-400 text-xs">No discount</span>}
                        </td>
                        <td className="p-4">
                          <span className={p.stock > 10 ? "text-green-600 font-medium" : p.stock > 0 ? "text-yellow-600 font-medium" : "text-red-600 font-medium"}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="p-4 text-gray-500">{p.category?.name || "—"}</td>
                        <td className="p-4">
                          {p.isFeatured ? <FiCheck className="text-green-500" /> : <FiX className="text-gray-300" />}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <button onClick={() => setProductModal(p)}
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded transition">
                              <FiEdit2 size={15} />
                            </button>
                            <button onClick={() => deleteProduct(p._id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded transition">
                              <FiTrash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── ORDERS ── */}
        {tab === "orders" && (
          <div>
            <h1 className="text-xl font-bold text-gray-800 mb-5">Orders ({data.orders.length})</h1>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left text-gray-500">
                      <th className="p-4 font-medium">Order</th>
                      <th className="p-4 font-medium">Customer</th>
                      <th className="p-4 font-medium">Items</th>
                      <th className="p-4 font-medium">Total</th>
                      <th className="p-4 font-medium">Payment</th>
                      <th className="p-4 font-medium">Date</th>
                      <th className="p-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orders.map((o) => (
                      <tr key={o._id} className="border-t hover:bg-gray-50">
                        <td className="p-4 font-mono text-xs font-bold">#{o._id.slice(-8).toUpperCase()}</td>
                        <td className="p-4">
                          <p className="font-medium">{o.user?.name || "N/A"}</p>
                          <p className="text-xs text-gray-400">{o.user?.email}</p>
                        </td>
                        <td className="p-4">{o.items.length} item(s)</td>
                        <td className="p-4 font-semibold">₹{o.totalAmount}</td>
                        <td className="p-4 capitalize">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${o.paymentInfo?.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                            {o.paymentInfo?.status || "pending"}
                          </span>
                        </td>
                        <td className="p-4 text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td className="p-4">
                          <select value={o.orderStatus} onChange={(e) => updateStatus(o._id, e.target.value)}
                            className="text-xs border rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none capitalize">
                            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── CATEGORIES ── */}
        {tab === "categories" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h1 className="text-xl font-bold text-gray-800">Categories ({data.categories.length})</h1>
              <button onClick={() => setCatModal("new")}
                className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium">
                <FiPlus /> <span>Add Category</span>
              </button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.categories.map((c) => (
                <div key={c._id} className="bg-white rounded-xl shadow-sm border p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <span className="text-xl font-bold text-indigo-600">{c.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{c.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{c.description || "No description"}</p>
                        <p className="text-xs text-gray-400 mt-1">Slug: <span className="font-mono">{c.slug}</span></p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button onClick={() => setCatModal(c)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"><FiEdit2 size={15} /></button>
                      <button onClick={() => deleteCategory(c._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><FiTrash2 size={15} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {tab === "users" && (
          <div>
            <h1 className="text-xl font-bold text-gray-800 mb-5">Users ({data.users.length})</h1>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left text-gray-500">
                      <th className="p-4 font-medium">User</th>
                      <th className="p-4 font-medium">Phone</th>
                      <th className="p-4 font-medium">Addresses</th>
                      <th className="p-4 font-medium">Role</th>
                      <th className="p-4 font-medium">Joined</th>
                      <th className="p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.users.map((u) => (
                      <tr key={u._id} className="border-t hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{u.name}</p>
                              <p className="text-xs text-gray-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-gray-500">{u.phone || "—"}</td>
                        <td className="p-4">{u.addresses?.length || 0}</td>
                        <td className="p-4">
                          <select value={u.role} onChange={(e) => updateRole(u._id, e.target.value)}
                            disabled={u._id === user._id}
                            className="text-xs border rounded px-2 py-1 capitalize disabled:opacity-50">
                            {["customer","admin","vendor"].map((r) => <option key={r}>{r}</option>)}
                          </select>
                        </td>
                        <td className="p-4 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="p-4">
                          {u._id !== user._id && (
                            <button onClick={() => deleteUser(u._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                              <FiTrash2 size={15} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {productModal && (
        <ProductModal
          product={productModal === "new" ? null : productModal}
          categories={data.categories}
          onClose={() => setProductModal(null)}
          onSaved={load}
        />
      )}
      {catModal && (
        <CategoryModal
          cat={catModal === "new" ? null : catModal}
          onClose={() => setCatModal(null)}
          onSaved={load}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
