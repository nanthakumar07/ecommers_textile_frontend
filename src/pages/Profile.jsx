import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadUser } from "../redux/slices/authSlice";
import * as api from "../services/api";
import { Link } from "react-router-dom";
import { FiEdit2, FiTrash2, FiPlus, FiX, FiCheck, FiUser, FiLock, FiMapPin } from "react-icons/fi";
import toast from "react-hot-toast";

// ── Tab: Profile Info ─────────────────────────────────────────────────
function ProfileInfo({ user }) {
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user.name, email: user.email, phone: user.phone || "" });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateProfile(form);
      await dispatch(loadUser());
      toast.success("Profile updated");
      setEditing(false);
    } catch { toast.error("Failed to update profile"); }
    finally  { setSaving(false); }
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-gray-800 text-lg">Personal Information</h3>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="flex items-center space-x-1.5 text-sm text-indigo-600 hover:text-indigo-800">
            <FiEdit2 size={14} /> <span>Edit</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button onClick={handleSave} disabled={saving}
              className="flex items-center space-x-1 text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg disabled:opacity-50">
              <FiCheck size={14} /> <span>{saving ? "Saving..." : "Save"}</span>
            </button>
            <button onClick={() => setEditing(false)} className="text-sm border px-3 py-1.5 rounded-lg">
              <FiX size={14} />
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[["Full Name","name","text"],["Email","email","email"],["Phone","phone","tel"]].map(([label, field, type]) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type={type} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-y-4">
          {[["Full Name", user.name], ["Email", user.email], ["Phone", user.phone || "Not provided"], ["Account Type", user.role]].map(([label, value]) => (
            <div key={label}>
              <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
              <p className="font-medium text-gray-800 mt-0.5 capitalize">{value}</p>
            </div>
          ))}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Member Since</p>
            <p className="font-medium text-gray-800 mt-0.5">{new Date(user.createdAt).toLocaleDateString("en-IN", {day:"numeric",month:"long",year:"numeric"})}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab: Change Password ──────────────────────────────────────────────
function ChangePassword() {
  const [form, setForm] = useState({ currentPassword:"", newPassword:"", confirmPassword:"" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) { toast.error("New passwords do not match"); return; }
    if (form.newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setSaving(true);
    try {
      await api.updatePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success("Password changed successfully");
      setForm({ currentPassword:"", newPassword:"", confirmPassword:"" });
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setSaving(false); }
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm p-6">
      <h3 className="font-semibold text-gray-800 text-lg mb-5">Change Password</h3>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        {[["Current Password","currentPassword"],["New Password","newPassword"],["Confirm New Password","confirmPassword"]].map(([label, field]) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input type="password" required value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>
        ))}
        <button type="submit" disabled={saving}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50">
          {saving ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}

// ── Address Form ──────────────────────────────────────────────────────
const emptyAddr = { fullName:"", phone:"", addressLine1:"", addressLine2:"", city:"", state:"", postalCode:"", country:"India", isDefault: false };

function AddressBook({ user }) {
  const dispatch = useDispatch();
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState(null); // address object
  const [form, setForm]           = useState(emptyAddr);
  const [saving, setSaving]       = useState(false);

  const openAdd = () => { setEditing(null); setForm(emptyAddr); setShowForm(true); };
  const openEdit = (addr) => { setEditing(addr); setForm({ ...addr }); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) { await api.updateAddress(editing._id, form); toast.success("Address updated"); }
      else          { await api.addAddress(form);                  toast.success("Address added"); }
      await dispatch(loadUser());
      setShowForm(false);
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try { await api.deleteAddress(id); await dispatch(loadUser()); toast.success("Address deleted"); }
    catch { toast.error("Failed to delete"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 text-lg">Saved Addresses</h3>
        <button onClick={openAdd} className="flex items-center space-x-1.5 text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700">
          <FiPlus size={14} /> <span>Add Address</span>
        </button>
      </div>

      {user.addresses?.length === 0 && !showForm && (
        <div className="bg-white rounded-xl border p-8 text-center">
          <FiMapPin className="mx-auto text-gray-300" size={48} />
          <p className="text-gray-500 mt-2">No addresses saved yet</p>
        </div>
      )}

      {/* Address cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {user.addresses?.map((addr) => (
          <div key={addr._id} className={`bg-white rounded-xl border shadow-sm p-5 ${addr.isDefault ? "border-indigo-300" : ""}`}>
            <div className="flex items-start justify-between">
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-semibold text-gray-800">{addr.fullName}</p>
                <p>{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}</p>
                <p>{addr.city}, {addr.state} — {addr.postalCode}</p>
                <p>{addr.country}</p>
                <p className="text-indigo-600">📞 {addr.phone}</p>
                {addr.isDefault && <span className="inline-block bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-medium">Default</span>}
              </div>
              <div className="flex space-x-1 flex-shrink-0">
                <button onClick={() => openEdit(addr)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"><FiEdit2 size={14} /></button>
                <button onClick={() => handleDelete(addr._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><FiTrash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-800">{editing ? "Edit Address" : "New Address"}</h4>
            <button onClick={() => setShowForm(false)}><FiX size={20} /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            {[
              ["Full Name","fullName","text",true], ["Phone","phone","tel",true],
              ["Address Line 1","addressLine1","text",true], ["Address Line 2","addressLine2","text",false],
              ["City","city","text",true], ["State","state","text",true],
              ["Postal Code","postalCode","text",true], ["Country","country","text",true],
            ].map(([label, field, type, req]) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}{req && " *"}</label>
                <input type={type} required={req} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>
            ))}
            <div className="md:col-span-2 flex items-center space-x-2">
              <input type="checkbox" id="default-addr" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded" />
              <label htmlFor="default-addr" className="text-sm text-gray-700">Set as default address</label>
            </div>
            <div className="md:col-span-2 flex space-x-3">
              <button type="submit" disabled={saving}
                className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-semibold disabled:opacity-50">
                {saving ? "Saving..." : editing ? "Save Changes" : "Add Address"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 border rounded-lg py-2.5 font-semibold">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ── Main Profile page ─────────────────────────────────────────────────
const Profile = () => {
  const { user } = useSelector((s) => s.auth);
  const [activeTab, setActiveTab] = useState("info");

  if (!user) return null;

  const tabs = [
    { id: "info",      icon: FiUser,    label: "Profile Info" },
    { id: "addresses", icon: FiMapPin,  label: "Addresses" },
    { id: "password",  icon: FiLock,    label: "Password" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Account</h1>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl border shadow-sm p-5 text-center mb-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-indigo-600">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            <p className="font-semibold text-gray-800">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
            <span className="inline-block mt-2 px-3 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full capitalize">{user.role}</span>
          </div>
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center w-full space-x-3 px-4 py-3 text-sm font-medium transition ${
                  activeTab === t.id ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600" : "text-gray-600 hover:bg-gray-50"
                }`}>
                <t.icon size={16} /> <span>{t.label}</span>
              </button>
            ))}
            <Link to="/orders" className="flex items-center w-full space-x-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 border-t">
              <span className="text-gray-400">📦</span> <span>My Orders</span>
            </Link>
            <Link to="/wishlist" className="flex items-center w-full space-x-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50">
              <span className="text-gray-400">♡</span> <span>Wishlist</span>
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="md:col-span-3">
          {activeTab === "info"      && <ProfileInfo user={user} />}
          {activeTab === "addresses" && <AddressBook user={user} />}
          {activeTab === "password"  && <ChangePassword />}
        </div>
      </div>
    </div>
  );
};

export default Profile;
